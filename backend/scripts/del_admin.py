from app.database import SessionLocal
from app.models import User, UserProfile, UserEducation
db = SessionLocal()
try:
    user = db.query(User).filter(User.correo == 'admin@estacionu.com').first()
    if user:
        db.query(UserProfile).filter(UserProfile.usuario_id == user.id).delete()
        db.query(UserEducation).filter(UserEducation.usuario_id == user.id).delete()
        db.query(User).filter(User.correo == 'admin@estacionu.com').delete()
        db.commit()
        print("Admin user deleted successfully")
except Exception as e:
    print(e)
