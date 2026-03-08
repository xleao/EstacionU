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
