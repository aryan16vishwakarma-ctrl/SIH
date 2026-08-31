from uuid import UUID
from typing import List, Optional
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db, AsyncSessionLocal
from app.models.farmer import Farmer
from app.models.product import Product, ProductCategory
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.services.auth_service import get_current_farmer
from app.services.fair_price import get_instant_estimate, get_ai_estimate
from app.services.geo import calculate_haversine_distance
from app.services.cache import get_cached_products, set_cached_products, clear_product_cache

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/products", tags=["Products"])

async def background_update_ai_pricing(product_id: UUID, crop_name: str, quantity_kg: float, district: str):
    """
    Background Task: Refines product pricing asynchronously via Groq AI without blocking API response.
    """
    try:
        pricing_info = get_ai_estimate(crop_name=crop_name, quantity_kg=quantity_kg, district=district)
        async with AsyncSessionLocal() as session:
            res = await session.execute(select(Product).where(Product.id == product_id))
            product = res.scalar_one_or_none()
            if product:
                product.fair_price_suggested = pricing_info.get("fair_farmer_price")
                product.mandi_reference_price = pricing_info.get("mandi_reference_price")
                await session.commit()
                clear_product_cache()
                logger.info(f"Background AI pricing update complete for product {product_id}")
    except Exception as e:
        logger.error(f"Error in background AI pricing update for product {product_id}: {e}")

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_in: ProductCreate,
    background_tasks: BackgroundTasks,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    # Get instant microsecond price estimate
    instant_pricing = get_instant_estimate(
        crop_name=product_in.crop_name,
        quantity_kg=product_in.quantity_kg,
        district=current_farmer.district
    )

    fair_suggested = instant_pricing.get("fair_farmer_price")
    mandi_ref = instant_pricing.get("mandi_reference_price")

    db_product = Product(
        farmer_id=current_farmer.id,
        crop_name=product_in.crop_name,
        category=product_in.category,
        quantity_kg=product_in.quantity_kg,
        price_per_kg=product_in.price_per_kg,
        fair_price_suggested=fair_suggested,
        mandi_reference_price=mandi_ref,
        harvest_date=product_in.harvest_date,
        description=product_in.description,
        is_active=True
    )
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)

    # Invalidate listing cache
    clear_product_cache()

    # Non-blocking AI pricing refinement in background
    background_tasks.add_task(
        background_update_ai_pricing,
        product_id=db_product.id,
        crop_name=product_in.crop_name,
        quantity_kg=product_in.quantity_kg,
        district=current_farmer.district
    )

    res = ProductResponse.model_validate(db_product)
    res.farmer = current_farmer
    return res

@router.get("", response_model=List[ProductResponse])
async def get_products(
    category: Optional[ProductCategory] = Query(None, description="Filter by crop category"),
    search: Optional[str] = Query(None, description="Search crop name or description"),
    lat: Optional[float] = Query(None, description="Latitude for spatial proximity search"),
    lng: Optional[float] = Query(None, description="Longitude for spatial proximity search"),
    radius_km: Optional[float] = Query(None, description="Radius limit in km"),
    db: AsyncSession = Depends(get_db)
):
    cache_key = f"{category}:{search}:{lat}:{lng}:{radius_km}"
    cached = get_cached_products(cache_key)
    if cached:
        return cached

    stmt = select(Product).options(selectinload(Product.farmer)).where(Product.is_active == True)

    if category:
        stmt = stmt.where(Product.category == category)
    
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(Product.crop_name.ilike(search_pattern))

    res = await db.execute(stmt)
    products = res.scalars().all()
    results = []

    for product in products:
        item = ProductResponse.model_validate(product)
        if product.farmer:
            item.farmer = product.farmer
        
        if lat is not None and lng is not None and product.farmer:
            dist = calculate_haversine_distance(
                lat, lng,
                product.farmer.latitude, product.farmer.longitude
            )
            item.distance_km = dist

            if radius_km is not None and dist > radius_km:
                continue

        results.append(item)

    if lat is not None and lng is not None:
        results.sort(key=lambda p: p.distance_km if p.distance_km is not None else float("inf"))

    # Cache response for 30s
    set_cached_products(cache_key, results)
    return results

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = select(Product).options(selectinload(Product.farmer)).where(Product.id == product_id)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    item = ProductResponse.model_validate(product)
    if product.farmer:
        item.farmer = product.farmer
    return item

@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_update: ProductUpdate,
    current_farmer: Farmer = Depends(get_current_farmer),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Product).options(selectinload(Product.farmer)).where(Product.id == product_id)
    res = await db.execute(stmt)
    product = res.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.farmer_id != current_farmer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own products"
        )
    
    update_data = product_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(product, field, value)

    await db.commit()
    await db.refresh(product)
    clear_product_cache()

    item = ProductResponse.model_validate(product)
    if product.farmer:
        item.farmer = product.farmer
    return item
