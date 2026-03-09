from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# SQLAlchemy uses "postgresql" but psycopg2 driver requires "postgresql+psycopg2"
# providing the direct driver is often safer, or ensuring the URL is correct
# The user's url is likely postgresql://...
# We will use it as is, usually SQLAlchemy handles it if psycopg2 is installed.
QUERY_URL = settings.database_url

# Optimización para VPS: Se configura el "Pool de Conexiones"
# pool_size=20     -> Mantiene hasta 20 conexiones abiertas listas para usarse velozmente.
# max_overflow=10  -> Si hay un pico temporal, permite 10 adicionales.
# pool_pre_ping    -> Verifica que la BD sigue viva antes de lanzar la consulta.
# pool_recycle     -> Reinicia las conexiones cada hora para evitar cortes fantasma.
engine = create_engine(
    QUERY_URL,
    pool_size=20,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=3600
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
