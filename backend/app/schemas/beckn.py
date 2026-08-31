from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class BecknContext(BaseModel):
    domain: str = "nic2004:52110"
    country: str = "IND"
    city: str = "std:080"
    action: str
    core_version: str = "0.9.4"
    bap_id: str = "kisaanconnect-buyer-app.com"
    bap_uri: str = "https://kisaanconnect-buyer-app.com/protocol/v1"
    bpp_id: Optional[str] = "kisaanconnect-seller-plugin.com"
    bpp_uri: Optional[str] = "https://kisaanconnect-seller-plugin.com/protocol/v1"
    transaction_id: str
    message_id: str
    timestamp: str

class BecknIntentItem(BaseModel):
    descriptor: Optional[Dict[str, Any]] = None

class BecknIntent(BaseModel):
    item: Optional[BecknIntentItem] = None
    category: Optional[Dict[str, Any]] = None
    fulfillment: Optional[Dict[str, Any]] = None

class BecknSearchMessage(BaseModel):
    intent: Optional[BecknIntent] = None

class BecknSearchPayload(BaseModel):
    context: BecknContext
    message: Optional[BecknSearchMessage] = None

class BecknSelectOrder(BaseModel):
    items: List[Dict[str, Any]]

class BecknSelectMessage(BaseModel):
    order: BecknSelectOrder

class BecknSelectPayload(BaseModel):
    context: BecknContext
    message: BecknSelectMessage

class BecknInitMessage(BaseModel):
    order: Dict[str, Any]

class BecknInitPayload(BaseModel):
    context: BecknContext
    message: BecknInitMessage

class BecknConfirmMessage(BaseModel):
    order: Dict[str, Any]

class BecknConfirmPayload(BaseModel):
    context: BecknContext
    message: BecknConfirmMessage

class BecknStatusMessage(BaseModel):
    order_id: str

class BecknStatusPayload(BaseModel):
    context: BecknContext
    message: BecknStatusMessage

class BecknResponseEnvelope(BaseModel):
    context: BecknContext
    message: Dict[str, Any]
