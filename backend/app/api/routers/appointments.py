from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime as dt, timezone

from app import models
from app.schemas import schemas
from app.api.deps import get_db, get_current_user
from app.services import email_service

router = APIRouter(prefix="/appointments", tags=["appointments"])

@router.post("")
async def create_appointment(
    appointment: schemas.AppointmentCreate,
    background_tasks: BackgroundTasks,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mentor_user = db.query(models.User).filter(models.User.id == appointment.mentor_user_id).first()
    if not mentor_user:
        raise HTTPException(status_code=404, detail="Mentor no encontrado")
    
    mentor_profile = mentor_user.mentor_perfil
    if not mentor_profile:
        mentor_profile = models.MentorProfile(usuario_id=mentor_user.id)
        db.add(mentor_profile)
        db.commit()
        db.refresh(mentor_profile)
        
    try:
        hora_obj = dt.strptime(appointment.hora, '%H:%M').time()
    except ValueError:
        hora_obj = dt.strptime('10:00', '%H:%M').time() 

    new_appt = models.Appointment(
        usuario_mentee_id=current_user.id,
        mentor_id=mentor_profile.id,
        fecha_programada=appointment.fecha,
        hora_programada=hora_obj,
        tema=appointment.tema,
        otro_texto=appointment.mensaje,
        estado='pendiente'
    )
    db.add(new_appt)
    db.commit()
    
    mentor_first_name = mentor_user.nombre_completo.split(" ")[0] if mentor_user.nombre_completo else mentor_user.nombre
    student_full_name = current_user.nombre_completo or f"{current_user.nombre} {current_user.apellidos}"
    formatted_date = new_appt.fecha_programada.strftime('%d de %b, %Y')
    formatted_time = new_appt.hora_programada.strftime('%I:%M %p')
    
    background_tasks.add_task(
        email_service.send_new_coffee_chat_email, 
        to_email=mentor_user.correo, 
        mentor_name=mentor_first_name, 
        student_name=student_full_name, 
        date_str=formatted_date, 
        time_str=formatted_time, 
        tema=appointment.tema,
        mensaje=appointment.mensaje or ""
    )
    
    return {"message": "Sesión agendada exitosamente"}

@router.get("/me")
async def get_my_appointments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    appointments = db.query(models.Appointment).filter(
        models.Appointment.usuario_mentee_id == current_user.id
    ).order_by(models.Appointment.id.desc()).all()
    
    results = []
    for appt in appointments:
        mentor_profile = db.query(models.MentorProfile).filter(models.MentorProfile.id == appt.mentor_id).first()
        if not mentor_profile:
            continue
        mentor_user = db.query(models.User).filter(models.User.id == mentor_profile.usuario_id).first()
        if not mentor_user:
            continue
        
        sector_name = "General"
        if mentor_profile.sectores:
            sector_name = mentor_profile.sectores[0].nombre
            
        image = "https://via.placeholder.com/150"
        if mentor_user.perfil and mentor_user.perfil.url_foto:
            image = mentor_user.perfil.url_foto
            
        mentor_user = appt.mentor.usuario
        mentor_user_profile = mentor_user.perfil
        education = mentor_user.educacion[0] if mentor_user.educacion else None
        
        role = current_user.perfil.rol if current_user.perfil else current_user.tipo_usuario
        
        other_profile = {
            "name": mentor_user.nombre_completo or "Mentor",
            "email": mentor_user.correo,
            "phone": mentor_user_profile.telefono_movil if mentor_user_profile else "",
            "role": "Mentor",
            "linkedin": mentor_user_profile.url_linkedin if mentor_user_profile else "",
            "image": image,
            "bio": mentor_profile.biografia if mentor_profile else "",
            "sector": sector_name,
            "career": education.carrera if education else "",
            "university": education.universidad if education else "",
            "schedule": mentor_profile.horario_sugerido if mentor_profile else "",
            "company": mentor_profile.empresa if mentor_profile else "",
            "company_logo": mentor_profile.url_logo_empresa if mentor_profile else ""
        }
        
        results.append({
            "id": appt.id,
            "mentorName": mentor_user.nombre_completo or "Mentor",
            "mentor_image": image,
            "sector": sector_name,
            "date": f"{appt.fecha_programada.strftime('%a %d, %b')} {appt.hora_programada.strftime('%I:%M %p')}",
            "rawDate": str(appt.fecha_programada),
            "rawHora": appt.hora_programada.strftime('%H:%M'),
            "tema": appt.tema or "",
            "mensaje": appt.otro_texto or "",
            "status": appt.estado,
            "image": image,
            "menteeRole": role,
            "otherProfile": other_profile
        })
    
    return results

@router.get("/mentor")
async def get_mentor_appointments(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mentor_profile = db.query(models.MentorProfile).filter(
        models.MentorProfile.usuario_id == current_user.id
    ).first()
    
    if not mentor_profile:
        raise HTTPException(status_code=404, detail="No se encontró perfil de mentor")
    
    appointments = db.query(models.Appointment).filter(
        models.Appointment.mentor_id == mentor_profile.id
    ).order_by(models.Appointment.fecha_creacion.desc()).all()
    
    results = []
    now = dt.now(timezone.utc)
    
    for appt in appointments:
        mentee = db.query(models.User).filter(models.User.id == appt.usuario_mentee_id).first()
        if not mentee:
            continue
        
        mentee_education = db.query(models.UserEducation).filter(
            models.UserEducation.usuario_id == mentee.id
        ).first()
        
        mentee_profile = db.query(models.UserProfile).filter(
            models.UserProfile.usuario_id == mentee.id
        ).first()
        
        image = f"https://api.dicebear.com/9.x/notionists/svg?seed={mentee.nombre_completo or 'Student'}&backgroundColor=transparent"
        if mentee_profile and mentee_profile.url_foto:
            image = mentee_profile.url_foto
        
        created = appt.fecha_creacion
        if created:
            if created.tzinfo is None:
                from datetime import timezone as tz
                created = created.replace(tzinfo=tz.utc)
            diff = now - created
            hours_ago = diff.total_seconds() / 3600
            if hours_ago < 1:
                time_label = "Hace unos minutos"
            elif hours_ago < 24:
                time_label = f"Hace {int(hours_ago)} hora{'s' if int(hours_ago) != 1 else ''}"
            else:
                days = int(hours_ago / 24)
                time_label = f"Hace {days} día{'s' if days != 1 else ''}"
            is_new = hours_ago < 24
        else:
            time_label = ""
            is_new = False
        
        role = mentee_profile.rol if mentee_profile else mentee.tipo_usuario
        
        other_profile = {
            "name": mentee.nombre_completo or "Estudiante",
            "email": mentee.correo,
            "phone": mentee_profile.telefono_movil if mentee_profile else "",
            "role": role,
            "linkedin": mentee_profile.url_linkedin if mentee_profile else "",
            "image": image,
            "bio": "",
            "sector": "",
            "career": mentee_education.carrera if mentee_education else "",
            "university": mentee_education.universidad if mentee_education else "",
            "schedule": ""
        }
        
        results.append({
            "id": appt.id,
            "menteeName": mentee.nombre_completo or "Estudiante",
            "menteeImage": image,
            "menteeCareer": mentee_education.carrera if mentee_education else "",
            "menteeUniversity": mentee_education.universidad if mentee_education else "",
            "date": f"{appt.fecha_programada.strftime('%a %d, %b')}",
            "time": appt.hora_programada.strftime('%H:%M'),
            "rawDate": str(appt.fecha_programada),
            "rawHora": appt.hora_programada.strftime('%H:%M'),
            "tema": appt.tema or "Coffee Chat",
            "mensaje": appt.otro_texto or "",
            "status": appt.estado,
            "timeLabel": time_label,
            "isNew": is_new,
            "createdAt": str(appt.fecha_creacion) if appt.fecha_creacion else None,
            "menteeRole": role,
            "otherProfile": other_profile
        })
    
    return results

@router.get("/mentor/stats")
async def get_mentor_stats(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    from datetime import date as date_type
    mentor_profile = db.query(models.MentorProfile).filter(
        models.MentorProfile.usuario_id == current_user.id
    ).first()
    
    if not mentor_profile:
        raise HTTPException(status_code=404, detail="No se encontró perfil de mentor")
    
    all_appts = db.query(models.Appointment).filter(
        models.Appointment.mentor_id == mentor_profile.id
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
    
    return {
        "pending": pending,
        "confirmed": confirmed,
        "completed": completed,
        "scheduled": confirmed,
        "total": len(all_appts),
        "nextSession": next_session
    }

@router.put("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: int,
    status_data: dict,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    new_status = status_data.get("estado", "").lower()
    valid_statuses = ["pendiente", "confirmada", "realizada", "cancelada"]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Estado inválido. Opciones: {', '.join(valid_statuses)}")
    
    # Try finding as mentee
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.usuario_mentee_id == current_user.id
    ).first()
    
    if not appt:
        # Try finding as mentor
        mentor_profile = db.query(models.MentorProfile).filter(
            models.MentorProfile.usuario_id == current_user.id
        ).first()
        if mentor_profile:
            appt = db.query(models.Appointment).filter(
                models.Appointment.id == appointment_id,
                models.Appointment.mentor_id == mentor_profile.id
            ).first()
    
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada o no tienes permiso para modificarla.")
    
    appt.estado = new_status
    
    # If marking as completed, save feedback data
    if new_status == 'realizada':
        from datetime import date as date_cls, time as time_cls
        
        # Whether it happened on the scheduled date
        se_dio = status_data.get("se_dio_en_dia_acordado")
        if se_dio is not None:
            appt.se_dio_en_dia_acordado = bool(se_dio)
        
        # Actual date/time if different from scheduled
        fecha_real = status_data.get("fecha_realizada")
        hora_real = status_data.get("hora_realizada")
        
        if se_dio:
            # It happened on the scheduled date
            appt.fecha_realizada = appt.fecha_programada
            appt.hora_realizada = appt.hora_programada
        else:
            if fecha_real:
                try:
                    appt.fecha_realizada = date_cls.fromisoformat(fecha_real)
                except:
                    pass
            if hora_real:
                try:
                    appt.hora_realizada = dt.strptime(hora_real, '%H:%M').time()
                except:
                    pass
        
        # Satisfaction ratings
        cal_general = status_data.get("calificacion_general")
        if cal_general is not None:
            appt.calificacion_general = int(cal_general)
        
        cal_utilidad = status_data.get("calificacion_utilidad")
        if cal_utilidad is not None:
            appt.calificacion_utilidad = int(cal_utilidad)
        
        recomendaria = status_data.get("recomendaria_mentor")
        if recomendaria is not None:
            appt.recomendaria_mentor = bool(recomendaria)
    
    db.commit()
    return {"message": f"Estado actualizado a '{new_status}'", "status": new_status}

@router.delete("/{appointment_id}")
async def delete_appointment(
    appointment_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
     # Try finding as mentee
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.usuario_mentee_id == current_user.id
    ).first()
    
    if not appt:
        # Try finding as mentor
        mentor_profile = db.query(models.MentorProfile).filter(
            models.MentorProfile.usuario_id == current_user.id
        ).first()
        if mentor_profile:
            appt = db.query(models.Appointment).filter(
                models.Appointment.id == appointment_id,
                models.Appointment.mentor_id == mentor_profile.id
            ).first()
            
    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada o no tienes permiso para eliminarla.")
    
    db.delete(appt)
    db.commit()
    return {"message": "Cita eliminada exitosamente"}

@router.put("/{appointment_id}")
async def update_appointment(
    appointment_id: int,
    data: schemas.AppointmentUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
     # Try finding as mentee
    appt = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.usuario_mentee_id == current_user.id
    ).first()
    
    if not appt:
        # Try finding as mentor
        mentor_profile = db.query(models.MentorProfile).filter(
            models.MentorProfile.usuario_id == current_user.id
        ).first()
        if mentor_profile:
            appt = db.query(models.Appointment).filter(
                models.Appointment.id == appointment_id,
                models.Appointment.mentor_id == mentor_profile.id
            ).first()

    if not appt:
        raise HTTPException(status_code=404, detail="Cita no encontrada o no tienes permiso para modificarla.")
    
    if data.fecha is not None:
        appt.fecha_programada = data.fecha
    if data.hora is not None:
        try:
            appt.hora_programada = dt.strptime(data.hora, '%H:%M').time()
        except ValueError:
            raise HTTPException(status_code=400, detail="Formato de hora inválido. Use HH:MM")
    if data.tema is not None:
        appt.tema = data.tema
    if data.mensaje is not None:
        appt.otro_texto = data.mensaje
    
    db.commit()
    return {"message": "Cita actualizada exitosamente"}
