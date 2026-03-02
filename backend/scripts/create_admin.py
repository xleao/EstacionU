from app.database import SessionLocal
from app import models
from app.core import security
import sys
from sqlalchemy import text

def create_admin(correo, password, nombre):
    db = SessionLocal()
    try:
        # Drop the check constraint if it exists (for Postgres)
        try:
            db.execute(text("ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_tipo_usuario_check"))
            db.execute(text("ALTER TABLE perfiles_usuario DROP CONSTRAINT IF EXISTS perfiles_usuario_rol_check"))
            db.commit()
            print("Restricciones eliminadas para permitir admins.")
        except Exception:
            db.rollback()

        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.correo == correo).first()
        if existing_user:
            print(f"El usuario con correo {correo} ya existe.")
            return

        # Hash password
        hashed_password = security.get_password_hash(password)

        # Create user
        new_user = models.User(
            correo=correo,
            hash_password=hashed_password,
            nombre_completo=nombre,
            tipo_usuario='admin'
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Create profile
        new_profile = models.UserProfile(
            usuario_id=new_user.id,
            rol='admin',
            telefono_movil='',
            genero=''
        )
        db.add(new_profile)

        # Create education (optional, but good for consistency)
        new_education = models.UserEducation(
            usuario_id=new_user.id,
            universidad='LovePoints Admin',
            carrera='Admin',
            anio_inicio=2024,
            anio_fin=2024
        )
        db.add(new_education)

        db.commit()
        print(f"🎉 Cuenta admin creada exitosamente: {correo}")

    except Exception as e:
        print(f"❌ Error al crear admin: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Uso: python create_admin.py <correo> <contraseña> <nombre_completo>")
        sys.argv = [sys.argv[0], "admin@estacionu.com", "Admin123!", "Administrador General"]
        print(f"Ejecutando con valores por defecto:\nCorreo: {sys.argv[1]}\nClave: {sys.argv[2]}\nNombre: {sys.argv[3]}\n")

    create_admin(sys.argv[1], sys.argv[2], sys.argv[3])
