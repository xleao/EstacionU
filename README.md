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

## 🌐 GUÍA DEFINITIVA DE DESPLIEGUE EN PRODUCCIÓN (VPS ELASTIKA)

Esta guía asume que acabas de encender un servidor VPS (Ubuntu) nuevo (en plataformas como Elastika) y te has conectado vía SSH usando el usuario `root`.

### FASE 1: Preparación del Servidor 🛠️
Lo primero es actualizar la máquina e instalar los programas que van a hacer funcionar todo.

**1️⃣ Actualizar el sistema:**
```bash
apt update && apt upgrade -y
```

**2️⃣ Instalar herramientas básicas y la Base de Datos:**
Vamos a instalar Nginx (el servidor web que muestra la página), PostgreSQL (la base de datos) y Git (para descargar el código).
```bash
apt install git curl nginx postgresql postgresql-contrib -y
```

**3️⃣ Instalar Python (Para el Backend):**
Instalaremos Python y las herramientas para crear entornos virtuales.
```bash
apt install python3 python3-venv python3-pip -y
```

**4️⃣ Instalar Node.js (Para el Frontend en React/Vite):**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### FASE 2: Configuración de la Base de Datos (PostgreSQL) 🗄️
Tenemos que crear el espacio donde se guardarán los usuarios, mentores y citas.

**1️⃣ Entrar al gestor de la base de datos:**
```bash
sudo -u postgres psql
```

**2️⃣ Crear la base de datos y el administrador:**
Copia y pega estas líneas una por una (asegúrate de cambiar la contraseña si quieres otra):
```sql
CREATE DATABASE estacion_u;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'Est@cionu+2025';
GRANT ALL PRIVILEGES ON DATABASE estacion_u TO postgres;
\q
```
*(El `\q` al final sirve para salir de la consola de postgres).*

### FASE 3: Descargar el Código (GitHub) 📥
Vamos a traer tu proyecto al servidor.

**1️⃣ Clonar el repositorio:**
```bash
cd ~
git clone https://github.com/TU_USUARIO_DE_GITHUB/EstacionU.git
```
*(No olvides cambiar la URL por el link real de tu GitHub).*

### FASE 4: Levantar el Backend (FastAPI) ⚙️
El backend es el "cerebro" y necesita ejecutarse constantemente.

**1️⃣ Crear el entorno virtual y activarlo:**
```bash
cd ~/EstacionU/backend
python3 -m venv venv
source venv/bin/activate
```

**2️⃣ Instalar dependencias de Python:**
Aquí instalamos las librerías necesarias.
```bash
pip install -r requirements.txt
pip install requests google-auth psycopg2-binary
```

**3️⃣ Configurar las contraseñas secretas (.env):**
Este archivo guarda las credenciales. Lo crearemos directamente en el servidor.
```bash
nano .env
```
Copia este texto adentro, reemplazando con tus datos reales. **OJO:** Como la contraseña de la base de datos tiene un arroba `@`, en vez de poner `@` debes escribir `%40` en la línea de `DATABASE_URL` (Ej: `Est%40cionu+2025`):
```env
DATABASE_URL=postgresql://postgres:TU_PASSWORD_AQUI@localhost:5432/estacion_u
SECRET_KEY=tu_super_clave_secreta
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=52560000

# Credenciales de Email (Gmail con contraseña de aplicación)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion
SMTP_FROM_NAME=EstacionU+

# Botón de Google Authentication
GOOGLE_CLIENT_ID=codigo-de-google.apps.googleusercontent.com
```
*Para guardar y salir en Nano, presiona `Ctrl + O`, luego `Enter`, y finalmente `Ctrl + X`.*

**4️⃣ Crear un "Servicio" para que el Backend nunca se apague:**
Si cierras la terminal negra ahora, el backend se apaga. Para evitarlo creamos un servicio de sistema.
```bash
nano /etc/systemd/system/estacionu.service
```
Pega esto adentro:
```ini
[Unit]
Description=Backend de EstacionU (FastAPI con Uvicorn)
After=network.target

[Service]
User=root
WorkingDirectory=/root/EstacionU/backend
Environment="PATH=/root/EstacionU/backend/venv/bin"
ExecStart=/root/EstacionU/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```
*Guarda con `Ctrl + O`, `Enter`, `Ctrl + X`.*

**5️⃣ Encender el backend permanentemente:**
```bash
systemctl daemon-reload
systemctl start estacionu
systemctl enable estacionu
```

### FASE 5: Construir el Frontend (React) 🖥️
Tenemos que transformar el código de React en una página web final que Nginx pueda entender.
```bash
cd ~/EstacionU/frontend
npm install
npm run build
```
*(Al finalizar, se creará una carpeta oculta llamada `dist/` que contiene la web lista).*

### FASE 6: Configurar el Servidor Web (Nginx) 🌐
Le diremos a nuestro servidor que cuando alguien visite `estacionu.com`, le muestre la carpeta `dist/` (frontend) y que cualquier función mágica empiece por `/api/` la envíe al backend.

**1️⃣ Crear el archivo de Nginx:**
```bash
nano /etc/nginx/sites-available/estacionu
```

**2️⃣ Pegar la configuración:**
(Cambia `estacionu.com` por tu dominio si es distinto):
```nginx
server {
    listen 80;
    server_name estacionu.com www.estacionu.com;

    # Dirección al Frontend (React)
    location / {
        root /root/EstacionU/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Dirección al Backend (FastAPI)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```
*Guarda con `Ctrl + O`, `Enter`, `Ctrl + X`.*

**3️⃣ Activar la web y reiniciar Nginx:**
```bash
ln -s /etc/nginx/sites-available/estacionu /etc/nginx/sites-enabled/
systemctl restart nginx
```

### FASE 7: Seguridad y el "Candadito Verde" (SSL Gratis) 🔒
Google exige usar `https://` para dejarte usar su botón de inicio de sesión. Lo instalamos en 1 minuto:
```bash
apt update
apt install certbot python3-certbot-nginx -y
certbot --nginx -d estacionu.com -d www.estacionu.com
```
Te hará unas preguntas:
1. Pon tu correo.
2. Acepta términos (A).
3. Compartir correo (N).
4. **MUY IMPORTANTE:** Te preguntará si quieres Redireccionar (Opciones 1 o 2). Pon el **número 2** para forzar siempre una conexión segura.

### FASE 8: Configuración Final de Google (OAuth) 🔑
Para que el inicio de sesión funcione en la web en vivo:
1. Ve a tu consola de Google Cloud API.
2. Entra a las credenciales de tu proyecto.
3. En "Orígenes de JavaScript autorizados", pon: `https://estacionu.com`
4. En "URIs de redireccionamiento autorizados", pon: `https://estacionu.com`

---

## 🛠️ EXTRA: Cómo actualizar tu web en el futuro

Cada vez que hagas un cambio en tu computadora y lo subas a GitHub (`git push`), debes entrar al servidor (terminal negra) y hacer esto:

**Si el cambio fue visual (Frontend / React):**
```bash
cd ~/EstacionU
git pull origin main
cd frontend
npm run build
```

**Si el cambio fue lógico (Backend / Python / Correos):**
```bash
cd ~/EstacionU
git pull origin main
systemctl restart estacionu
```

¡Y listo! Con esto tendrás la plataforma profesionalmente desplegada y a prueba de todo. 🚀
