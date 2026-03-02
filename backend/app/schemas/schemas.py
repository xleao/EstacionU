from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import date

class AvailabilityBase(BaseModel):
    dia: str
    hora_inicio: str
    hora_fin: str

class UserBase(BaseModel):
    username: str   # xLeao
    nombre: str     # Juan
    apellidos: str  # Perez
    email: EmailStr # x@x.com
    role: str       # student | graduate
    university: str # UNI
    career: str     # Ing. Sistemas
    phone: Optional[str] = None       # +51 987654321
    gender: Optional[str] = None      # masculino | femenino | otro
    anio_inicio: Optional[int] = None # 2020
    anio_fin: Optional[int] = None    # 2025

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserResponse(UserBase):
    id: int

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class UserProfileUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    telefono_movil: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[str] = None
    universidad: Optional[str] = None
    carrera: Optional[str] = None
    url_linkedin: Optional[str] = None
    anio_inicio: Optional[int] = None
    anio_fin: Optional[int] = None
    biografia: Optional[str] = None
    horario_sugerido: Optional[str] = None
    sector_nombre: Optional[str] = None
    area_nombre: Optional[str] = None
    url_foto: Optional[str] = None
    empresa: Optional[str] = None
    url_logo_empresa: Optional[str] = None
    disponibilidades: Optional[List[AvailabilityBase]] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)

class GoogleLoginRequest(BaseModel):
    credential: str


class AppointmentCreate(BaseModel):
    mentor_user_id: int
    fecha: date
    hora: str
    tema: Optional[str] = "Sesión general"
    mensaje: Optional[str] = ""

class AppointmentResponse(BaseModel):
    id: int
    mentor_name: str
    mentor_image: str
    sector: str
    fecha: date
    hora: str
    estado: str

    class Config:
        from_attributes = True

class AppointmentUpdate(BaseModel):
    fecha: Optional[date] = None
    hora: Optional[str] = None
    tema: Optional[str] = None
    mensaje: Optional[str] = None
