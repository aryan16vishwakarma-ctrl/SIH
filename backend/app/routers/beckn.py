"""
ONDC / Beckn Protocol Adapter Router for KisaanConnect.

NOTE FOR DEVELOPERS / ONDC REVIEWERS:
This module provides a sandbox-ready Beckn Protocol adapter layer (v0.9.4/1.0 compatible envelope format).
It translates Beckn network intents (search, select, init, confirm, status) into KisaanConnect's
internal database operations on Farmers, Products, and Orders, responding with standard Beckn callbacks
(on_search, on_select, on_init, on_confirm, on_status).
This structure prepares the platform for future live gateway registration on the ONDC Network.
"""

from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.farmer import Farmer
from app.models.product import Product
from app.models.buyer import Buyer
from app.models.order import Order, OrderStatus
from app.schemas.beckn import (
    BecknContext,
    BecknSearchPayload,
    BecknSelectPayload,
    BecknInitPayload,
    BecknConfirmPayload,
    BecknStatusPayload,
    BecknResponseEnvelope
)
from app.services.geo import calculate_haversine_distance
from app.services.ws_manager import ws_manager

router = APIRouter(prefix="/api/beckn", tags=["ONDC Beckn Protocol Adapter"])

def build_callback_context(req_context: BecknContext, action_name: str) -> BecknContext:
    return BecknContext(
        domain=req_context.domain,
        country=req_context.country,
        city=req_context.city,
        action=action_name,
        core_version=req_context.core_version,
        bap_id=req_context.bap_id,
        bap_uri=req_context.bap_uri,
        bpp_id="kisaanconnect-seller-bpp",
        bpp_uri="https://api.kisaanconnect.in/api/beckn",
        transaction_id=req_context.transaction_id,
        message_id=req_context.message_id,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )

@router.post("/search", response_model=BecknResponseEnvelope)
async def beckn_search(payload: BecknSearchPayload, db: AsyncSession = Depends(get_db)):
    """
    Beckn Search Intent: Queries active product listings and returns catalog grouped by farmer providers.
    """
    stmt = select(Product).options(selectinload(Product.farmer)).where(Product.is_active == True)
    res = await db.execute(stmt)
    products = res.scalars().all()

    providers_map = {}
    for p in products:
        if not p.farmer:
            continue
        farmer_id_str = str(p.farmer.id)
        if farmer_id_str not in providers_map:
            providers_map[farmer_id_str] = {
                "id": farmer_id_str,
                "descriptor": {
                    "name": p.farmer.name,
                    "code": f"FARMER-{p.farmer.district.upper()}",
                    "symbol": "https://kisaanconnect.in/assets/farmer_icon.png"
                },
                "locations": [{
                    "id": f"LOC-{farmer_id_str}",
                    "gps": f"{p.farmer.latitude},{p.farmer.longitude}",
                    "address": {
                        "door": p.farmer.village,
                        "city": p.farmer.district,
                        "state": p.farmer.state
                    }
                }],
                "items": []
            }
        
        providers_map[farmer_id_str]["items"].append({
            "id": str(p.id),
            "descriptor": {
                "name": p.crop_name,
                "category": p.category,
                "description": p.description or f"Fresh {p.crop_name} direct from farmer"
            },
            "price": {
                "currency": "INR",
                "value": str(p.price_per_kg)
            },
            "quantity": {
                "available": {
                    "count": int(p.quantity_kg)
                },
                "maximum": {
                    "count": int(p.quantity_kg)
                }
            },
            "matched": True
        })

    on_search_message = {
        "catalog": {
            "bpp/descriptor": {
                "name": "KisaanConnect Direct Farmer Network BPP"
            },
            "bpp/providers": list(providers_map.values())
        }
    }

    return BecknResponseEnvelope(
        context=build_callback_context(payload.context, "on_search"),
        message=on_search_message
    )

@router.post("/select", response_model=BecknResponseEnvelope)
async def beckn_select(payload: BecknSelectPayload, db: AsyncSession = Depends(get_db)):
    """
    Beckn Select Intent: Validates item availability and computes price breakdown quote.
    """
    items_selected = payload.message.order.items
    quote_breakdown = []
    total_value = 0.0
    last_product = None

    for item in items_selected:
        item_id = item.get("id")
        try:
            prod_uuid = UUID(item_id)
        except Exception:
            raise HTTPException(status_code=400, detail=f"Invalid item id: {item_id}")
        
        stmt = select(Product).where(Product.id == prod_uuid)
        res = await db.execute(stmt)
        product = res.scalar_one_or_none()

        if not product or not product.is_active:
            raise HTTPException(status_code=404, detail=f"Item {item_id} unavailable")

        last_product = product
        qty = item.get("quantity", {}).get("count", 1)
        item_total = product.price_per_kg * qty
        total_value += item_total

        quote_breakdown.append({
            "title": product.crop_name,
            "price": {
                "currency": "INR",
                "value": str(round(item_total, 2))
            },
            "item_id": str(product.id),
            "quantity": qty
        })

    on_select_message = {
        "order": {
            "provider": {
                "id": str(last_product.farmer_id) if last_product else "provider-1"
            },
            "items": items_selected,
            "quote": {
                "price": {
                    "currency": "INR",
                    "value": str(round(total_value, 2))
                },
                "breakdown": quote_breakdown
            }
        }
    }

    return BecknResponseEnvelope(
        context=build_callback_context(payload.context, "on_select"),
        message=on_select_message
    )

@router.post("/init", response_model=BecknResponseEnvelope)
async def beckn_init(payload: BecknInitPayload, db: AsyncSession = Depends(get_db)):
    """
    Beckn Init Intent: Generates draft order with delivery details.
    """
    order_req = payload.message.order
    on_init_message = {
        "order": {
            "provider": order_req.get("provider", {}),
            "items": order_req.get("items", []),
            "billing": order_req.get("billing", {
                "name": "KisaanConnect Buyer",
                "phone": "+919876543210"
            }),
            "fulfillment": {
                "type": "Home-Delivery",
                "tracking": False,
                "state": {
                    "descriptor": {
                        "name": "Draft Created"
                    }
                }
            },
            "quote": order_req.get("quote", {})
        }
    }

    return BecknResponseEnvelope(
        context=build_callback_context(payload.context, "on_init"),
        message=on_init_message
    )

@router.post("/confirm", response_model=BecknResponseEnvelope)
async def beckn_confirm(payload: BecknConfirmPayload, db: AsyncSession = Depends(get_db)):
    """
    Beckn Confirm Intent: Creates real Order row in database and returns confirmed order payload.
    """
    order_req = payload.message.order
    items = order_req.get("items", [])

    if not items:
        raise HTTPException(status_code=400, detail="No items specified in confirmation payload")

    first_item = items[0]
    prod_uuid = UUID(first_item["id"])
    stmt = select(Product).options(selectinload(Product.farmer)).where(Product.id == prod_uuid)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    res_buyer = await db.execute(select(Buyer))
    buyer = res_buyer.scalars().first()
    if not buyer:
        raise HTTPException(status_code=400, detail="No registered buyer found to associate Beckn order")

    qty_ordered = float(first_item.get("quantity", {}).get("count", 10.0))
    dist_km = calculate_haversine_distance(
        product.farmer.latitude if product.farmer else 20.0,
        product.farmer.longitude if product.farmer else 73.0,
        buyer.latitude, buyer.longitude
    )

    db_order = Order(
        product_id=product.id,
        buyer_id=buyer.id,
        quantity_ordered_kg=qty_ordered,
        total_price=round(qty_ordered * product.price_per_kg, 2),
        delivery_distance_km=dist_km,
        estimated_delivery_days=2,
        status=OrderStatus.CONFIRMED
    )
    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    # Trigger WebSocket notification
    await ws_manager.send_to_user(str(product.farmer_id), {
        "event": "beckn_order_confirmed",
        "order_id": str(db_order.id),
        "status": "CONFIRMED"
    })

    on_confirm_message = {
        "order": {
            "id": str(db_order.id),
            "state": "CONFIRMED",
            "items": items,
            "created_at": db_order.created_at.isoformat() + "Z",
            "fulfillment": {
                "tracking_id": f"TRACK-{db_order.id}",
                "status": "Order Confirmed - Dispatch Pending"
            }
        }
    }

    return BecknResponseEnvelope(
        context=build_callback_context(payload.context, "on_confirm"),
        message=on_confirm_message
    )

@router.post("/status", response_model=BecknResponseEnvelope)
async def beckn_status(payload: BecknStatusPayload, db: AsyncSession = Depends(get_db)):
    """
    Beckn Status Intent: Queries current status of an existing Beckn order.
    """
    order_id_str = payload.message.order_id
    try:
        order_uuid = UUID(order_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid order_id UUID")

    res = await db.execute(select(Order).where(Order.id == order_uuid))
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    on_status_message = {
        "order": {
            "id": str(order.id),
            "state": order.status.value.upper(),
            "quantity_kg": order.quantity_ordered_kg,
            "total_price": order.total_price,
            "estimated_delivery_days": order.estimated_delivery_days
        }
    }

    return BecknResponseEnvelope(
        context=build_callback_context(payload.context, "on_status"),
        message=on_status_message
    )
