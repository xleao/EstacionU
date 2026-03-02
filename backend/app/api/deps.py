from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt
from app.database import get_db
from app import models
from app.schemas import schemas
from app.core import security

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/token")

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, security.SECRET_KEY, algorithms=[security.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(models.User).filter(models.User.correo == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user


async def get_current_admin(current_user: models.User = Depends(get_current_user)):
    """
    Ensure the current user has administrator privileges.
    """
    # We treat both explicit 'admin' type and perfiles_usuario.rol == 'admin' as admin.
    role = (current_user.tipo_usuario or "").lower()
    profile_role = (current_user.perfil.rol.lower() if current_user.perfil and current_user.perfil.rol else "")

    if role not in ["admin", "administrador"] and profile_role not in ["admin", "administrador"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a este recurso de administrador",
        )
    return current_user
