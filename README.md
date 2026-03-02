# EstaciónU - Plataforma Profesional Universitaria

EstaciónU+ es una plataforma diseñada para conectar el talento joven con oportunidades profesionales, permitiendo a estudiantes encontrar mentorías con egresados (alumini) para potenciar su formación académica y profesional.

## 🚀 Tecnologías y Arquitectura

El proyecto está dividido en dos partes principales: Cliente (Frontend) y Servidor (Backend).

### Frontend
- **Framework:** React 18 + Vite
- **Estilizado:** Tailwind CSS
- **Enrutamiento:** React Router DOM
- **Autenticación:** Google OAuth (`@react-oauth/google`)
- **Gestión de Estado:** Context API
- **Otros:** Animaciones CSS nativas y componentes responsivos

### Backend
- **Framework Core:** FastAPI 0.109.0
- **Lenguaje Base:** Python 3.11.0
- **Base de Datos ORM:** SQLAlchemy 2.0.46
- **Base de Datos Engine:** PostgreSQL (a través de `psycopg2-binary`)
- **Autenticación:** JWT (JSON Web Tokens) usando `python-jose` y `passlib` con `bcrypt`
- **Envío de Correos:** SMTP nativo
- **Servidor ASGI:** Uvicorn 0.27.0
- **Comunicaciones en Tiempo Real:** WebSockets integrados en FastAPI (`websockets==16.0`)

---

## ⚙️ Pasos para Instalación y Despliegue Local

### 1. Requisitos Previos
- **Node.js**: Descargar e instalar la última versión LTS (necesario para el frontend).
- **Python**: Versión **3.11.0**.
- **PostgreSQL**: Servidor de base de datos relacional corriendo local o en la nube.

### 2. Configuración del Backend (API)

El backend maneja la lógica de negocio, base de datos de usuarios, sesiones y envío de comunicaciones.

1. Navegar a la carpeta raíz del proyecto y abrir una terminal nueva.
2. Crear un entorno virtual para encapsular las dependencias, esto evitará conflictos con otras instalaciones de Python:
   ```bash
   python -m venv .venv
   ```
3. Activar el entorno virtual correspondiente:
   * **En Windows:**
     ```cmd
     .venv\Scripts\activate
     ```
   * **En Mac/Linux:**
     ```bash
     source .venv/bin/activate
     ```
4. Con el entorno activado, instalar estrictamente las dependencias versionadas requeridas:
   ```bash
   pip install -r requirements.txt
   ```
5. Renombrar o crear un archivo llamado `.env` dentro de la carpeta `/backend` y asegurarse de colocar las credenciales y links correctos para su ejecución (ej. `DATABASE_URL`, credenciales SMTP para correos, Google Auth Token).
6. Entrar a la carpeta del backend y correr el servidor ASGI:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   *(La API levantará por defecto en `http://localhost:8000`)*

### 3. Configuración del Frontend (Cliente Web)

1. Abrir **otra terminal paralela** (para mantener el backend corriendo).
2. Entrar a la carpeta de React:
   ```bash
   cd frontend
   ```
3. Instalar librerías de Node:
   ```bash
   npm install
   ```
4. Levantar servidor de desarrollo:
   ```bash
   npm run dev
   ```
   *(La aplicación mostrará la interfaz corriendo en `http://localhost:5173` o similar).*

---

## 🔒 Estructura y Roles Funcionales
La plataforma cuenta con 3 ejes de roles definidos para los usuarios:
* **Estudiante:** Accede a un panel de navegación de mentores, solicita sesiones ("Coffee Chats") y edita su cuenta inicial.
* **Mentor / Egresado:** Entra a un Dashboard avanzado de disponibilidad, configura perfiles elaborados para recibir solicitudes y acepta declina citas estudiantiles.
* **Administrador:** Panel de monitoreo de métricas, estadísticas de las sesiones confirmadas, revisión del tráfico de plataforma y borrado forzoso de contenido/usuarios.

---
📝 *Documentación técnica - EstaciónU Team*
