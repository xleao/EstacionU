import os
import sys

# Add the parent directory to sys.path so we can import 'app'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Sector, Area

sectores_data = [
    "Agriculture, Livestock & Agribusiness",
    "Consulting & Professional Services",
    "Consumer & Retail",
    "Corporate Services & Holding Companies",
    "Education & Research",
    "Energy, Utilities & Natural Resources",
    "Financial Services",
    "Government, Public Sector & Nonprofits",
    "Healthcare & Life Sciences",
    "Hospitality & Tourism",
    "Industrial / Manufacturing",
    "Media, Entertainment & Communications",
    "Real Estate, Construction & Infrastructure",
    "Supply Chain, Logistics & Transportation",
    "Technology",
    "Otros"
]

areas_data = [
    "Customer Service and Support",
    "Data and Analytics",
    "Engineering and Technology",
    "Entrepeneurship",
    "Finance/Accounting",
    "General Management",
    "Human Resources",
    "Marketing/Communications",
    "Operations/SCM",
    "Product Management",
    "Project Management",
    "Research/Academia",
    "Sales/Business Development",
    "Strategy/Consulting",
    "Otros"
]

def seed_catalogs():
    db = SessionLocal()
    try:
        agregados_sec = 0
        agregados_area = 0
        
        # Sectores
        for nombre in sectores_data:
            existe = db.query(Sector).filter(Sector.nombre.ilike(nombre)).first()
            if not existe:
                nuevo = Sector(nombre=nombre)
                db.add(nuevo)
                agregados_sec += 1
                
        # Areas
        for nombre in areas_data:
            existe = db.query(Area).filter(Area.nombre.ilike(nombre)).first()
            if not existe:
                nuevo = Area(nombre=nombre)
                db.add(nuevo)
                agregados_area += 1
                
        db.commit()
        print(f"✅ Se agregaron {agregados_sec} sectores nuevos.")
        print(f"✅ Se agregaron {agregados_area} áreas nuevas.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Iniciando la actualización del catálogo...")
    seed_catalogs()
    print("¡Proceso terminado!")
