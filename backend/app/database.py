from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# SQLAlchemy uses "postgresql" but psycopg2 driver requires "postgresql+psycopg2"
# providing the direct driver is often safer, or ensuring the URL is correct
# The user's url is likely postgresql://...
# We will use it as is, usually SQLAlchemy handles it if psycopg2 is installed.
QUERY_URL = settings.database_url

engine = create_engine(QUERY_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
