from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.api.deps import get_current_user, get_current_admin, get_db
from datetime import datetime, timedelta
from app.core import security
from app.services import email_service
import calendar

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/dashboard-stats")
def get_dashboard_stats(
    days: int = Query(15, description="Days to track for evolution chart"),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)):
    # --- Core user metrics (all from DB) ---
    total_users = db.query(models.User).count()
    total_mentors = db.query(models.UserProfile).filter(models.UserProfile.rol == "mentor").count()
    total_students = db.query(models.UserProfile).filter(models.UserProfile.rol == "estudiante").count()

    now = datetime.now()
    thirty_days_ago = now - timedelta(days=30)
    
    new_users_30d = db.query(models.User).filter(models.User.fecha_creacion >= thirty_days_ago).count()
    user_growth_rate = round((new_users_30d / max(1, (total_users - new_users_30d))) * 100, 1)

    # New mentors in last 30 days
    new_mentors_30d = (
        db.query(models.User)
        .join(models.UserProfile, models.User.id == models.UserProfile.usuario_id)
        .filter(
            models.UserProfile.rol == "mentor",
            models.User.fecha_creacion >= thirty_days_ago
        )
        .count()
    )

    # --- Appointment metrics from DB ---

    # Status Bar Chart data: Citas count by status
    pending = db.query(models.Appointment).filter(models.Appointment.estado == "pendiente").count()
    confirmed = db.query(models.Appointment).filter(models.Appointment.estado == "confirmada").count()
    completed = db.query(models.Appointment).filter(models.Appointment.estado == "realizada").count()
    cancelled = db.query(models.Appointment).filter(models.Appointment.estado == "cancelada").count()

    total_sessions = pending + confirmed + completed + cancelled
    successful_sessions = completed
    success_rate = round((successful_sessions / max(1, total_sessions)) * 100, 1)

    # Evolution Chart (Registrations vs Appointments)
    days_labels = []
    reg_data = []
    app_data = []
    
    if days == 180:
        # Group by months for 180 days
        months_to_track = 6
        for i in range(months_to_track - 1, -1, -1):
            target_date = now - timedelta(days=30*i)
            start_date = target_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            _, last_day = calendar.monthrange(target_date.year, target_date.month)
            end_date = target_date.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)
            
            meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
            month_label = meses[target_date.month - 1]
            days_labels.append(month_label)
            
            regs = db.query(models.User).filter(models.User.fecha_creacion >= start_date, models.User.fecha_creacion <= end_date).count()
            apps = db.query(models.Appointment).filter(models.Appointment.fecha_creacion >= start_date, models.Appointment.fecha_creacion <= end_date).count()
            
            reg_data.append(regs)
            app_data.append(apps)
    elif days == 60:
        # Group by 10 days for 60 days
        for i in range(5, -1, -1):
            end_days_ago = i * 10
            start_days_ago = end_days_ago + 9
            
            target_start = now - timedelta(days=start_days_ago)
            target_end = now - timedelta(days=end_days_ago)
            
            start_date = target_start.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = target_end.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            day_label = f"{target_start.strftime('%d/%m')} - {target_end.strftime('%d/%m')}"
            days_labels.append(day_label)
            
            regs = db.query(models.User).filter(models.User.fecha_creacion >= start_date, models.User.fecha_creacion <= end_date).count()
            apps = db.query(models.Appointment).filter(models.Appointment.fecha_creacion >= start_date, models.Appointment.fecha_creacion <= end_date).count()
            
            reg_data.append(regs)
            app_data.append(apps)
    else:
        # Group by days for 7, 15, 30 days
        for i in range(days - 1, -1, -1):
            target_date = now - timedelta(days=i)
            start_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            day_label = target_date.strftime("%d/%m")
            days_labels.append(day_label)
            
            regs = db.query(models.User).filter(models.User.fecha_creacion >= start_date, models.User.fecha_creacion <= end_date).count()
            apps = db.query(models.Appointment).filter(models.Appointment.fecha_creacion >= start_date, models.Appointment.fecha_creacion <= end_date).count()
            
            reg_data.append(regs)
            app_data.append(apps)

    # Fetch Top Sectors with names
    sectors_count = db.execute(
        func.current_timestamp()
    ) # Dummy query to just execute. We'll manually count below or use raw SQL.
    
    # Sector Doughnut
    sector_counts = db.query(models.Sector.nombre, func.count(models.mentor_sector.c.mentor_id))\
        .join(models.mentor_sector, models.Sector.id == models.mentor_sector.c.sector_id)\
        .group_by(models.Sector.nombre).all()
        
    sector_labels = [s[0] for s in sector_counts] if sector_counts else ['Tech', 'Finanzas', 'Marketing', 'Construcción', 'Otros']
    sector_data = [s[1] for s in sector_counts] if sector_counts else [40, 15, 10, 25, 10]

    # Degree Pie
    degree_counts = db.query(models.Grade.nombre, func.count(models.mentor_grado.c.mentor_id))\
        .join(models.mentor_grado, models.Grade.id == models.mentor_grado.c.grado_id)\
        .group_by(models.Grade.nombre).all()
        
    degree_labels = [d[0] for d in degree_counts] if degree_counts else ['Bachelor', 'Master', 'PhD', 'Bootcamp']
    degree_data = [d[1] for d in degree_counts] if degree_counts else [55, 30, 5, 10]
    
    # Topics Bar
    topic_counts = db.query(models.Theme.nombre, func.count(models.MentorTema.mentor_id))\
        .join(models.MentorTema, models.Theme.id == models.MentorTema.tema_id)\
        .group_by(models.Theme.nombre).limit(7).all()
        
    topic_labels = [t[0] for t in topic_counts] if topic_counts else ['Carrera Tech', 'Soft Skills', 'Emprendimiento', 'Data Science', 'Networking', 'UX Design', 'Liderazgo']
    topic_data = [t[1] for t in topic_counts] if topic_counts else [850, 720, 640, 590, 480, 390, 210]

    # Gather real activity feed (last 6: Mix between users and appointments)
    recent_activities: list[dict] = []
    
    recent_users = db.query(models.User).order_by(models.User.fecha_creacion.desc()).limit(3).all()
    for u in recent_users:
        rol = u.tipo_usuario if u.tipo_usuario else "Usuario"
        color = "blue" if rol == "estudiante" else ("slate" if rol == "mentor" else "purple")
        icon = "person_add" if rol == "estudiante" else "verified"
        recent_activities.append({
            "type": "user", "icon": icon, 
            "title": f"Registro de {rol.capitalize()}", 
            "desc": f"{u.nombre_completo or u.correo} se unió", 
            "time": u.fecha_creacion.strftime("%d/%m %H:%M") if u.fecha_creacion else "Reciente",
            "color": color,
            "created_at": u.fecha_creacion or datetime.min
        })

    recent_apps = db.query(models.Appointment).order_by(models.Appointment.fecha_creacion.desc()).limit(5).all()
    for a in recent_apps:
        if a.estado == "pendiente":
            color, icon, title = "amber", "event", "Solicitud enviada"
        elif a.estado == "confirmada":
            color, icon, title = "blue", "thumb_up", "Cita confirmada"
        elif a.estado == "realizada":
            color, icon, title = "green", "check_circle", "Sesión completada"
        else:
            color, icon, title = "red", "cancel", "Cita cancelada"
            
        recent_activities.append({
            "type": "appointment", "icon": icon, 
            "title": title, 
            "desc": f"Tema: {a.tema or 'Sin tema'}", 
            "time": a.fecha_creacion.strftime("%d/%m %H:%M") if a.fecha_creacion else "Reciente",
            "color": color,
            "created_at": a.fecha_creacion or datetime.min
        })

    # Sort descending by creation date and pick top 6
    recent_activities.sort(key=lambda x: x["created_at"], reverse=True)
    recent_activities = recent_activities[:5]
    
    # Clean up the object before response
    for act in recent_activities:
        del act["created_at"]
        
    if not recent_activities:
        # Fallback if DB is completely empty
        recent_activities = [
            {"type": "info", "icon": "info", "title": "Sin actividad", "desc": "Aún no hay actividad en la plataforma.", "time": "Justo ahora", "color": "slate"}
        ]

    # --- Active students: at least one appointment as mentee ---
    students_with_session = (
        db.query(models.Appointment.usuario_mentee_id)
        .distinct()
        .count()
    )
    active_students_percent = round(
        (students_with_session / max(1, total_students)) * 100, 1
    )
    # --- Sessions by Topic (from citas.tema) ---
    sessions_by_topic = db.query(
        models.Appointment.tema,
        func.count(models.Appointment.id).label("count")
    ).filter(
        models.Appointment.tema != None,
        models.Appointment.tema != ""
    ).group_by(models.Appointment.tema).order_by(func.count(models.Appointment.id).desc()).limit(8).all()

    session_topic_labels = [t[0] for t in sessions_by_topic] if sessions_by_topic else ["Sin datos"]
    session_topic_data = [t[1] for t in sessions_by_topic] if sessions_by_topic else [0]

    # --- Top Mentors (most appointments) ---
    top_mentors_query = db.query(
        models.User.nombre_completo,
        func.count(models.Appointment.id).label("total_sessions")
    ).join(
        models.MentorProfile, models.MentorProfile.usuario_id == models.User.id
    ).join(
        models.Appointment, models.Appointment.mentor_id == models.MentorProfile.id
    ).group_by(models.User.nombre_completo).order_by(func.count(models.Appointment.id).desc()).limit(5).all()

    top_mentors = [{"name": m[0] or "Sin nombre", "sessions": m[1]} for m in top_mentors_query] if top_mentors_query else []

    # --- Quick facts for sidebar cards ---
    total_universities = (
        db.query(models.UserEducation.universidad)
        .filter(models.UserEducation.universidad.isnot(None))
        .distinct()
        .count()
    )
    total_careers = (
        db.query(models.UserEducation.carrera)
        .filter(models.UserEducation.carrera.isnot(None))
        .distinct()
        .count()
    )
    total_sectors = db.query(models.Sector).count()
    total_topics = db.query(models.Theme).count()
    avg_sessions_per_mentor = round(total_sessions / max(1, total_mentors), 1)
    avg_sessions_per_active_student = round(total_sessions / max(1, students_with_session), 1)
    mentor_student_ratio = round(total_students / max(1, total_mentors), 1)

    # --- Progress / avance stats (different angles, same DB) ---
    seven_days_ago = now - timedelta(days=7)
    appointments_last_7d = db.query(models.Appointment).filter(
        models.Appointment.fecha_creacion >= seven_days_ago
    ).count()

    mentors_with_availability = (
        db.query(models.MentorProfile.id)
        .join(models.MentorAvailability, models.MentorAvailability.mentor_id == models.MentorProfile.id)
        .distinct()
        .count()
    )

    profiles_with_linkedin = db.query(models.UserProfile).filter(
        models.UserProfile.url_linkedin.isnot(None),
        models.UserProfile.url_linkedin != ""
    ).count()

    cancellation_rate = round((cancelled / max(1, total_sessions)) * 100, 1)

    # This month vs last month (citas)
    first_day_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    first_day_last_month = (first_day_this_month.replace(day=1) - timedelta(days=1)).replace(day=1)
    appointments_this_month = db.query(models.Appointment).filter(
        models.Appointment.fecha_creacion >= first_day_this_month
    ).count()
    appointments_last_month = db.query(models.Appointment).filter(
        models.Appointment.fecha_creacion >= first_day_last_month,
        models.Appointment.fecha_creacion < first_day_this_month
    ).count()
    month_trend = 0
    if appointments_last_month > 0:
        month_trend = round(((appointments_this_month - appointments_last_month) / appointments_last_month) * 100, 1)

    # Students who never had a session (distinct mentees)
    students_with_at_least_one = db.query(models.Appointment.usuario_mentee_id).distinct().count()
    students_never_session = max(0, total_students - students_with_at_least_one)

    # Mentors who never had a session (as mentor)
    mentors_with_sessions = (
        db.query(models.MentorProfile.id)
        .join(models.Appointment, models.Appointment.mentor_id == models.MentorProfile.id)
        .distinct()
        .count()
    )
    mentors_never_session = max(0, total_mentors - mentors_with_sessions)

    # Profiles with photo
    profiles_with_photo = db.query(models.UserProfile).filter(
        models.UserProfile.url_foto.isnot(None),
        models.UserProfile.url_foto != ""
    ).count()

    return {
        "metrics": {
            "total_users": total_users,
            "user_growth_rate": user_growth_rate,
            "new_users_30d": new_users_30d,
            "total_mentors": total_mentors,
            "new_mentors_30d": new_mentors_30d,
            "total_students": total_students,
            "active_students": students_with_session,
            "active_students_percent": active_students_percent,
            "total_sessions": total_sessions,
            "successful_sessions": successful_sessions,
            "success_rate": success_rate,
        },
        "charts": {
            "evolution": {
                "labels": days_labels,
                "registrations": reg_data,
                "appointments": app_data
            },
            "sectors": {
                "labels": sector_labels,
                "data": sector_data
            },
            "status": {
                "labels": ['Pend.', 'Conf.', 'Comp.', 'Canc.'],
                "data": [pending, confirmed, completed, cancelled]
            },
            "degrees": {
                "labels": degree_labels,
                "data": degree_data
            },
            "topics": {
                "labels": topic_labels,
                "data": topic_data
            },
            "sessions_by_topic": {
                "labels": session_topic_labels,
                "data": session_topic_data
            }
        },
        "top_mentors": top_mentors,
        "recent_activities": recent_activities,
        "sidebar_facts": {
            "total_universities": total_universities,
            "total_careers": total_careers,
            "total_sectors": total_sectors,
            "total_topics": total_topics,
            "avg_sessions_per_mentor": avg_sessions_per_mentor,
            "avg_sessions_per_active_student": avg_sessions_per_active_student,
            "mentor_student_ratio": mentor_student_ratio,
        },
        "progress_stats": {
            "appointments_last_7d": appointments_last_7d,
            "mentors_with_availability": mentors_with_availability,
            "profiles_with_linkedin": profiles_with_linkedin,
            "cancellation_rate": cancellation_rate,
            "appointments_this_month": appointments_this_month,
            "appointments_last_month": appointments_last_month,
            "appointments_month_trend": month_trend,
            "students_never_session": students_never_session,
            "mentors_never_session": mentors_never_session,
            "profiles_with_photo": profiles_with_photo,
        }
    }


@router.get("/visitor-stats")
def get_visitor_stats(
    days: int = Query(15, description="Days to show visitor data for"),
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)):
    """Returns visitor analytics: visits per day, top countries, top cities"""
    now = datetime.now()

    # Visits per day
    visit_labels = []
    visit_data = []

    if days > 31:
        # Group by month
        months_to_track = days // 30
        for i in range(months_to_track - 1, -1, -1):
            target_date = now - timedelta(days=30 * i)
            start_date = target_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            _, last_day = calendar.monthrange(target_date.year, target_date.month)
            end_date = target_date.replace(day=last_day, hour=23, minute=59, second=59, microsecond=999999)

            meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
            visit_labels.append(meses[target_date.month - 1])

            count = db.query(models.PageVisit).filter(
                models.PageVisit.created_at >= start_date,
                models.PageVisit.created_at <= end_date
            ).count()
            visit_data.append(count)
    else:
        for i in range(days - 1, -1, -1):
            target_date = now - timedelta(days=i)
            start_date = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
            end_date = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)

            visit_labels.append(target_date.strftime("%d/%m"))

            count = db.query(models.PageVisit).filter(
                models.PageVisit.created_at >= start_date,
                models.PageVisit.created_at <= end_date
            ).count()
            visit_data.append(count)

    # Total visits
    cutoff = now - timedelta(days=days)
    total_visits = db.query(models.PageVisit).filter(models.PageVisit.created_at >= cutoff).count()

    # Unique visitors (by IP)
    unique_visitors = db.query(func.count(func.distinct(models.PageVisit.ip_address))).filter(
        models.PageVisit.created_at >= cutoff
    ).scalar() or 0

    # Top countries
    top_countries = db.query(
        models.PageVisit.country,
        func.count(models.PageVisit.id).label("visits")
    ).filter(
        models.PageVisit.created_at >= cutoff,
        models.PageVisit.country != None,
        models.PageVisit.country != "Desconocido"
    ).group_by(models.PageVisit.country).order_by(func.count(models.PageVisit.id).desc()).limit(8).all()

    country_labels = [c[0] for c in top_countries] if top_countries else ["Sin datos"]
    country_data = [c[1] for c in top_countries] if top_countries else [0]

    # Top cities
    top_cities = db.query(
        models.PageVisit.city,
        func.count(models.PageVisit.id).label("visits")
    ).filter(
        models.PageVisit.created_at >= cutoff,
        models.PageVisit.city != None,
        models.PageVisit.city != "Desconocido"
    ).group_by(models.PageVisit.city).order_by(func.count(models.PageVisit.id).desc()).limit(8).all()

    city_labels = [c[0] for c in top_cities] if top_cities else ["Sin datos"]
    city_data = [c[1] for c in top_cities] if top_cities else [0]

    return {
        "total_visits": total_visits,
        "unique_visitors": unique_visitors,
        "chart": {
            "labels": visit_labels,
            "data": visit_data
        },
        "countries": {
            "labels": country_labels,
            "data": country_data
        },
        "cities": {
            "labels": city_labels,
            "data": city_data
        }
    }

@router.get("/users")
def list_users(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Lists all users for admin management with extended info"""
    users = db.query(models.User).order_by(models.User.id.desc()).all()
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "correo": u.correo,
            "nombre_completo": u.nombre_completo,
            "tipo_usuario": u.tipo_usuario,
            "activo": u.activo,
            "fecha_creacion": u.fecha_creacion,
            "telefono": u.perfil.telefono_movil if u.perfil else None,
            "universidad": u.educacion[0].universidad if u.educacion else None,
            "carrera": u.educacion[0].carrera if u.educacion else None
        })
    return results

@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: int,
    status_update: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Toggles user active status"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if "activo" in status_update:
        user.activo = status_update["activo"]
        db.commit()
    
    return {"status": "success", "activo": user.activo}

@router.post("/users")
def create_admin_user(
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Admin creates a new user"""
    existing = db.query(models.User).filter(models.User.correo == user_data.get("correo")).first()
    if existing:
        raise HTTPException(status_code=400, detail="El correo ya existe")

    # Generate a temporary password if not provided
    password = user_data.get("password", security.SECRET_KEY[:8])
    hashed_password = security.get_password_hash(password)

    new_user = models.User(
        correo=user_data.get("correo"),
        hash_password=hashed_password,
        nombre_completo=user_data.get("nombre_completo"),
        tipo_usuario=user_data.get("tipo_usuario", "estudiante"),
        activo=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create basic profile
    profile = models.UserProfile(
        usuario_id=new_user.id,
        rol=new_user.tipo_usuario,
        telefono_movil=user_data.get("telefono")
    )
    db.add(profile)

    # Create basic education
    education = models.UserEducation(
        usuario_id=new_user.id,
        universidad=user_data.get("universidad", "Pendiente"),
        carrera=user_data.get("carrera", "Pendiente")
    )
    db.add(education)
    
    # If mentor, create mentor profile
    if new_user.tipo_usuario == "mentor":
        mentor_prof = models.MentorProfile(usuario_id=new_user.id)
        db.add(mentor_prof)

    db.commit()
    return {"message": "Usuario creado", "id": new_user.id}

@router.put("/users/{user_id}")
def update_user_info(
    user_id: int,
    user_data: dict,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Update user core info"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if "nombre_completo" in user_data:
        user.nombre_completo = user_data["nombre_completo"]
    if "tipo_usuario" in user_data:
        user.tipo_usuario = user_data["tipo_usuario"]
    if "correo" in user_data:
        # Check uniqueness if changed
        if user_data["correo"] != user.correo:
            dup = db.query(models.User).filter(models.User.correo == user_data["correo"]).first()
            if dup: raise HTTPException(status_code=400, detail="Correo ya en uso")
            user.correo = user_data["correo"]
    
    # Update profile telefono if provided
    if "telefono" in user_data and user.perfil:
        user.perfil.telefono_movil = user_data["telefono"]
        
    db.commit()
    return {"message": "Usuario actualizado"}

@router.delete("/users/{user_id}")
def delete_user_full_cascade(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Deletes user and everything related (Cascade)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 1. Delete appointments (both as mentee or mentor)
    # As mentee (FK in citas)
    db.query(models.Appointment).filter(models.Appointment.usuario_mentee_id == user_id).delete()
    
    # As mentor (citas link to perfiles_mentor.id)
    if user.mentor_perfil:
        mid = user.mentor_perfil.id
        db.query(models.Appointment).filter(models.Appointment.mentor_id == mid).delete()
        
        # Delete mentor specific stuff
        db.query(models.MentorAvailability).filter(models.MentorAvailability.mentor_id == mid).delete()
        db.query(models.MentorTema).filter(models.MentorTema.mentor_id == mid).delete()
        # mentor_sector, mentor_area, mentor_grado bridging tables
        db.execute(models.mentor_sector.delete().where(models.mentor_sector.c.mentor_id == mid))
        db.execute(models.mentor_area.delete().where(models.mentor_area.c.mentor_id == mid))
        db.execute(models.mentor_grado.delete().where(models.mentor_grado.c.mentor_id == mid))
        
        db.delete(user.mentor_perfil)

    # 2. Delete Profile & Education
    if user.perfil:
        db.delete(user.perfil)
    
    db.query(models.UserEducation).filter(models.UserEducation.usuario_id == user_id).delete()
    db.query(models.PageVisit).filter(models.PageVisit.path.contains(f"/profile/{user_id}")).delete()

    # 3. Finally delete the user
    db.delete(user)
    db.commit()
    
    return {"message": "Usuario y toda su información relacionada eliminados correctamente"}


# ---- Solicitudes Mentor Destacado ----

@router.get("/solicitudes")
def list_solicitudes(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    """Returns all featured mentor applications with full profile data."""
    solicitudes = (
        db.query(models.DestacadoSolicitud)
        .order_by(models.DestacadoSolicitud.fecha_solicitud.desc())
        .all()
    )

    results = []
    for s in solicitudes:
        mp = s.mentor_perfil
        if not mp:
            continue
        user = mp.usuario
        profile = user.perfil if user else None
        education = user.educacion[0] if user and user.educacion else None

        results.append({
            "id": s.id,
            "status": s.status,
            "fecha_solicitud": s.fecha_solicitud,
            "fecha_revision": s.fecha_revision,
            "notas_admin": s.notas_admin,
            "mentor": {
                "id": user.id if user else None,
                "nombre_completo": user.nombre_completo if user else "",
                "correo": user.correo if user else "",
                "url_foto": profile.url_foto if profile else None,
                "url_linkedin": profile.url_linkedin if profile else None,
                "telefono": profile.telefono_movil if profile else None,
                "genero": profile.genero if profile else None,
                "fecha_nacimiento": profile.fecha_nacimiento.isoformat() if profile and profile.fecha_nacimiento else None,
                "universidad": education.universidad if education else None,
                "carrera": education.carrera if education else None,
                "anio_inicio": education.anio_inicio if education else None,
                "anio_fin": education.anio_fin if education else None,
                # Mentor-specific fields
                "sector": mp.sectores[0].nombre if mp.sectores else None,
                "area": mp.areas[0].nombre if mp.areas else None,
                "biografia": mp.biografia,
                "empresa": mp.empresa,
                "url_logo_empresa": mp.url_logo_empresa,
                "destacado": mp.destacado,
                "bloqueado_destacado": mp.bloqueado_destacado,
                "disponibilidades": [
                    {"dia": d.dia, "hora_inicio": d.hora_inicio, "hora_fin": d.hora_fin}
                    for d in mp.disponibilidades
                ],
            }
        })

    return results


@router.post("/solicitudes/{solicitud_id}/aprobar")
async def aprobar_solicitud(
    solicitud_id: int,
    background_tasks: BackgroundTasks,
    body: dict = {},
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    from datetime import datetime
    solicitud = db.query(models.DestacadoSolicitud).filter(
        models.DestacadoSolicitud.id == solicitud_id
    ).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    solicitud.status = "aprobado"
    solicitud.fecha_revision = datetime.now()
    solicitud.notas_admin = body.get("notas_admin", None)

    mentor_profile = solicitud.mentor_perfil
    if mentor_profile:
        mentor_profile.destacado = True
        
        # Send approval email
        user = mentor_profile.usuario
        if user:
            background_tasks.add_task(
                email_service.send_destacado_approved_email, 
                user.correo, 
                user.nombre_completo
            )

    db.commit()
    return {"message": "Solicitud aprobada. El mentor ahora es Destacado.", "status": "aprobado"}


@router.post("/solicitudes/{solicitud_id}/rechazar")
def rechazar_solicitud(
    solicitud_id: int,
    background_tasks: BackgroundTasks,
    body: dict = {},
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    from datetime import datetime
    solicitud = db.query(models.DestacadoSolicitud).filter(
        models.DestacadoSolicitud.id == solicitud_id
    ).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    solicitud.status = "rechazado"
    solicitud.fecha_revision = datetime.now()
    solicitud.notas_admin = body.get("notas_admin", None)

    mentor_profile = solicitud.mentor_perfil
    if mentor_profile:
        user = mentor_profile.usuario
        if user:
            background_tasks.add_task(
                email_service.send_destacado_rejected_email, 
                user.correo, 
                user.nombre_completo,
                solicitud.notas_admin
            )

    db.commit()
    return {"message": "Solicitud rechazada.", "status": "rechazado"}


@router.post("/solicitudes/{solicitud_id}/bloquear")
async def bloquear_mentor_destacado(
    solicitud_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    solicitud = db.query(models.DestacadoSolicitud).filter(
        models.DestacadoSolicitud.id == solicitud_id
    ).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    mentor_profile = solicitud.mentor_perfil
    if mentor_profile:
        mentor_profile.bloqueado_destacado = True
        # If they were featured, we might want to un-feature them too?
        # The prompt says "no pueda mandar mas solicitudes", so we just block future ones.
        # But usually a block also removes existing status if it was active.
        # User said: "bloquear, que sera para que el mentor ya no pueda mandar mas solicitudes"
    
    db.commit()
    return {"message": "Mentor bloqueado para futuras solicitudes.", "bloqueado": True}


@router.post("/solicitudes/{solicitud_id}/desbloquear")
async def desbloquear_mentor_destacado(
    solicitud_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    solicitud = db.query(models.DestacadoSolicitud).filter(
        models.DestacadoSolicitud.id == solicitud_id
    ).first()
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    
    mentor_profile = solicitud.mentor_perfil
    if mentor_profile:
        mentor_profile.bloqueado_destacado = False
    
    db.commit()
    return {"message": "Mentor desbloqueado. Ya puede volver a postular.", "bloqueado": False}


@router.get("/coffee-chats/users")
def get_all_users_with_chats(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    users = db.query(models.User).filter(models.User.tipo_usuario.in_(['estudiante', 'mentor', 'egresado'])).all()
    results = []
    
    for u in users:
        mentee_count = db.query(models.Appointment).filter(models.Appointment.usuario_mentee_id == u.id).count()
        mentor_count = 0
        if u.tipo_usuario in ['mentor', 'egresado']:
            perfil = db.query(models.MentorProfile).filter(models.MentorProfile.usuario_id == u.id).first()
            if perfil:
                mentor_count = db.query(models.Appointment).filter(models.Appointment.mentor_id == perfil.id).count()
                
        total = mentee_count + mentor_count
        if total > 0 or u.tipo_usuario in ['mentor', 'egresado', 'estudiante']:
            results.append({
                "id": u.id,
                "nombre_completo": u.nombre_completo or u.correo,
                "tipo_usuario": u.tipo_usuario,
                "correo": u.correo,
                "total_chats": total,
                "mentee_chats": mentee_count,
                "mentor_chats": mentor_count,
                "url_foto": u.perfil.url_foto if u.perfil else None
            })
            
    # Sort descending by total chats
    results.sort(key=lambda x: x["total_chats"], reverse=True)
    return results

@router.get("/coffee-chats/users/{user_id}")
def get_user_chats(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    resultados = []
    
    # As mentee
    citas_mentee = db.query(models.Appointment).filter(models.Appointment.usuario_mentee_id == user_id).all()
    for c in citas_mentee:
        mentor_profile = db.query(models.MentorProfile).filter(models.MentorProfile.id == c.mentor_id).first()
        mentor_user = None
        if mentor_profile:
            mentor_user = db.query(models.User).filter(models.User.id == mentor_profile.usuario_id).first()
            
        resultados.append({
            "id": c.id,
            "rol_en_cita": "Estudiante",
            "otra_persona_id": mentor_user.id if mentor_user else None,
            "otra_persona": mentor_user.nombre_completo if mentor_user else "Mentor Borrado",
            "tema": c.tema or "N/A",
            "estado": c.estado,
            "fecha": c.fecha_programada,
            "hora": c.hora_programada,
            "calificacion_utilidad": c.calificacion_utilidad,
            "calificacion_general": c.calificacion_general,
            "recomendaria": c.recomendaria_mentor,
            "se_dio_en_dia": c.se_dio_en_dia_acordado,
            "otro_texto": c.otro_texto,
            "fecha_realizada": c.fecha_realizada,
            "hora_realizada": c.hora_realizada
        })
        
    # As mentor
    perfil = db.query(models.MentorProfile).filter(models.MentorProfile.usuario_id == user_id).first()
    if perfil:
        citas_mentor = db.query(models.Appointment).filter(models.Appointment.mentor_id == perfil.id).all()
        for c in citas_mentor:
            mentee = db.query(models.User).filter(models.User.id == c.usuario_mentee_id).first()
            resultados.append({
                "id": c.id,
                "rol_en_cita": "Mentor" if user.tipo_usuario == 'mentor' else "Egresado",
                "otra_persona_id": mentee.id if mentee else None,
                "otra_persona": mentee.nombre_completo if mentee else "Estudiante Borrado",
                "tema": c.tema or "N/A",
                "estado": c.estado,
                "fecha": c.fecha_programada,
                "hora": c.hora_programada,
                "calificacion_utilidad": c.calificacion_utilidad,
                "calificacion_general": c.calificacion_general,
                "recomendaria": c.recomendaria_mentor,
                "se_dio_en_dia": c.se_dio_en_dia_acordado,
                "otro_texto": c.otro_texto,
                "fecha_realizada": c.fecha_realizada,
                "hora_realizada": c.hora_realizada
            })
            
    # Sort descending (most recent first)
    resultados.sort(key=lambda x: str(x["fecha"]) + str(x["hora"]) if x["fecha"] else "", reverse=True)
    return resultados

@router.get("/coffee-chats/stats")
def get_coffee_chat_stats_mentors(
    db: Session = Depends(get_db),
    current_admin: models.User = Depends(get_current_admin)
):
    # Top mentors based on average stars
    mentors = db.query(models.MentorProfile).all()
    stats = []
    for m in mentors:
        appointments = db.query(models.Appointment).filter(
            models.Appointment.mentor_id == m.id,
            models.Appointment.estado == 'realizada',
            models.Appointment.calificacion_general.isnot(None)
        ).all()
        
        user = db.query(models.User).filter(models.User.id == m.usuario_id).first()
        if not user:
            continue
            
        if len(appointments) > 0:
            avg_utilidad = sum([a.calificacion_utilidad or 0 for a in appointments]) / len(appointments)
            avg_general = sum([a.calificacion_general or 0 for a in appointments]) / len(appointments)
            total_recomendaciones = sum([1 for a in appointments if a.recomendaria_mentor])
            avg_total = (avg_utilidad + avg_general) / 2
            
            stats.append({
                "mentor_id": user.id,
                "mentor_name": user.nombre_completo or user.correo,
                "tipo_usuario": user.tipo_usuario,
                "url_foto": user.perfil.url_foto if user.perfil else None,
                "avg_utilidad": round(avg_utilidad, 1),
                "avg_general": round(avg_general, 1),
                "total_reviews": len(appointments),
                "total_recomendaciones": total_recomendaciones,
                "avg_total": round(avg_total, 1)
            })
                
    # sort by highest avg_total then by total_reviews
    stats.sort(key=lambda x: (x["avg_total"], x["total_reviews"]), reverse=True)
    return stats[:10]  # top 10
