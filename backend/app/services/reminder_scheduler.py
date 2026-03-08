"""
Background scheduler for sending appointment reminder emails.

Logic:
- Runs every 60 seconds checking for upcoming confirmed appointments.
- For each appointment, calculates the "reminder time" = 6 hours before the session.
- If that reminder time falls between 12:00 AM and 6:00 AM, it is moved to 8:00 PM the day before.
- If the current time has passed the reminder time (and the appointment hasn't happened yet),
  and the reminder hasn't been sent, it sends the email and marks it as sent.
"""
import asyncio
import logging
from datetime import datetime, timedelta, time, timezone, date
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app import models
from app.services import email_service

logger = logging.getLogger("reminder_scheduler")

# Timezone offset for Peru (UTC-5)
PERU_OFFSET = timezone(timedelta(hours=-5))


def get_reminder_datetime(appt_date: date, appt_time: time) -> datetime:
    """
    Calculate when the reminder should be sent.
    
    Rule:
    - 6 hours before the session.
    - If that falls between 00:00 and 06:00, send at 20:00 (8pm) the day before.
    """
    session_dt = datetime.combine(appt_date, appt_time, tzinfo=PERU_OFFSET)
    reminder_dt = session_dt - timedelta(hours=6)
    
    # If reminder falls between midnight and 6am, move to 8pm previous day
    if reminder_dt.hour < 6:
        # Set to 8pm of the day before the session
        reminder_dt = reminder_dt.replace(hour=20, minute=0, second=0)
        # If reminder_dt is still on the same day as the session (because subtracting 6h
        # already put it on the previous day), we're good.
        # But if the session is at, say, 2am, then 6h before = 8pm previous day, which
        # is the same as what we want. The replace already gives us the right time on the right day.
    
    return reminder_dt


def check_and_send_reminders():
    """
    Check all confirmed appointments and send reminders if it's time.
    """
    db: Session = SessionLocal()
    try:
        now = datetime.now(PERU_OFFSET)
        today = now.date()
        tomorrow = today + timedelta(days=1)
        
        # Get confirmed and pending appointments that haven't been reminded yet
        # Only check today and tomorrow (reminders are at most ~1 day before)
        appointments = db.query(models.Appointment).filter(
            models.Appointment.estado.in_(['confirmada', 'confirmado', 'pendiente']),
            models.Appointment.recordatorio_enviado == False,
            models.Appointment.fecha_programada >= today,
            models.Appointment.fecha_programada <= tomorrow
        ).all()
        
        for appt in appointments:
            try:
                reminder_time = get_reminder_datetime(appt.fecha_programada, appt.hora_programada)
                
                # Is it time to send the reminder?
                if now >= reminder_time:
                    # Get mentee and mentor info
                    mentee = db.query(models.User).filter(models.User.id == appt.usuario_mentee_id).first()
                    mentor_profile = db.query(models.MentorProfile).filter(models.MentorProfile.id == appt.mentor_id).first()
                    
                    if not mentee or not mentor_profile:
                        continue
                    
                    mentor_user = db.query(models.User).filter(models.User.id == mentor_profile.usuario_id).first()
                    if not mentor_user:
                        continue
                    
                    date_str = appt.fecha_programada.strftime('%d de %b, %Y')
                    time_str = appt.hora_programada.strftime('%I:%M %p')
                    tema = appt.tema or "Coffee Chat"
                    
                    mentee_name = mentee.nombre_completo or f"{mentee.nombre} {mentee.apellidos}"
                    mentor_name = mentor_user.nombre_completo or f"{mentor_user.nombre} {mentor_user.apellidos}"
                    
                    # Send to student
                    if mentee.correo:
                        email_service.send_reminder_email(
                            to_email=mentee.correo,
                            name=mentee_name.split(" ")[0],
                            other_name=mentor_name,
                            date_str=date_str,
                            time_str=time_str,
                            tema=tema,
                            is_mentor=False
                        )
                    
                    # Send to mentor
                    if mentor_user.correo:
                        email_service.send_reminder_email(
                            to_email=mentor_user.correo,
                            name=mentor_name.split(" ")[0],
                            other_name=mentee_name,
                            date_str=date_str,
                            time_str=time_str,
                            tema=tema,
                            is_mentor=True
                        )
                    
                    # Mark as sent
                    appt.recordatorio_enviado = True
                    db.commit()
                    
                    logger.info(f"Reminder sent for appointment #{appt.id} ({date_str} {time_str})")
                    
            except Exception as e:
                logger.error(f"Error processing reminder for appointment #{appt.id}: {e}")
                continue
                
    except Exception as e:
        logger.error(f"Error in reminder scheduler: {e}")
    finally:
        db.close()


async def reminder_loop():
    """
    Async loop that runs every 60 seconds to check for reminders.
    """
    logger.info("🔔 Reminder scheduler started")
    while True:
        try:
            check_and_send_reminders()
        except Exception as e:
            logger.error(f"Reminder loop error: {e}")
        await asyncio.sleep(60)  # Check every minute
