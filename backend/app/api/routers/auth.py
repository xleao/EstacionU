from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from jose import JWTError, jwt

from app import models
from app.schemas import schemas
from app.api.deps import get_db
from app.core import security
from app.services import email_service
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from app.core.config import settings

router = APIRouter(tags=["auth"])

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.correo == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado.")
    
    hashed_password = security.get_password_hash(user.password)
    
    # Map role
    role_map = {'student': 'estudiante', 'graduate': 'mentor'}
    db_role = role_map.get(user.role, user.role)

    # Create User
    new_user = models.User(
        correo=user.email,
        hash_password=hashed_password,
        nombre_completo=f"{user.nombre} {user.apellidos}",
        tipo_usuario=db_role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Create Profile
    new_profile = models.UserProfile(
        usuario_id=new_user.id,
        rol=db_role,
        telefono_movil=user.phone,
        genero=user.gender
    )
    db.add(new_profile)
    
    # Create Education
    new_education = models.UserEducation(
        usuario_id=new_user.id,
        universidad=user.university,
        carrera=user.career,
        anio_inicio=user.anio_inicio,
        anio_fin=user.anio_fin
    )
    db.add(new_education)
    db.commit()
    
    response_data = user.dict()
    response_data['id'] = new_user.id
    if 'password' in response_data:
        del response_data['password']
        
    background_tasks.add_task(email_service.send_welcome_email, user.email, user.nombre)
    return response_data

@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.correo == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hash_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=security.settings.access_token_expire_minutes)
    access_token = security.create_access_token(
        data={"sub": user.correo}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/users/forgot-password")
async def forgot_password(request: schemas.ForgotPasswordRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.correo == request.email).first()
    if user:
        nombre = user.nombre_completo.split(" ")[0] if user.nombre_completo else "Usuario"
        reset_token_expires = timedelta(hours=1)
        reset_token = security.create_access_token(
            data={"sub": user.correo, "purpose": "password_reset"}, 
            expires_delta=reset_token_expires
        )
        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        background_tasks.add_task(email_service.send_forgot_password_email, user.correo, nombre, reset_link)
    
    return {"message": "Si tu correo está registrado, recibirás un enlace de recuperación."}

@router.post("/users/reset-password")
async def reset_password(request: schemas.ResetPasswordConfirm, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(request.token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        email_sub: str = payload.get("sub")
        purpose: str = payload.get("purpose")
        if email_sub is None or purpose != "password_reset":
            raise HTTPException(status_code=400, detail="El enlace de recuperación no es válido para este propósito.")
    except JWTError:
        raise HTTPException(status_code=400, detail="El enlace ha expirado o no es válido.")

    user = db.query(models.User).filter(models.User.correo == email_sub).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    hashed_password = security.get_password_hash(request.new_password)
    user.hash_password = hashed_password
    db.commit()

    return {"message": "Contraseña actualizada exitosamente."}

@router.post("/google")
async def google_login(credential: schemas.GoogleLoginRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    id_info = None
    # Try as ID Token first (for standard Google Button)
    try:
        id_info = id_token.verify_oauth2_token(
            credential.credential, 
            google_requests.Request(), 
            settings.google_client_id
        )
    except ValueError:
        # If ID token validation fails, try as Access Token (for custom buttons using useGoogleLogin)
        try:
            response = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                params={"access_token": credential.credential}
            )
            if response.ok:
                id_info = response.json()
            else:
                raise ValueError("Invalid Access Token")
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token or access token",
            )

    if not id_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google token",
        )

    try:
        user_email = id_info.get("email")
        if not user_email:
             raise HTTPException(status_code=400, detail="Google account does not have an email.")

        # Find user by email
        user = db.query(models.User).filter(models.User.correo == user_email).first()
        is_new = False
        
        if user:
            # Prevent logging in with Google if they are a traditional user
            is_google_account = security.verify_password(security.SECRET_KEY[:10], user.hash_password)
            if not is_google_account:
                raise HTTPException(
                    status_code=400, 
                    detail="Esta cuenta ya se encuentra registrada en EstaciónU. Por favor, ingresa utilizando tu correo y contraseña asignada."
                )
        
        if not user:
            is_new = True
            # For now, let's auto-register if the email is from a known domain or just allow it
            # But we need at least a name. Google provides it.
            name = id_info.get("name", "Usuario Google")
            first_name = id_info.get("given_name", name)
            
            # Create User
            user = models.User(
                correo=user_email,
                hash_password=security.get_password_hash(security.SECRET_KEY[:10]), # Dummy password
                nombre_completo=name,
                tipo_usuario='estudiante' # Default role
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            
            # Create default Profile
            new_profile = models.UserProfile(
                usuario_id=user.id,
                rol='estudiante',
                telefono_movil=None,
                genero=None
            )
            db.add(new_profile)
            
            # Create default Education
            new_education = models.UserEducation(
                usuario_id=user.id,
                universidad="Pendiente",
                carrera="Pendiente",
                anio_inicio=None,
                anio_fin=None
            )
            db.add(new_education)
            db.commit()

            # Send welcome email
            background_tasks.add_task(email_service.send_welcome_email, user.correo, first_name)

        # Generate JWT
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = security.create_access_token(
            data={"sub": user.correo}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "is_new": is_new}

    except HTTPException as he:
        # Re-raise explicit HTTP exceptions so they aren't caught by the generic handler
        raise he
    except Exception as e:
        print(f"Google Login Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error procesando autenticación con Google",
        )
