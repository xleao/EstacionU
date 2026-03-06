from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session
import os
import shutil
import uuid

from app import models
from app.schemas import schemas
from app.api.deps import get_db, get_current_user
from app.core import security
from app.ws_manager import manager
from app.services import email_service

router = APIRouter(tags=["users"])

@router.get("/users/me")
async def read_users_me(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.perfil
    education = current_user.educacion[0] if current_user.educacion else None
    
    parts = current_user.nombre_completo.split(" ", 1) if current_user.nombre_completo else ["", ""]
    nombre = parts[0] if parts else ""
    apellidos = parts[1] if len(parts) > 1 else ""

    mentor_profile = current_user.mentor_perfil
    sector = mentor_profile.sectores[0].nombre if mentor_profile and mentor_profile.sectores else ""
    area = mentor_profile.areas[0].nombre if mentor_profile and mentor_profile.areas else ""

    # Onboarding requires BOTH a real assigned role AND a real university
    # If tipo_usuario is 'usuario' (default for new Google users), onboarding is NEVER complete
    UNASSIGNED_ROLES = ('usuario', 'user', '', None)
    has_real_role = current_user.tipo_usuario not in UNASSIGNED_ROLES
    uni = education.universidad if education else ""
    has_real_uni = bool(uni and uni not in ("Pendiente", "Completada", ""))
    onboarding_done = has_real_role and has_real_uni

    # Featured mentor application status
    solicitud_status = None
    if mentor_profile:
        latest_solicitud = db.query(models.DestacadoSolicitud).filter(
            models.DestacadoSolicitud.mentor_perfil_id == mentor_profile.id
        ).order_by(models.DestacadoSolicitud.fecha_solicitud.desc()).first()
        if latest_solicitud:
            solicitud_status = latest_solicitud.status

    return {
        "id": current_user.id,
        "nombre": nombre,
        "apellidos": apellidos,
        "nombre_completo": current_user.nombre_completo,
        "email": current_user.correo,
        "role": current_user.tipo_usuario,
        "telefono_movil": profile.telefono_movil if profile else "",
        "fecha_nacimiento": profile.fecha_nacimiento if profile else None,
        "genero": profile.genero if profile else "",
        "url_linkedin": profile.url_linkedin if profile else "",
        "url_foto": profile.url_foto if profile else "",
        "universidad": education.universidad if education else "",
        "carrera": education.carrera if education else "",
        "anio_inicio": education.anio_inicio if education else None,
        "anio_fin": education.anio_fin if education else None,
        "biografia": mentor_profile.biografia if mentor_profile else "",
        "horario_sugerido": mentor_profile.horario_sugerido if mentor_profile else "",
        "empresa": mentor_profile.empresa if mentor_profile else "",
        "url_logo_empresa": mentor_profile.url_logo_empresa if mentor_profile else "",
        "sector_nombre": sector,
        "area_nombre": area,
        "onboarding_completo": onboarding_done,
        "destacado": mentor_profile.destacado if mentor_profile else False,
        "bloqueado_destacado": mentor_profile.bloqueado_destacado if mentor_profile else False,
        "solicitud_status": solicitud_status,
        "disponibilidades": [
            {"dia": d.dia, "hora_inicio": d.hora_inicio, "hora_fin": d.hora_fin}
            for d in (mentor_profile.disponibilidades if mentor_profile else [])
        ]
    }

@router.put("/users/me/profile")
async def update_user_profile(
    profile_data: schemas.UserProfileUpdate, 
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if profile_data.nombre_completo is not None:
        current_user.nombre_completo = profile_data.nombre_completo

    profile = current_user.perfil
    if not profile:
        profile = models.UserProfile(usuario_id=current_user.id, rol=current_user.tipo_usuario)
        db.add(profile)
        db.commit()
        db.refresh(current_user)
        profile = current_user.perfil
    
    if profile_data.telefono_movil is not None:
        profile.telefono_movil = profile_data.telefono_movil
    if profile_data.fecha_nacimiento is not None:
        profile.fecha_nacimiento = profile_data.fecha_nacimiento
    if profile_data.genero is not None:
        profile.genero = profile_data.genero
    if profile_data.url_linkedin is not None:
        profile.url_linkedin = profile_data.url_linkedin
    if profile_data.url_foto is not None:
        profile.url_foto = profile_data.url_foto

    education = current_user.educacion[0] if current_user.educacion else None
    if not education:
        education = models.UserEducation(usuario_id=current_user.id)
        db.add(education)
        db.commit()
        db.refresh(current_user)
        education = current_user.educacion[0] if current_user.educacion else None
    
    if education:
        if profile_data.universidad is not None:
            education.universidad = profile_data.universidad
        if profile_data.carrera is not None:
            education.carrera = profile_data.carrera
        if profile_data.anio_inicio is not None:
            education.anio_inicio = profile_data.anio_inicio
        if profile_data.anio_fin is not None:
            education.anio_fin = profile_data.anio_fin

    if current_user.tipo_usuario == 'mentor':
        mentor_profile = current_user.mentor_perfil
        if not mentor_profile:
            mentor_profile = models.MentorProfile(usuario_id=current_user.id)
            db.add(mentor_profile)
            db.commit()
            db.refresh(current_user)
            mentor_profile = current_user.mentor_perfil

        if profile_data.biografia is not None:
            mentor_profile.biografia = profile_data.biografia
        if profile_data.horario_sugerido is not None:
            mentor_profile.horario_sugerido = profile_data.horario_sugerido
        if profile_data.empresa is not None:
            mentor_profile.empresa = profile_data.empresa
        if profile_data.url_logo_empresa is not None:
            mentor_profile.url_logo_empresa = profile_data.url_logo_empresa
            
        if profile_data.sector_nombre is not None:
            if profile_data.sector_nombre.strip() == "":
                mentor_profile.sectores = []
            else:
                sector = db.query(models.Sector).filter(models.Sector.nombre == profile_data.sector_nombre).first()
                if not sector:
                    sector = models.Sector(nombre=profile_data.sector_nombre)
                    db.add(sector)
                    db.commit()
                    db.refresh(sector)
                mentor_profile.sectores = [sector]
            
        if profile_data.area_nombre is not None:
            if profile_data.area_nombre.strip() == "":
                mentor_profile.areas = []
            else:
                area = db.query(models.Area).filter(models.Area.nombre == profile_data.area_nombre).first()
                if not area:
                    area = models.Area(nombre=profile_data.area_nombre)
                    db.add(area)
                    db.commit()
                    db.refresh(area)
                mentor_profile.areas = [area]
            
        if profile_data.disponibilidades is not None:
            # Delete old availabilities
            current_user.mentor_perfil.disponibilidades = []
            db.commit() # Clear them first
            
            # Add new ones
            for disp in profile_data.disponibilidades:
                new_disp = models.MentorAvailability(
                    mentor_id=mentor_profile.id,
                    dia=disp.dia,
                    hora_inicio=disp.hora_inicio,
                    hora_fin=disp.hora_fin
                )
                db.add(new_disp)

    db.commit()
    
    # Broadcast to connected clients that a mentor profile has been updated
    if current_user.tipo_usuario in ['mentor', 'graduate', 'egresado']:
        await manager.broadcast("mentors_updated")

    return {"message": "Profile updated successfully"}

@router.post("/users/me/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png"]:
        raise HTTPException(status_code=400, detail="Solo se permiten imagenes JPG y PNG")
    
    # Create filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = f"static/uploads/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen: {str(e)}")
    
    # Generate URL relative to the proxy
    image_url = f"/api/static/uploads/{filename}"
    
    # Update profile
    profile = current_user.perfil
    if not profile:
        profile = models.UserProfile(usuario_id=current_user.id, rol=current_user.tipo_usuario)
        db.add(profile)
        db.commit()
        db.refresh(current_user)
        profile = current_user.perfil
        
    profile.url_foto = image_url
    db.commit()
    
    # Broadcast to connected clients that a mentor profile picture has been updated
    if current_user.tipo_usuario in ['mentor', 'graduate', 'egresado']:
        await manager.broadcast("mentors_updated")
    
    return {"url_foto": image_url}

@router.delete("/users/me/profile-picture")
async def delete_profile_picture(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    profile = current_user.perfil
    if profile:
        profile.url_foto = None
        db.commit()
        
    if current_user.tipo_usuario in ['mentor', 'graduate', 'egresado']:
        await manager.broadcast("mentors_updated")
        
    return {"message": "Profile picture deleted successfully"}

@router.post("/users/me/company-logo")
async def upload_company_logo(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Validate file type
    if file.content_type not in ["image/jpeg", "image/png", "image/webp", "image/svg+xml"]:
        raise HTTPException(status_code=400, detail="Solo se permiten imagenes JPG, PNG, WEBP y SVG")
    
    # Create filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"company_{uuid.uuid4()}{file_ext}"
    file_path = f"static/uploads/{filename}"
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar el logo: {str(e)}")
    
    # Generate URL relative to the proxy
    logo_url = f"/api/static/uploads/{filename}"
    
    # Update mentor profile
    mentor_profile = current_user.mentor_perfil
    if not mentor_profile:
        mentor_profile = models.MentorProfile(usuario_id=current_user.id)
        db.add(mentor_profile)
        db.commit()
        db.refresh(current_user)
        mentor_profile = current_user.mentor_perfil
    
    mentor_profile.url_logo_empresa = logo_url
    db.commit()
    
    # Broadcast update
    await manager.broadcast("mentors_updated")
    
    return {"url_logo_empresa": logo_url}

@router.put("/users/me/password")
async def update_password(
    password_data: schemas.PasswordChange,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not security.verify_password(password_data.current_password, current_user.hash_password):
        raise HTTPException(status_code=400, detail="Contraseña actual incorrecta")
    
    current_user.hash_password = security.get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Contraseña actualizada exitosamente"}

@router.put("/users/me/role")
async def update_user_role(
    role_data: schemas.RoleSelection,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    allowed_roles = ['estudiante', 'mentor']
    if role_data.role not in allowed_roles:
        raise HTTPException(status_code=400, detail="Rol no válido. Debe ser 'estudiante' o 'mentor'.")

    # Update user type
    current_user.tipo_usuario = role_data.role
    
    # Update profile role
    profile = current_user.perfil
    if profile:
        profile.rol = role_data.role

    # Update education - keep 'Pendiente' as flag that onboarding is not yet complete
    education = current_user.educacion[0] if current_user.educacion else None
    if education:
        education.universidad = "Pendiente"

    # If mentor, create MentorProfile if not exists
    if role_data.role == 'mentor':
        mentor_profile = current_user.mentor_perfil
        if not mentor_profile:
            mentor_profile = models.MentorProfile(usuario_id=current_user.id)
            db.add(mentor_profile)

    db.commit()
    return {"message": "Rol actualizado exitosamente", "role": role_data.role}

@router.post("/users/me/destacado")
async def apply_for_destacado(
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.tipo_usuario != 'mentor':
        raise HTTPException(status_code=400, detail="Solo los mentores pueden ser destacados.")
    
    mentor_profile = current_user.mentor_perfil
    if not mentor_profile:
        raise HTTPException(status_code=400, detail="Perfil de mentor no encontrado.")
    
    if mentor_profile.destacado:
        raise HTTPException(status_code=400, detail="Ya eres un mentor destacado.")
    
    if mentor_profile.bloqueado_destacado:
        raise HTTPException(status_code=403, detail="Tu acceso a nuevas solicitudes de mentor destacado ha sido restringido por un administrador.")

    # Check required fields
    if not mentor_profile.sectores or not mentor_profile.areas or \
       not str(mentor_profile.biografia or '').strip() or \
       not str(mentor_profile.empresa or '').strip() or \
       not mentor_profile.url_logo_empresa or \
       not mentor_profile.disponibilidades:
        raise HTTPException(
            status_code=400, 
            detail="Debes completar: Sector, Área, Mensaje de mentoría, Empresa, Logo y Horarios para aplicar."
        )

    # Check if there's already a pending request
    existing = db.query(models.DestacadoSolicitud).filter(
        models.DestacadoSolicitud.mentor_perfil_id == mentor_profile.id,
        models.DestacadoSolicitud.status == "pendiente"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Ya tienes una solicitud pendiente de revisión.")

    # Create new solicitud
    solicitud = models.DestacadoSolicitud(
        mentor_perfil_id=mentor_profile.id,
        status="pendiente"
    )
    db.add(solicitud)
    db.commit()
    
    # Send email to Admin
    background_tasks.add_task(
        email_service.send_destacado_notification_email, 
        "leaoll1729@gmail.com", 
        current_user.nombre_completo, 
        current_user.correo
    )
    
    # Send email to Mentor
    background_tasks.add_task(
        email_service.send_destacado_confirmation_email, 
        current_user.correo, 
        current_user.nombre_completo
    )
    
    return {"message": "¡Solicitud enviada! El equipo la revisará en 24-72 horas.", "status": "pendiente"}

@router.delete("/users/me/destacado")
async def cancel_destacado_solicitation(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.tipo_usuario != 'mentor':
         raise HTTPException(status_code=400, detail="Solo mentores pueden tener solicitudes.")
    
    mentor_profile = current_user.mentor_perfil
    if not mentor_profile:
        raise HTTPException(status_code=400, detail="Perfil de mentor no encontrado.")
    
    solicitation = db.query(models.DestacadoSolicitud).filter(
        models.DestacadoSolicitud.mentor_perfil_id == mentor_profile.id,
        models.DestacadoSolicitud.status == "pendiente"
    ).first()
    
    if not solicitation:
        raise HTTPException(status_code=404, detail="No tienes una solicitud pendiente para cancelar.")
    
    solicitation.status = "cancelada"
    db.commit()
    
    return {"message": "Solicitud cancelada correctamente."}



@router.get("/mentors")
def get_mentors(db: Session = Depends(get_db)):
    users = db.query(models.User).join(models.MentorProfile).filter(
        models.User.tipo_usuario == "mentor",
        models.MentorProfile.destacado == True
    ).all()
    mentors_list = []
    
    for user in users:
        mentor_profile = user.mentor_perfil
        user_profile = user.perfil
        
        sector_name = "General"
        area_name = "Mentoría"
        bio = "Disponible para mentorías."
        tags = ["Mentor"]
        schedule = "Horario por coordinar"
        image = "https://via.placeholder.com/150"

        if mentor_profile:
            if mentor_profile.sectores: 
                sector_name = mentor_profile.sectores[0].nombre
                tags = [s.nombre for s in mentor_profile.sectores]
            if mentor_profile.areas:
                area_name = mentor_profile.areas[0].nombre
                tags.extend([a.nombre for a in mentor_profile.areas])
            tags = tags[:3]
            if mentor_profile.biografia: bio = mentor_profile.biografia
            if mentor_profile.horario_sugerido: schedule = mentor_profile.horario_sugerido
        
        if user_profile:
            if user_profile.url_foto: image = user_profile.url_foto
            if not mentor_profile and user_profile.rol:
                area_name = user_profile.rol

        if tags == ["Mentor"]: tags = ["Estación U"]

        mentors_list.append({
            "id": user.id,
            "name": user.nombre_completo or "Mentor",
            "celular": user_profile.telefono_movil if user_profile else None,
            "area": sector_name,
            "role": area_name,
            "bio": bio,
            "tags": tags,
            "image": image,
            "schedule": schedule,
            "empresa": mentor_profile.empresa if mentor_profile else None,
            "url_logo_empresa": mentor_profile.url_logo_empresa if mentor_profile else None,
            "linkedin_url": user_profile.url_linkedin if user_profile and user_profile.url_linkedin else None,
            "disponibilidades": [
                {"dia": d.dia, "hora_inicio": d.hora_inicio, "hora_fin": d.hora_fin}
                for d in (mentor_profile.disponibilidades if mentor_profile else [])
            ]
        })
        
    return mentors_list

@router.get("/appointments/me/stats")
async def get_student_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import date as date_type
    
    all_appts = db.query(models.Appointment).filter(
        models.Appointment.usuario_mentee_id == current_user.id
    ).all()
    
    pending = sum(1 for a in all_appts if a.estado == 'pendiente')
    confirmed = sum(1 for a in all_appts if a.estado in ('confirmada', 'confirmado'))
    completed = sum(1 for a in all_appts if a.estado == 'realizada')
    
    upcoming = [a for a in all_appts if a.estado in ('confirmada', 'confirmado') and a.fecha_programada >= date_type.today()]
    upcoming.sort(key=lambda a: (a.fecha_programada, a.hora_programada))
    next_session = None
    if upcoming:
        next_appt = upcoming[0]
        next_session = f"{next_appt.fecha_programada.strftime('%d %b')}, {next_appt.hora_programada.strftime('%H:%M')}"
    
    total_mentors = db.query(models.User).filter(models.User.tipo_usuario == "mentor").count()
    
    return {
        "pending": pending,
        "confirmed": confirmed,
        "completed": completed,
        "scheduled": confirmed,
        "total": len(all_appts),
        "nextSession": next_session,
        "total_mentors": total_mentors
    }
