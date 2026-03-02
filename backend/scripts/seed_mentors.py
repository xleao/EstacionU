from app import models, database
from app.core import security as auth
from sqlalchemy.orm import Session
import random

def seed_mentors():
    db = database.SessionLocal()
    try:
        # Image pool
        images = [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBaxz6C8NnKYnXi6TZdYtzB2MJ2LyIDUbbXzSBlrF_PZT3lJJzoVSg5SdE1upmVE4Mp6JRKeQkclHf_-RhVZEZIiGUYIMNAxkCR-6ryRhegEy3CmBQzL-f7ilX7e74ZqptRQ3PN5Js6wbhBrVwxO2RpLFztTFMMRIGr2k9W-Aj_RFZKk2yB814nq5fpTIUU2_T-avHSEPsloW3ALZKceObVi36mIei6u8ILKH20dCZ9C9M9I8P2J7ai0TUJlXixYc6CTekTLJzPpIE",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB2SDLufqywIPBrDzRGepsQZIObjzKEdgtTnNkekP0ehDoOndBtdyNnRzgPcWvn_0DHtvAv6Z6dQtnFm0xWh8HSKMxn41kDolLqf2JeVVD206Hk1a9De5RgRLfGukUFx2K5_jTA3SBJenD5WwpIhwa3DKABRhkYxd5KCPqkKcRWvyhfMQR0BYTX8B99cxG882y0tJdASqv2sKS5MlLm0Q7Sbg7FwD0SstHyE_glaOd7FlExU6pWA8VwqLBx01uSiIcd2HQKsTNAVqg",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC3tsnfJBjRYh9yots8WyDhVj4IgvlF8HgmtScc7PWbhez6H5RVpX5IJ3zvkKWxHJrcKPcgr9oeTDmY6WuwVloQyqGeCO4qVgxjJxqwsVtkKKUc1fbwZW68LvYQ9rwjf-EzKdUkYBhrFwraRwBZY0tJWoAYyFcJ5sgdQmbIK_IZHzL2ZMIYr9DFm-Xeu5RXGdkOg52K_ThjSrXd9Mtwl36lLEKV8wnlZO4lmtAWdi-pCu79JmCQS-E1yb9hSmrQYG0-Bs0F86L4Se4"
        ]

        mentors_data = [
            # Original 3
            {
                "email": "johana.surco@estacionu.com",
                "name": "Johana Surco",
                "role": "Sales/Business Development",
                "area": "Real Estate Construction & Infrastructure",
                "bio": "Estrategias comerciales en infraestructura y gestión de grandes cuentas en el sector inmobiliario.",
                "image": images[0],
                "tags": ["B2B Sales", "Real Estate", "Networking"],
                "schedule": "Lunes y miércoles 8pm - 10pm"
            },
            {
                "email": "juan.quispe@estacionu.com",
                "name": "Juan Quispe",
                "role": "Marketing/Comunicaciones",
                "area": "Consumer & Retail",
                "bio": "Estrategias de go-to-market y desarrollo de marca personal en el sector retail.",
                "image": images[1],
                "tags": ["Branding", "Retail"],
                "schedule": "Sábados 6pm - 9pm"
            },
            {
                "email": "ana.martinez@estacionu.com",
                "name": "Ana Martínez",
                "role": "Desarrollo Software",
                "area": "Tecnología",
                "bio": "Arquitectura de microservicios y cómo dar el salto de junior a senior dev.",
                "image": images[2],
                "tags": ["React", "Career Growth", "Agile"],
                "schedule": "Martes 7pm - 9pm"
            },
            # 7 Additional Mentors (Cycling images)
            {
                "email": "carlos.gomez@estacionu.com",
                "name": "Carlos Gomez",
                "role": "Finanzas Corporativas",
                "area": "Banca & Finanzas",
                "bio": "Experto en valoración de empresas y fusiones y adquisiciones en el mercado latinoamericano.",
                "image": images[1], # Juan's image
                "tags": ["Valuation", "M&A", "Finance"],
                "schedule": "Viernes 6pm - 8pm"
            },
            {
                "email": "lucia.fernandez@estacionu.com",
                "name": "Lucía Fernández",
                "role": "Derecho Digital",
                "area": "Legal",
                "bio": "Asesoría legal para startups tecnológicas y protección de datos personales.",
                "image": images[0], # Johana's image
                "tags": ["Legal Tech", "GDPR", "Startups"],
                "schedule": "Jueves 7pm - 9pm"
            },
            {
                "email": "miguel.angel@estacionu.com",
                "name": "Miguel Ángel",
                "role": "UX/UI Design",
                "area": "Diseño",
                "bio": "Diseñando experiencias centradas en el usuario para productos digitales masivos.",
                "image": images[1],
                "tags": ["Figma", "User Research", "Prototyping"],
                "schedule": "Lunes 8pm - 10pm"
            },
            {
                "email": "sofia.lopez@estacionu.com",
                "name": "Sofía López",
                "role": "Data Science",
                "area": "Tecnología",
                "bio": "Transformando datos en insights accionables mediante Machine Learning y Big Data.",
                "image": images[2], # Ana's image
                "tags": ["Python", "SQL", "ML"],
                "schedule": "Miércoles 6pm - 8pm"
            },
            {
                "email": "diego.torres@estacionu.com",
                "name": "Diego Torres",
                "role": "Project Management",
                "area": "Ingeniería",
                "bio": "Gestión de proyectos ágiles y liderazgo de equipos de alto rendimiento.",
                "image": images[1],
                "tags": ["Scrum", "Leadership", "Jira"],
                "schedule": "Martes y Jueves 8pm - 9pm"
            },
            {
                "email": "valery.rivas@estacionu.com",
                "name": "Valery Rivas",
                "role": "Recursos Humanos",
                "area": "People & Culture",
                "bio": "Desarrollo de talento humano y estrategias de cultura organizacional.",
                "image": images[2],
                "tags": ["Recruiting", "Culture", "Soft Skills"],
                "schedule": "Sábados 10am - 12pm"
            },
            {
                "email": "jose.ruiz@estacionu.com",
                "name": "José Ruiz",
                "role": "Operaciones",
                "area": "Logística",
                "bio": "Optimización de cadenas de suministro y logística internacional.",
                "image": images[1],
                "tags": ["Supply Chain", "Logistics", "Operations"],
                "schedule": "Viernes 5pm - 7pm"
            }
        ]

        print("Cleaning existing mentors...")
        db.query(models.MentorProfile).delete()
        for m in mentors_data:
            existing = db.query(models.User).filter(models.User.correo == m["email"]).first()
            if existing:
                if existing.perfil: db.delete(existing.perfil)
                for e in existing.educacion: db.delete(e)
                db.delete(existing)
        db.commit()

        print(f"Seeding {len(mentors_data)} mentors...")
        
        hashed_password = auth.get_password_hash("password123")
        
        for data in mentors_data:
            print(f"Creating {data['name']}...")
            user = models.User(
                correo=data["email"],
                hash_password=hashed_password,
                nombre_completo=data["name"],
                tipo_usuario="mentor"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

            profile = models.UserProfile(
                usuario_id=user.id,
                rol="mentor",
                url_foto=data["image"]
            )
            db.add(profile)

            mentor_profile = models.MentorProfile(
                usuario_id=user.id,
                biografia=data["bio"],
                horario_sugerido=data["schedule"],
                destacado=True
            )
            db.add(mentor_profile)
            
            # Simple Catalog Handling
            sector = db.query(models.Sector).filter(models.Sector.nombre == data["area"]).first()
            if not sector:
                sector = models.Sector(nombre=data["area"])
                db.add(sector)
            
            area_obj = db.query(models.Area).filter(models.Area.nombre == data["role"]).first()
            if not area_obj:
                area_obj = models.Area(nombre=data["role"])
                db.add(area_obj)
            
            db.commit()
            
            mentor_profile.sectores.append(sector)
            mentor_profile.areas.append(area_obj)
            db.commit()

        print("SUCCESS: 10 Mentors seeded.")

    except Exception as e:
        print(f"FAILED: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_mentors()
