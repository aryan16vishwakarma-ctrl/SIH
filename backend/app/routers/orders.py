from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.buyer import Buyer
from app.models.farmer import Farmer
from app.models.product import Product
from app.models.order import Order, OrderStatus
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse
from app.schemas.product import ProductResponse
from app.schemas.buyer import BuyerResponse
from app.services.auth_service import get_current_buyer, get_current_user
from app.services.geo import calculate_haversine_distance
from app.services.ws_manager import ws_manager

router = APIRouter(tags=["Orders"])

def calculate_delivery_days(distance_km: float) -> int:
    if distance_km < 20.0:
        return 1
    elif distance_km < 100.0:
        return 2
    elif distance_km < 300.0:
        return 3
    else:
        return 5

@router.websocket("/api/ws/orders/{user_id}")
async def websocket_orders_endpoint(websocket: WebSocket, user_id: str):
    """
    WebSocket endpoint for real-time order status change notifications.
    """
    await ws_manager.connect(user_id, websocket)
    try:
        while True:
            # Keep connection open & listen for client ping/messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(user_id, websocket)
    except Exception:
        ws_manager.disconnect(user_id, websocket)

@router.post("/api/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_in: OrderCreate,
    current_buyer: Buyer = Depends(get_current_buyer),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).options(selectinload(Product.farmer)).where(Product.id == order_in.product_id)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()

    if not product or not product.is_active:
        raise HTTPException(status_code=404, detail="Product not found or inactive")

    if order_in.quantity_ordered_kg <= 0:
        raise HTTPException(status_code=400, detail="Quantity ordered must be greater than zero")

    if order_in.quantity_ordered_kg > product.quantity_kg:
        raise HTTPException(
            status_code=400,
            detail=f"Requested quantity ({order_in.quantity_ordered_kg} kg) exceeds available stock ({product.quantity_kg} kg)"
        )

    if not product.farmer:
        raise HTTPException(status_code=404, detail="Product farmer details not found")

    dist_km = calculate_haversine_distance(
        product.farmer.latitude, product.farmer.longitude,
        current_buyer.latitude, current_buyer.longitude
    )
    est_days = calculate_delivery_days(dist_km)
    total_price = round(order_in.quantity_ordered_kg * product.price_per_kg, 2)

    db_order = Order(
        product_id=product.id,
        buyer_id=current_buyer.id,
        quantity_ordered_kg=order_in.quantity_ordered_kg,
        total_price=total_price,
        delivery_distance_km=dist_km,
        estimated_delivery_days=est_days,
        status=OrderStatus.PENDING
    )

    product.quantity_kg -= order_in.quantity_ordered_kg
    if product.quantity_kg <= 0:
        product.is_active = False

    db.add(db_order)
    await db.commit()
    await db.refresh(db_order)

    # Notify farmer via WebSocket of new order
    await ws_manager.send_to_user(
        str(product.farmer_id),
        {
            "event": "new_order",
            "order_id": str(db_order.id),
            "status": db_order.status.value,
            "crop_name": product.crop_name,
            "total_price": total_price
        }
    )

    res_out = OrderResponse.model_validate(db_order)
    res_out.product = ProductResponse.model_validate(product)
    res_out.buyer = BuyerResponse.model_validate(current_buyer)
    return res_out

@router.get("/api/orders/farmer/{farmer_id}", response_model=List[OrderResponse])
async def get_farmer_orders(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Order)
        .join(Product)
        .options(selectinload(Order.product), selectinload(Order.buyer))
        .where(Product.farmer_id == farmer_id)
    )
    res = await db.execute(stmt)
    orders = res.scalars().all()
    
    results = []
    for o in orders:
        item = OrderResponse.model_validate(o)
        if o.product:
            item.product = ProductResponse.model_validate(o.product)
        if o.buyer:
            item.buyer = BuyerResponse.model_validate(o.buyer)
        results.append(item)
    return results

@router.get("/api/orders/buyer/{buyer_id}", response_model=List[OrderResponse])
async def get_buyer_orders(buyer_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Order)
        .options(selectinload(Order.product), selectinload(Order.buyer))
        .where(Order.buyer_id == buyer_id)
    )
    res = await db.execute(stmt)
    orders = res.scalars().all()

    results = []
    for o in orders:
        item = OrderResponse.model_validate(o)
        if o.product:
            item.product = ProductResponse.model_validate(o.product)
        if o.buyer:
            item.buyer = BuyerResponse.model_validate(o.buyer)
        results.append(item)
    return results

@router.patch("/api/orders/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    status_update: OrderStatusUpdate,
    current_user_info: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Order).options(selectinload(Order.product), selectinload(Order.buyer)).where(Order.id == order_id)
    res = await db.execute(stmt)
    order = res.scalar_one_or_none()

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = status_update.status
    await db.commit()
    await db.refresh(order)

    # Broadcast real-time order update via WebSocket to farmer and buyer
    update_event = {
        "event": "order_update",
        "order_id": str(order.id),
        "status": order.status.value,
        "product_id": str(order.product_id),
        "total_price": order.total_price
    }

    if order.product and order.product.farmer_id:
        await ws_manager.send_to_user(str(order.product.farmer_id), update_event)
    await ws_manager.send_to_user(str(order.buyer_id), update_event)

    res_out = OrderResponse.model_validate(order)
    if order.product:
        res_out.product = ProductResponse.model_validate(order.product)
    if order.buyer:
        res_out.buyer = BuyerResponse.model_validate(order.buyer)
    return res_out
