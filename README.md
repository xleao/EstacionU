# EstaciónU+ - Plataforma Profesional Universitaria

EstaciónU+ es una plataforma integral diseñada para conectar el talento joven de la facultad (estudiantes) con las oportunidades y experiencia de profesionales y egresados (alumni). Permite la gestión de mentorías, solicitudes de "Coffee Chats" y un seguimiento detallado para potenciar la formación académica y profesional.

---

## 🚀 Arquitectura y Tecnologías (Stack Tecnológico)

El proyecto está construido bajo una arquitectura cliente-servidor, separando claramente la interfaz de usuario (Frontend) de la lógica de negocio y gestión de datos (Backend).

### 🖥️ Frontend (Cliente Web)
- **Framework Core:** React 18
- **Construcción y Empaquetado:** Vite (alta velocidad de renderizado y HMR)
- **Estilos y Componentes:** Tailwind CSS (utility-first CSS framework)
- **Enrutamiento:** React Router DOM v6
- **Autenticación Externa:** Google OAuth 2.0 (`@react-oauth/google`)
- **Gestión de Estado:** React Context API
- **Interactividad Visual:** Animaciones nativas y diseño 100% responsivo (Mobile First).

### ⚙️ Backend (API y Lógica de Negocio)
- **Lenguaje Base:** Python 3.11.0 (Obligatorio para compatibilidad de anotaciones de tipo)
- **Framework Core:** FastAPI 0.109.0 (Alto rendimiento, basado en Starlette y Pydantic)
- **Servidor ASGI:** Uvicorn 0.27.0
- **Validación de Datos:** Pydantic 2.5.3
- **ORM (Object-Relational Mapping):** SQLAlchemy 2.0.46
- **Autenticación y Seguridad:** 
  - JSON Web Tokens (JWT) mediante `python-jose==3.5.0`
  - Hashing de contraseñas con `passlib==1.7.4` y `bcrypt==4.3.0`
- **Tiempo Real:** WebSockets integrados nativamente (`websockets==16.0`) para actualizaciones asíncronas.
- **Manejo de Correo:** Integración nativa por SMTP.

### 🗄️ Base de Datos
- **Motor:** PostgreSQL
- **Driver de Conexión:** `psycopg2-binary==2.9.10`
- **Estructura Relacional:** Tablas interconectadas para Usuarios, Perfiles (Detallado y Mentor), Sesiones (Appointments), Sectores, Áreas y Disponibilidad de horarios.

---

## 🛠️ Entorno de Desarrollo Local

Para levantar este proyecto en un entorno local, sigue **estrictamente** los siguientes pasos.

### 1. Requisitos Previos del Sistema
- **Node.js**: Versión LTS (recomendado v18.x o v20.x). Comprueba con `node -v`
- **Python**: Estrictamente **3.11.0**. Comprueba con `python --version`
- **Git**: Para clonar y manejar versiones.
- **PostgreSQL**: Instalado y corriendo localmente (pgAdmin 4 recomendado para gestión visual).

### 2. Configuración de la Base de Datos (PostgreSQL)
1. Abre tu gestor de base de datos PostgreSQL.
2. Crea una base de datos vacía dedicada al proyecto, por ejemplo: `estacionu_db`.
3. Anota tu usuario (generalmente `postgres`), contraseña y el puerto (generalmente `5432`). Estas credenciales se usarán en el archivo de entorno. (Nota: Las tablas se crearán automáticamente al arrancar el backend gracias a SQLAlchemy `create_all`).

### 3. Configuración del Backend (Python/FastAPI)

El backend utiliza un archivo `requirements.txt` explícito que fija todas las versiones de las dependencias para asegurar que la aplicación corra unificada y sin conflictos en todos los entornos.

1. Abre tu terminal y navega a la raíz del proyecto.
2. Crea un **Entorno Virtual (Virtual Environment)** para aislar las librerías:
   ```bash
   python -m venv .venv
   ```
3. **Activar el entorno virtual:**
   - En **Windows**:
     ```cmd
     .venv\Scripts\activate
     ```
   - En **Linux / macOS**:
     ```bash
     source .venv/bin/activate
     ```
4. Con el entorno `(.venv)` activo, **instalar todas las dependencias exactas** desde el archivo de requerimientos provisto:
   ```bash
   pip install -r requirements.txt
   ```
5. **Variables de Entorno (.env)**:
   Navega a la carpeta `/backend/` y crea el archivo `.env`. Copia este formato base introduciendo tus credenciales de PostgreSQL y correo:
   ```env
   # /backend/.env
   DATABASE_URL=postgresql://TU_USUARIO:TU_CONTRASEÑA@localhost:5432/estacionu_db
   SECRET_KEY=TU_FIRMA_SECRETA_SUPER_SEGURA
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=43200

   # Credenciales SMTP (Para el envío de correos de bienvenida/reset contraseña)
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=tu_correo@gmail.com
   SMTP_PASSWORD=tu_contraseña_de_aplicacion
   SMTP_FROM_EMAIL=tu_correo@gmail.com

   # Google OAuth
   GOOGLE_CLIENT_ID=TU_CLIENT_ID_DE_GOOGLE
   ```
6. Arrancar el servidor backend local:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
   🚀 *La API debe arrancar mostrando puertos de conexión activos en `http://localhost:8000` (Puedes ver la documentación automática Swagger genérica en `http://localhost:8000/docs`).*

### 4. Configuración del Frontend (React/Vite)

Deja la terminal del backend abierta y abre **una terminal nueva**.

1. Navega a la carpeta del frontend:
   ```bash
   cd frontend
   ```
2. Instalar los módulos de Node (Node Modules):
   ```bash
   npm install
   ```
3. Ejecutar el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
   🎨 *El frontend compilará y estará disponible en `http://localhost:5173`. Las peticiones a la ruta `/api` están configuradas en el archivo `vite.config.js` para ser parseadas automáticamente al puerto local 8000.*

---

## 🌐 Guía de Despliegue en Producción (Deployment)

Para lanzar el proyecto a la red pública (Ej. a un VPS como DigitalOcean, Linode, Elastika o plataformas cloud como AWS / Render).

### Despliegue del Backend
FastAPI se sirve detrás de un proxy inverso mediante `NGINX` o directamente manejado como servicio systemd.
1. Git pull de los cambios sobre el VPS.
2. Levantar el entorno virtual e instalar con `pip install -r requirements.txt`.
3. Configurar `.env` con las variables de producción.
4. Para producción persistente, montar un archivo en **Systemd** (`/etc/systemd/system/estacionu.service`):
   ```ini
   [Unit]
   Description=EstacionU Backend FastAPI Server
   After=network.target

   [Service]
   User=root
   WorkingDirectory=/ruta/al/proyecto/EstacionU/backend
   Environment="PATH=/ruta/al/proyecto/EstacionU/.venv/bin"
   ExecStart=/ruta/al/proyecto/EstacionU/.venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000

   [Install]
   WantedBy=multi-user.target
   ```
5. Iniciar y activar el servicio: `systemctl start estacionu` y `systemctl enable estacionu`.

### Despliegue del Frontend
React + Vite genera un empaquetado final HTML/Minified JS listo para distribución estática.
1. Compilar el archivo de distribución:
   ```bash
   cd frontend
   npm run build
   ```
2. Esto generará la carpeta `/dist`.
3. En **NGINX**, apuntar la raíz del servidor virtual apuntando al path donde reside esta carpeta web y configurar el ruteo `/api/` y proxy inverso al puerto 8000 de FastAPI.

---

## 👥 Árbol de Accesos y Roles del Sistema

El sistema implementa tres perfiles técnicos. La pantalla principal determina este enrutamiento seguro de react-router a partir de la decodificación del Token JWT emitido.
*   👨‍🎓 **Estudiante/Mentee:** Exploración de directotio general, solicitud de "Coffee Chats", subida de CV básico y feedback asíncrono de sesión.
*   🚀 **Mentor/Egresado:** Dashboard especializado para gestionar perfiles laborales con la facultad (logo, empresa actual, currícula biográfica), selección de bloques de disponibilidad horaria y panel de confirmación/denegación de los CaffeChats requeridos.
*   ⚙️ **Administrador (SuperUser):** Panel de moderación absoluta de la plataforma para validar actividad de usuarios registrados e incidencias directas.
