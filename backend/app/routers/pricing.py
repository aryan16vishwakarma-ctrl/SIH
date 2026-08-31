from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.schemas.product import FairPriceSuggestRequest, FairPriceSuggestResponse
from app.services.fair_price import get_instant_estimate, get_ai_estimate_stream

router = APIRouter(prefix="/api/pricing", tags=["Pricing"])

@router.post("/suggest", response_model=FairPriceSuggestResponse)
async def suggest_fair_price_instant(payload: FairPriceSuggestRequest):
    """
    Instant microsecond fair price estimate (<100ms response time).
    Never blocks on external API calls.
    """
    pricing_data = get_instant_estimate(
        crop_name=payload.crop_name,
        quantity_kg=payload.quantity_kg,
        district=payload.district
    )
    return FairPriceSuggestResponse(**pricing_data)

@router.get("/suggest/stream")
async def suggest_fair_price_stream(
    crop_name: str = Query(..., description="Crop name e.g. Tomato"),
    quantity_kg: float = Query(..., description="Quantity in kg"),
    district: str = Query(..., description="District e.g. Nashik")
):
    """
    Server-Sent Events (SSE) streaming endpoint for live AI pricing reasoning & final JSON output.
    """
    return StreamingResponse(
        get_ai_estimate_stream(crop_name, quantity_kg, district),
        media_type="text/event-stream"
    )
