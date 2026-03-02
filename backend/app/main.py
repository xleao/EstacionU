import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine
from app import models

# Import routers
from app.api.routers import auth, users, appointments, admin

# Create upload directory
UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="EstacionU API", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(appointments.router)
app.include_router(admin.router)

# Analytics middleware - tracks page visits
from app.middleware.analytics import AnalyticsMiddleware
app.add_middleware(AnalyticsMiddleware)

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de EstacionU", "status": "Connected to DB"}

from fastapi import WebSocket, WebSocketDisconnect
from app.ws_manager import manager

@app.websocket("/ws/mentors")
async def websocket_mentors(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
