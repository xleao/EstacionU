from app import models, database
from sqlalchemy.orm import Session
import random

def update_existing_mentors():
    db = database.SessionLocal()
    try:
        users = db.query(models.User).filter(models.User.tipo_usuario == "mentor").all()
        print(f"Updating {len(users)} existing mentors...")

        # Image pool (High quality)
        images = [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBaxz6C8NnKYnXi6TZdYtzB2MJ2LyIDUbbXzSBlrF_PZT3lJJzoVSg5SdE1upmVE4Mp6JRKeQkclHf_-RhVZEZIiGUYIMNAxkCR-6ryRhegEy3CmBQzL-f7ilX7e74ZqptRQ3PN5Js6wbhBrVwxO2RpLFztTFMMRIGr2k9W-Aj_RFZKk2yB814nq5fpTIUU2_T-avHSEPsloW3ALZKceObVi36mIei6u8ILKH20dCZ9C9M9I8P2J7ai0TUJlXixYc6CTekTLJzPpIE",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB2SDLufqywIPBrDzRGepsQZIObjzKEdgtTnNkekP0ehDoOndBtdyNnRzgPcWvn_0DHtvAv6Z6dQtnFm0xWh8HSKMxn41kDolLqf2JeVVD206Hk1a9De5RgRLfGukUFx2K5_jTA3SBJenD5WwpIhwa3DKABRhkYxd5KCPqkKcRWvyhfMQR0BYTX8B99cxG882y0tJdASqv2sKS5MlLm0Q7Sbg7FwD0SstHyE_glaOd7FlExU6pWA8VwqLBx01uSiIcd2HQKsTNAVqg",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuC3tsnfJBjRYh9yots8WyDhVj4IgvlF8HgmtScc7PWbhez6H5RVpX5IJ3zvkKWxHJrcKPcgr9oeTDmY6WuwVloQyqGeCO4qVgxjJxqwsVtkKKUc1fbwZW68LvYQ9rwjf-EzKdUkYBhrFwraRwBZY0tJWoAYyFcJ5sgdQmbIK_IZHzL2ZMIYr9DFm-Xeu5RXGdkOg52K_ThjSrXd9Mtwl36lLEKV8wnlZO4lmtAWdi-pCu79JmCQS-E1yb9hSmrQYG0-Bs0F86L4Se4"
        ]
        
        roles = ["Sales/Business", "Marketing", "Desarrollo Software", "Finanzas", "Legal", "UX/UI Design", "Data Science", "Project Mgmt", "RRHH", "Operaciones"]
        areas = ["Real Estate", "Consumer", "Tecnología", "Banca", "Legal", "Diseño", "Ingeniería", "People", "Logística"]
        
        for i, user in enumerate(users):
            # Ensure UserProfile exists
            if not user.perfil:
                print(f"Creating profile for {user.nombre_completo}")
                profile = models.UserProfile(usuario_id=user.id, rol="mentor")
                db.add(profile)
                user.perfil = profile
            
            # Update photo cyclically
            user.perfil.url_foto = images[i % 3]
            
            # Ensure MentorProfile exists
            if not user.mentor_perfil:
                print(f"Creating mentor profile for {user.nombre_completo}")
                mentor_profile = models.MentorProfile(
                    usuario_id=user.id,
                    biografia=f"Experto en {roles[i % len(roles)]} con amplia experiencia internacional.",
                    horario_sugerido="Horario por coordinar",
                    destacado=True
                )
                db.add(mentor_profile)
                
                # Add dummy Area/Sector
                sector_name = areas[i % len(areas)]
                role_name = roles[i % len(roles)]
                
                sector = db.query(models.Sector).filter(models.Sector.nombre == sector_name).first()
                if not sector:
                    sector = models.Sector(nombre=sector_name)
                    db.add(sector)
                    
                area_obj = db.query(models.Area).filter(models.Area.nombre == role_name).first()
                if not area_obj:
                    area_obj = models.Area(nombre=role_name)
                    db.add(area_obj)
                
                db.commit() # Commit new sectors/areas first
                
                mentor_profile.sectores.append(sector)
                mentor_profile.areas.append(area_obj)
            
            else:
                # Update existing mentor profile if needed (e.g. if photo was missing, maybe bio is too?)
                if not user.mentor_perfil.sectores:
                    s_name = areas[i % len(areas)]
                    sector = db.query(models.Sector).filter(models.Sector.nombre == s_name).first() or models.Sector(nombre=s_name)
                    db.add(sector)
                    user.mentor_perfil.sectores.append(sector)
                
                if not user.mentor_perfil.areas:
                    a_name = roles[i % len(roles)]
                    area_obj = db.query(models.Area).filter(models.Area.nombre == a_name).first() or models.Area(nombre=a_name)
                    db.add(area_obj)
                    user.mentor_perfil.areas.append(area_obj)

        db.commit()
        print("SUCCESS: Mentors updated with photos and data.")

    except Exception as e:
        print(f"FAILED: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    update_existing_mentors()
