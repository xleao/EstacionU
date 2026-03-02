import sys
import os
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from app.database import SessionLocal, engine
from app import models

def delete_user_completely(user_id: int):
    # Obtener la sesión de la bd
    db = SessionLocal()
    
    try:
        # 1. Obtener al usuario
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if not user:
            print(f"[{user_id}] El usuario ya no existe en la base de datos.")
            return False

        print(f"[{user_id}] Eliminando rastro del usuario: {user.correo}...")

        # 2. Si el usuario es estudiante (mentee), eliminar sus citas
        citas_mentee = db.query(models.Appointment).filter(models.Appointment.usuario_mentee_id == user_id).all()
        for cita in citas_mentee:
            db.delete(cita)
        if citas_mentee:
            print(f" - Eliminadas {len(citas_mentee)} citas donde el usuario era mentee.")

        # 3. Si el usuario es un mentor, eliminar todo lo relacionado al mentor_profile
        mentor_profile = db.query(models.MentorProfile).filter(models.MentorProfile.usuario_id == user_id).first()
        if mentor_profile:
            # a) Eliminar las citas donde funge como mentor
            citas_mentor = db.query(models.Appointment).filter(models.Appointment.mentor_id == mentor_profile.id).all()
            for cita in citas_mentor:
                db.delete(cita)
            if citas_mentor:
                print(f" - Eliminadas {len(citas_mentor)} citas donde el usuario era mentor.")

            # b) Eliminar asociaciones secundarias (se limpian las listas para borrar de las tablas bridge)
            mentor_profile.sectores = []
            mentor_profile.areas = []
            mentor_profile.grados = []
            mentor_profile.temas = []
            db.commit() # Asegurar actualización de tablas de enlace

            # c) Eliminar profile_mentor
            print(f" - Eliminando perfil de mentor del usuario...")
            db.delete(mentor_profile)
        
        # 4. Eliminar Perfil de Usuario general
        user_profile = db.query(models.UserProfile).filter(models.UserProfile.usuario_id == user_id).first()
        if user_profile:
            print(f" - Eliminando perfil general del usuario...")
            db.delete(user_profile)

        # 5. Eliminar Educación del Usuario
        user_education = db.query(models.UserEducation).filter(models.UserEducation.usuario_id == user_id).first()
        if user_education:
            print(f" - Eliminando registro de educación del usuario...")
            db.delete(user_education)

        # 6. Eliminar al Usuario en sí
        db.delete(user)
        
        # 7. Commit final
        db.commit()
        print(f"[{user_id}] ¡Usuario eliminado por completo de la base de datos sin dejar rastro!")
        return True

    except Exception as e:
        db.rollback()
        print(f"[{user_id}] ¡Error al intentar eliminar el usuario! Hacindo rollback...")
        print(e)
        return False
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Uso: python delete_user.py <user_id>")
    else:
        try:
            target_id = int(sys.argv[1])
            delete_user_completely(target_id)
        except ValueError:
            print("Por favor, ingresa un ID numérico válido.")
