from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import models
from app.api.deps import get_db, get_current_admin
from pydantic import BaseModel

class CatalogItemCreate(BaseModel):
    nombre: str

class CatalogItemResponse(BaseModel):
    id: int
    nombre: str

    class Config:
        orm_mode = True

router = APIRouter(prefix="/catalogs", tags=["catalogs"])

# --- SECTORES ---
@router.get("/sectores", response_model=List[CatalogItemResponse])
def get_sectores(db: Session = Depends(get_db)):
    return db.query(models.Sector).all()

@router.post("/sectores", response_model=CatalogItemResponse)
def create_sector(item: CatalogItemCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    nombre = item.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    existe = db.query(models.Sector).filter(models.Sector.nombre.ilike(nombre)).first()
    if existe:
        raise HTTPException(status_code=409, detail=f"El sector '{nombre}' ya existe")
    new_item = models.Sector(nombre=nombre)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/sectores/{item_id}")
def delete_sector(item_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    item = db.query(models.Sector).filter(models.Sector.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Sector no encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Sector eliminado"}

# --- AREAS ---
@router.get("/areas", response_model=List[CatalogItemResponse])
def get_areas(db: Session = Depends(get_db)):
    return db.query(models.Area).all()

@router.post("/areas", response_model=CatalogItemResponse)
def create_area(item: CatalogItemCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    nombre = item.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    existe = db.query(models.Area).filter(models.Area.nombre.ilike(nombre)).first()
    if existe:
        raise HTTPException(status_code=409, detail=f"El área '{nombre}' ya existe")
    new_item = models.Area(nombre=nombre)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/areas/{item_id}")
def delete_area(item_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    item = db.query(models.Area).filter(models.Area.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Área no encontrada")
    db.delete(item)
    db.commit()
    return {"message": "Área eliminada"}

# --- INSTITUCIONES ---
@router.get("/instituciones", response_model=List[CatalogItemResponse])
def get_instituciones(db: Session = Depends(get_db)):
    return db.query(models.Institution).all()

@router.post("/instituciones", response_model=CatalogItemResponse)
def create_institucion(item: CatalogItemCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    nombre = item.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    existe = db.query(models.Institution).filter(models.Institution.nombre.ilike(nombre)).first()
    if existe:
        raise HTTPException(status_code=409, detail=f"La institución '{nombre}' ya existe")
    new_item = models.Institution(nombre=nombre)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/instituciones/{item_id}")
def delete_institucion(item_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    item = db.query(models.Institution).filter(models.Institution.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Institución no encontrada")
    db.delete(item)
    db.commit()
    return {"message": "Institución eliminada"}

# --- CARRERAS ---
@router.get("/carreras", response_model=List[CatalogItemResponse])
def get_carreras(db: Session = Depends(get_db)):
    return db.query(models.Career).all()

@router.post("/carreras", response_model=CatalogItemResponse)
def create_carrera(item: CatalogItemCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    nombre = item.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    existe = db.query(models.Career).filter(models.Career.nombre.ilike(nombre)).first()
    if existe:
        raise HTTPException(status_code=409, detail=f"La carrera '{nombre}' ya existe")
    new_item = models.Career(nombre=nombre)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/carreras/{item_id}")
def delete_carrera(item_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    item = db.query(models.Career).filter(models.Career.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Carrera no encontrada")
    db.delete(item)
    db.commit()
    return {"message": "Carrera eliminada"}

# --- TEMAS (Coffee Chat) ---
@router.get("/temas", response_model=List[CatalogItemResponse])
def get_temas(db: Session = Depends(get_db)):
    return db.query(models.Theme).all()

@router.post("/temas", response_model=CatalogItemResponse)
def create_tema(item: CatalogItemCreate, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    nombre = item.nombre.strip()
    if not nombre:
        raise HTTPException(status_code=400, detail="El nombre no puede estar vacío")
    existe = db.query(models.Theme).filter(models.Theme.nombre.ilike(nombre)).first()
    if existe:
        raise HTTPException(status_code=409, detail=f"El tema '{nombre}' ya existe")
    new_item = models.Theme(nombre=nombre)
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/temas/{item_id}")
def delete_tema(item_id: int, db: Session = Depends(get_db), current_admin: models.User = Depends(get_current_admin)):
    item = db.query(models.Theme).filter(models.Theme.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Tema no encontrado")
    db.delete(item)
    db.commit()
    return {"message": "Tema eliminado"}
