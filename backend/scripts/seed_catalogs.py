import os
import sys

# Add the parent directory to sys.path so we can import 'app'
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Sector, Area, Institution, Career, Theme

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

instituciones_data = [
    "UNI",
    "UNMSM",
    "PUCP",
    "UPC",
    "ULima",
    "Otros"
]

carreras_data = [
    "Ingeniería Industrial",
    "Ingeniería de Sistemas",
    "Ingeniería de Software",
    "Ingeniería de Inteligencia Artificial",
    "Administración",
    "Otros"
]

temas_data = [
    "Revisión de CV / Portfolio",
    "Orientación de Carrera",
    "Desarrollo de Habilidades Soft",
    "Networking Estratégico",
    "Insight del Sector Industrial",
    "Tu trabajo y/o linea de carrera",
    "Experiencia en un sector o industria",
    "Orientacion universitaria y/o posgrado",
    "Otro"
]


def seed_catalogs():
    db = SessionLocal()
    try:
        agregados_sec = 0
        agregados_area = 0
        agregados_inst = 0
        agregados_carr = 0
        agregados_tema = 0
        
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

        # Instituciones
        for nombre in instituciones_data:
            existe = db.query(Institution).filter(Institution.nombre.ilike(nombre)).first()
            if not existe:
                nuevo = Institution(nombre=nombre)
                db.add(nuevo)
                agregados_inst += 1

        # Carreras
        for nombre in carreras_data:
            existe = db.query(Career).filter(Career.nombre.ilike(nombre)).first()
            if not existe:
                nuevo = Career(nombre=nombre)
                db.add(nuevo)
                agregados_carr += 1

        # Temas
        for nombre in temas_data:
            existe = db.query(Theme).filter(Theme.nombre.ilike(nombre)).first()
            if not existe:
                nuevo = Theme(nombre=nombre)
                db.add(nuevo)
                agregados_tema += 1
                
        db.commit()
        print(f"✅ Se agregaron {agregados_sec} sectores nuevos.")
        print(f"✅ Se agregaron {agregados_area} áreas nuevas.")
        print(f"✅ Se agregaron {agregados_inst} instituciones nuevas.")
        print(f"✅ Se agregaron {agregados_carr} carreras nuevas.")
        print(f"✅ Se agregaron {agregados_tema} temas de Coffee Chat nuevos.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Iniciando la actualización del catálogo...")
    seed_catalogs()
    print("¡Proceso terminado!")
