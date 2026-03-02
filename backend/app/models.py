from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Time, Text, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# --- Association Tables ---

mentor_sector = Table(
    'mentor_sector', Base.metadata,
    Column('mentor_id', Integer, ForeignKey('perfiles_mentor.id'), primary_key=True),
    Column('sector_id', Integer, ForeignKey('sectores.id'), primary_key=True)
)

mentor_area = Table(
    'mentor_area', Base.metadata,
    Column('mentor_id', Integer, ForeignKey('perfiles_mentor.id'), primary_key=True),
    Column('area_id', Integer, ForeignKey('areas_funcion.id'), primary_key=True)
)

mentor_grado = Table(
    'mentor_grado', Base.metadata,
    Column('mentor_id', Integer, ForeignKey('perfiles_mentor.id'), primary_key=True),
    Column('grado_id', Integer, ForeignKey('grados_academicos.id'), primary_key=True)
)

# mentor_tema has an extra column 'nota', so it should be a model (Association Object pattern) or handled carefully.
# The PlantUML shows it as a bridge table with 'nota'.
# SQLAlchemy many-to-many with extra columns usually requires an Association Object.
# For simplicity and given the prompt's table definition, I'll create a class for it.

class MentorTema(Base):
    __tablename__ = 'mentor_tema'
    mentor_id = Column(Integer, ForeignKey('perfiles_mentor.id'), primary_key=True)
    tema_id = Column(Integer, ForeignKey('temas.id'), primary_key=True)
    nota = Column(String, nullable=True)

# --- Main Tables ---

class User(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    correo = Column(String, unique=True, index=True, nullable=False)
    hash_password = Column(String, nullable=True)
    nombre_completo = Column(String, nullable=True)
    tipo_usuario = Column(String, nullable=True) # 'estudiante' | 'mentor'
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    activo = Column(Boolean, default=True)

    perfil = relationship("UserProfile", back_populates="usuario", uselist=False)
    educacion = relationship("UserEducation", back_populates="usuario")
    mentor_perfil = relationship("MentorProfile", back_populates="usuario", uselist=False)
    
    # Appointments where user is mentee
    citas_mentee = relationship("Appointment", foreign_keys="[Appointment.usuario_mentee_id]", back_populates="mentee")

class UserProfile(Base):
    __tablename__ = "perfiles_usuario"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    genero = Column(String, nullable=True)
    telefono_movil = Column(String, nullable=True)
    url_linkedin = Column(String, nullable=True)
    fecha_nacimiento = Column(Date, nullable=True)
    rol = Column(String, nullable=True) # 'estudiante' | 'mentor'
    url_foto = Column(String, nullable=True)

    usuario = relationship("User", back_populates="perfil")

class UserEducation(Base):
    __tablename__ = "educacion_usuario"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    universidad = Column(String, nullable=True)
    carrera = Column(String, nullable=True)
    anio_inicio = Column(Integer, nullable=True)
    anio_fin = Column(Integer, nullable=True)

    usuario = relationship("User", back_populates="educacion")

class MentorProfile(Base):
    __tablename__ = "perfiles_mentor"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), unique=True, nullable=False)
    destacado = Column(Boolean, default=False)
    biografia = Column(Text, nullable=True)
    anio_egreso = Column(Integer, nullable=True)
    horario_sugerido = Column(String, nullable=True)
    empresa = Column(String, nullable=True)
    url_logo_empresa = Column(String, nullable=True)

    usuario = relationship("User", back_populates="mentor_perfil")
    
    sectores = relationship("Sector", secondary=mentor_sector, backref="mentores")
    areas = relationship("Area", secondary=mentor_area, backref="mentores")
    grados = relationship("Grade", secondary=mentor_grado, backref="mentores")
    temas = relationship("MentorTema", backref="mentor")
    disponibilidades = relationship("MentorAvailability", back_populates="mentor", cascade="all, delete-orphan")
    
    # Appointments where user is mentor
    citas_mentor = relationship("Appointment", foreign_keys="[Appointment.mentor_id]", back_populates="mentor")

class MentorAvailability(Base):
    __tablename__ = 'disponibilidad_mentor'
    id = Column(Integer, primary_key=True, index=True)
    mentor_id = Column(Integer, ForeignKey('perfiles_mentor.id'), nullable=False)
    dia = Column(String, nullable=False) # 'Lunes', 'Martes', etc.
    hora_inicio = Column(String, nullable=False) # 'HH:MM'
    hora_fin = Column(String, nullable=False) # 'HH:MM'

    mentor = relationship("MentorProfile", back_populates="disponibilidades")

# --- Catalogs ---

class Sector(Base):
    __tablename__ = "sectores"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)

class Area(Base):
    __tablename__ = "areas_funcion"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)

class Grade(Base):
    __tablename__ = "grados_academicos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)

class Theme(Base):
    __tablename__ = "temas"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)

# --- Citas ---

class Appointment(Base):
    __tablename__ = "citas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_mentee_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("perfiles_mentor.id"), nullable=False) # Note: links to mentor profile or user? PlantUML says mentor_id FK to... actually it usually links to users table if mentor is a user, or perfiles_mentor. PlantUML line: mentions mentors ||--o{ appt. Let's assume mentor_id refers to perfiles_mentor.id based on the entity diagram entity "citas" mentor_id FK. Wait, usually authentication is user-based. But if the FK is to perfiles_mentor, okay. Let's check the FK in PlantUML.
    # PlantUML: entity "citas" ... mentor_id : bigint <<FK>>.
    # Relationship: mentors ||--o{ appt : "atiende". mentors is "perfiles_mentor". So FK is to perfiles_mentor.id.
    
    fecha_programada = Column(Date, nullable=False)
    hora_programada = Column(Time, nullable=False)
    tema = Column(String, nullable=True)
    otro_texto = Column(Text, nullable=True)
    estado = Column(String, nullable=False) # 'pendiente', 'confirmada', 'realizada', 'cancelada'
    fecha_realizada = Column(Date, nullable=True)
    hora_realizada = Column(Time, nullable=True)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    mentee = relationship("User", foreign_keys=[usuario_mentee_id], back_populates="citas_mentee")
    mentor = relationship("MentorProfile", foreign_keys=[mentor_id], back_populates="citas_mentor")


# --- Analytics / Visitor Tracking ---

class PageVisit(Base):
    __tablename__ = "page_visits"

    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, nullable=True)
    country = Column(String, nullable=True, default="Desconocido")
    city = Column(String, nullable=True, default="Desconocido")
    path = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
