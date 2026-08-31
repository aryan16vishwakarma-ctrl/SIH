import os
import sys
import asyncio
from datetime import datetime
from sqlalchemy import select

# Add root directory to python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import engine, AsyncSessionLocal, Base
from app.models.farmer import Farmer
from app.models.buyer import Buyer, BuyerType
from app.models.product import Product, ProductCategory
from app.models.order import Order, OrderStatus
from app.services.auth_service import get_password_hash
from app.services.geo import calculate_haversine_distance

async def seed_database():
    print("Initializing async database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async with AsyncSessionLocal() as db:
        try:
            res_farmer = await db.execute(select(Farmer))
            if len(res_farmer.scalars().all()) > 0:
                print("Database already contains data. Skipping seed script.")
                return

            print("Seeding sample farmers...")
            default_pwd_hash = get_password_hash("password123")

            farmers_data = [
                {"name": "Ramesh Patil", "phone": "9823011111", "village": "Pimplegaon", "district": "Nashik", "state": "Maharashtra", "latitude": 20.1700, "longitude": 73.9800, "fpo_name": "Sahyadri Farmers Producer Co"},
                {"name": "Suresh Shinde", "phone": "9823022222", "village": "Ozar", "district": "Nashik", "state": "Maharashtra", "latitude": 20.0900, "longitude": 73.9200, "fpo_name": "Nashik Agro FPO"},
                {"name": "Harpreet Singh", "phone": "9814033333", "village": "Jagraon", "district": "Ludhiana", "state": "Punjab", "latitude": 30.7800, "longitude": 75.4800, "fpo_name": "Malwa Grain Producers"},
                {"name": "Gurdeep Gill", "phone": "9814044444", "village": "Khanna", "district": "Ludhiana", "state": "Punjab", "latitude": 30.7000, "longitude": 76.2200, "fpo_name": "Punjab Wheat Collective"},
                {"name": "Venkat Rao", "phone": "9848055555", "village": "Tenali", "district": "Guntur", "state": "Andhra Pradesh", "latitude": 16.2400, "longitude": 80.6400, "fpo_name": "Guntur Chilli & Spice FPO"},
                {"name": "Koteswara Reddy", "phone": "9848066666", "village": "Bapatla", "district": "Guntur", "state": "Andhra Pradesh", "latitude": 15.9000, "longitude": 80.4700, "fpo_name": "Andhra Pulse Growers"},
                {"name": "Manjunath Gowda", "phone": "9845077777", "village": "Malur", "district": "Kolar", "state": "Karnataka", "latitude": 13.0000, "longitude": 77.9400, "fpo_name": "Kolar Red Tomato FPO"},
                {"name": "Venkateshappa", "phone": "9845088888", "village": "Bangarapet", "district": "Kolar", "state": "Karnataka", "latitude": 12.9800, "longitude": 78.1800, "fpo_name": "Silk & Dairy Farmer Group"},
                {"name": "Devinder Sharma", "phone": "9816099999", "village": "Theog", "district": "Shimla", "state": "Himachal Pradesh", "latitude": 31.1200, "longitude": 77.3500, "fpo_name": "Apple Valley FPO"},
                {"name": "Sunder Lal", "phone": "9816000000", "village": "Kotkhai", "district": "Shimla", "state": "Himachal Pradesh", "latitude": 31.1100, "longitude": 77.5300, "fpo_name": "Himachal Fruit Orchards"}
            ]

            farmers = []
            for f in farmers_data:
                farmer = Farmer(
                    name=f["name"],
                    phone=f["phone"],
                    password_hash=default_pwd_hash,
                    village=f["village"],
                    district=f["district"],
                    state=f["state"],
                    latitude=f["latitude"],
                    longitude=f["longitude"],
                    fpo_name=f["fpo_name"]
                )
                db.add(farmer)
                farmers.append(farmer)
            
            await db.commit()
            for f in farmers:
                await db.refresh(f)
            
            print(f"Inserted {len(farmers)} sample farmers.")

            print("Seeding sample buyers...")
            buyers_data = [
                {"name": "FreshMart Supermarket", "phone": "9900011111", "buyer_type": BuyerType.BULK_BUYER, "latitude": 19.0760, "longitude": 72.8777},
                {"name": "Anita Sharma", "phone": "9900022222", "buyer_type": BuyerType.CONSUMER, "latitude": 28.6139, "longitude": 77.2090},
                {"name": "Bengaluru Organic Hub", "phone": "9900033333", "buyer_type": BuyerType.BULK_BUYER, "latitude": 12.9716, "longitude": 77.5946},
                {"name": "Rajesh Kumar", "phone": "9900044444", "buyer_type": BuyerType.CONSUMER, "latitude": 18.5204, "longitude": 73.8567},
                {"name": "AgroProcure India Pvt Ltd", "phone": "9900055555", "buyer_type": BuyerType.BULK_BUYER, "latitude": 17.3850, "longitude": 78.4867}
            ]

            buyers = []
            for b in buyers_data:
                buyer = Buyer(
                    name=b["name"],
                    phone=b["phone"],
                    password_hash=default_pwd_hash,
                    buyer_type=b["buyer_type"],
                    latitude=b["latitude"],
                    longitude=b["longitude"]
                )
                db.add(buyer)
                buyers.append(buyer)
            
            await db.commit()
            for b in buyers:
                await db.refresh(b)
            
            print(f"Inserted {len(buyers)} sample buyers.")

            print("Seeding 20 sample products across categories...")
            products_data = [
                # Vegetables
                {"farmer": farmers[0], "crop_name": "Red Onion", "category": ProductCategory.VEGETABLES, "quantity_kg": 5000.0, "price_per_kg": 24.0, "fair_price_suggested": 26.0, "mandi_reference_price": 18.0, "harvest_date": "2026-08-20", "description": "Export quality Nashik red onions with long shelf life."},
                {"farmer": farmers[1], "crop_name": "Fresh Tomato", "category": ProductCategory.VEGETABLES, "quantity_kg": 2000.0, "price_per_kg": 28.0, "fair_price_suggested": 30.0, "mandi_reference_price": 20.0, "harvest_date": "2026-08-25", "description": "Farm-fresh ripe tomatoes harvested daily."},
                {"farmer": farmers[6], "crop_name": "Hybrid Tomato", "category": ProductCategory.VEGETABLES, "quantity_kg": 3500.0, "price_per_kg": 26.0, "fair_price_suggested": 28.0, "mandi_reference_price": 19.0, "harvest_date": "2026-08-22", "description": "Firm skin Kolar tomatoes suitable for bulk shipment."},
                {"farmer": farmers[6], "crop_name": "Green Capsicum", "category": ProductCategory.VEGETABLES, "quantity_kg": 800.0, "price_per_kg": 45.0, "fair_price_suggested": 48.0, "mandi_reference_price": 35.0, "harvest_date": "2026-08-24", "description": "Polyhouse grown shiny green bell peppers."},

                # Grains
                {"farmer": farmers[2], "crop_name": "Sharbati Wheat", "category": ProductCategory.GRAINS, "quantity_kg": 10000.0, "price_per_kg": 32.0, "fair_price_suggested": 34.0, "mandi_reference_price": 26.0, "harvest_date": "2026-07-15", "description": "Premium golden Sharbati wheat grains from Punjab fields."},
                {"farmer": farmers[3], "crop_name": "Basmati Rice 1121", "category": ProductCategory.GRAINS, "quantity_kg": 8000.0, "price_per_kg": 85.0, "fair_price_suggested": 90.0, "mandi_reference_price": 70.0, "harvest_date": "2026-07-10", "description": "Aromatic extra-long grain Basmati rice."},
                {"farmer": farmers[3], "crop_name": "Yellow Maize", "category": ProductCategory.GRAINS, "quantity_kg": 6000.0, "price_per_kg": 22.0, "fair_price_suggested": 24.0, "mandi_reference_price": 17.0, "harvest_date": "2026-08-01", "description": "Sun-dried yellow maize suitable for feed and starch processing."},

                # Fruits
                {"farmer": farmers[8], "crop_name": "Royal Delicious Apple", "category": ProductCategory.FRUITS, "quantity_kg": 4000.0, "price_per_kg": 95.0, "fair_price_suggested": 105.0, "mandi_reference_price": 75.0, "harvest_date": "2026-08-15", "description": "Freshly plucked crisp Shimla Royal Delicious apples."},
                {"farmer": farmers[9], "crop_name": "Green Apple (Granny Smith)", "category": ProductCategory.FRUITS, "quantity_kg": 1500.0, "price_per_kg": 120.0, "fair_price_suggested": 130.0, "mandi_reference_price": 90.0, "harvest_date": "2026-08-18", "description": "Tangy and juicy green apples from high altitude orchards."},
                {"farmer": farmers[0], "crop_name": "Thompson Seedless Grapes", "category": ProductCategory.FRUITS, "quantity_kg": 2500.0, "price_per_kg": 60.0, "fair_price_suggested": 65.0, "mandi_reference_price": 45.0, "harvest_date": "2026-08-10", "description": "Sweet seedless green grapes grown in Nashik vineyards."},
                {"farmer": farmers[7], "crop_name": "Robusta Banana", "category": ProductCategory.FRUITS, "quantity_kg": 5000.0, "price_per_kg": 18.0, "fair_price_suggested": 20.0, "mandi_reference_price": 13.0, "harvest_date": "2026-08-26", "description": "Naturally ripened G9 Robusta banana bunches."},

                # Dairy
                {"farmer": farmers[7], "crop_name": "A2 Cow Milk", "category": ProductCategory.DAIRY, "quantity_kg": 300.0, "price_per_kg": 55.0, "fair_price_suggested": 58.0, "mandi_reference_price": 42.0, "harvest_date": "2026-08-30", "description": "Pure unadulterated Gir cow A2 milk delivered fresh."},
                {"farmer": farmers[1], "crop_name": "Pure Desi Buffalo Ghee", "category": ProductCategory.DAIRY, "quantity_kg": 100.0, "price_per_kg": 650.0, "fair_price_suggested": 680.0, "mandi_reference_price": 520.0, "harvest_date": "2026-08-20", "description": "Traditionally bilona churned aromatic desi ghee."},

                # Pulses & Spices
                {"farmer": farmers[4], "crop_name": "Guntur Red Chilli (S334)", "category": ProductCategory.PULSES, "quantity_kg": 3000.0, "price_per_kg": 160.0, "fair_price_suggested": 175.0, "mandi_reference_price": 130.0, "harvest_date": "2026-08-05", "description": "High pungency sun-dried Guntur red chillies."},
                {"farmer": farmers[4], "crop_name": "Turmeric Fingers", "category": ProductCategory.PULSES, "quantity_kg": 2000.0, "price_per_kg": 110.0, "fair_price_suggested": 120.0, "mandi_reference_price": 85.0, "harvest_date": "2026-07-28", "description": "Curcumin-rich polished dry turmeric fingers."},
                {"farmer": farmers[5], "crop_name": "Desi Chana (Chickpea)", "category": ProductCategory.PULSES, "quantity_kg": 4000.0, "price_per_kg": 65.0, "fair_price_suggested": 70.0, "mandi_reference_price": 52.0, "harvest_date": "2026-08-12", "description": "Unpolished organic brown chickpea (Desi Chana)."},
                {"farmer": farmers[5], "crop_name": "Toor Dal (Pigeon Pea)", "category": ProductCategory.PULSES, "quantity_kg": 3000.0, "price_per_kg": 115.0, "fair_price_suggested": 125.0, "mandi_reference_price": 95.0, "harvest_date": "2026-08-02", "description": "Latur grade unpolished protein-dense Toor Dal."},

                # Extra Varieties
                {"farmer": farmers[2], "crop_name": "Yellow Mustard Seed", "category": ProductCategory.PULSES, "quantity_kg": 2500.0, "price_per_kg": 72.0, "fair_price_suggested": 78.0, "mandi_reference_price": 58.0, "harvest_date": "2026-08-14", "description": "High oil content bold yellow mustard seeds."},
                {"farmer": farmers[8], "crop_name": "Himachal Garlic", "category": ProductCategory.VEGETABLES, "quantity_kg": 1200.0, "price_per_kg": 140.0, "fair_price_suggested": 155.0, "mandi_reference_price": 110.0, "harvest_date": "2026-08-10", "description": "Big clove hill garlic with rich pungent aroma."},
                {"farmer": farmers[9], "crop_name": "Walnut In-Shell", "category": ProductCategory.FRUITS, "quantity_kg": 800.0, "price_per_kg": 280.0, "fair_price_suggested": 300.0, "mandi_reference_price": 220.0, "harvest_date": "2026-08-01", "description": "Thin shell organic Kashmiri/Himachal walnuts."}
            ]

            products = []
            for p in products_data:
                product = Product(
                    farmer_id=p["farmer"].id,
                    crop_name=p["crop_name"],
                    category=p["category"],
                    quantity_kg=p["quantity_kg"],
                    price_per_kg=p["price_per_kg"],
                    fair_price_suggested=p["fair_price_suggested"],
                    mandi_reference_price=p["mandi_reference_price"],
                    harvest_date=p["harvest_date"],
                    description=p["description"],
                    is_active=True
                )
                db.add(product)
                products.append(product)
            
            await db.commit()
            for p in products:
                await db.refresh(p)
            
            print(f"Inserted {len(products)} sample products.")

            print("Seeding 5 sample orders...")
            orders_data = [
                {"product": products[0], "buyer": buyers[0], "qty": 500.0, "status": OrderStatus.CONFIRMED},
                {"product": products[1], "buyer": buyers[3], "qty": 50.0, "status": OrderStatus.PENDING},
                {"product": products[4], "buyer": buyers[2], "qty": 1000.0, "status": OrderStatus.FULFILLED},
                {"product": products[7], "buyer": buyers[1], "qty": 20.0, "status": OrderStatus.CONFIRMED},
                {"product": products[13], "buyer": buyers[4], "qty": 200.0, "status": OrderStatus.PENDING}
            ]

            for od in orders_data:
                prod = od["product"]
                buy = od["buyer"]
                res_f = await db.execute(select(Farmer).where(Farmer.id == prod.farmer_id))
                farmer = res_f.scalar_one_or_none()

                dist = calculate_haversine_distance(
                    farmer.latitude, farmer.longitude,
                    buy.latitude, buy.longitude
                )
                est_days = 1 if dist < 20 else (2 if dist < 100 else 4)

                order = Order(
                    product_id=prod.id,
                    buyer_id=buy.id,
                    quantity_ordered_kg=od["qty"],
                    total_price=round(od["qty"] * prod.price_per_kg, 2),
                    delivery_distance_km=dist,
                    estimated_delivery_days=est_days,
                    status=od["status"]
                )
                db.add(order)

            await db.commit()
            print("Successfully seeded sample orders.")
            print("\nSeed completion status: SUCCESS! Ready for hackathon demo.")

        except Exception as e:
            await db.rollback()
            print(f"Error seeding database: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(seed_database())
