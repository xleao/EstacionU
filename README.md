# 🚀 Guía de Despliegue en VPS (Ubuntu) — EstaciónU

Este documento detalla los pasos para desplegar la plataforma **EstaciónU** en un Servidor Virtual Privado (VPS) utilizando Ubuntu, Nginx, PostgreSQL, FastAPI (Backend) y React/Vite (Frontend).

---

## 📋 Requisitos Previos

- Un servidor VPS con **Ubuntu 20.04 LTS** o superior (Ej. Elastika, DigitalOcean, AWS).
- Acceso al servidor vía **SSH** con usuario `root` o con privilegios `sudo`.
- Un **nombre de dominio** apuntando a la IP pública del servidor (Registro DNS tipo A).
- **Credenciales de la API de Google** (Client ID) para el inicio de sesión.
- Una cuenta de correo (ej. Gmail) con **"Contraseña de aplicación"** para el envío de correos SMTP.

---

## Paso 1: Preparar el Servidor e Instalar Dependencias del Sistema

Conéctate a tu servidor por SSH y actualiza los paquetes del sistema:

```bash
apt update && apt upgrade -y
```

Instala las herramientas fundamentales, Node.js, Python, PostgreSQL y Nginx:

```bash
# Herramientas básicas y base de datos
apt install git curl nginx postgresql postgresql-contrib -y

# Entorno Python (Asegúrate de tener Python 3.8 o superior)
apt install python3 python3-venv python3-pip -y

# Instalar Node.js (Versión 20.x recomendada)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

---

## Paso 2: Configurar la Base de Datos (PostgreSQL)

Entra a la consola de PostgreSQL para crear la base de datos y el usuario:

```bash
sudo -u postgres psql
```

Ejecuta los siguientes comandos SQL (cambia la contraseña por una segura):

```sql
CREATE DATABASE estacion_u;
CREATE USER postgres WITH ENCRYPTED PASSWORD 'TuPasswordSeguro123';
GRANT ALL PRIVILEGES ON DATABASE estacion_u TO postgres;
\q
```

---

## Paso 3: Clonar el Proyecto

Descarga el código fuente desde GitHub a tu servidor:

```bash
cd ~
git clone https://github.com/TU_USUARIO/EstacionU.git
cd EstacionU
```

---

## Paso 4: Desplegar el Backend (FastAPI)

**1. Crear y activar el entorno virtual:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

**2. Instalar las dependencias de Python:**

```bash
pip install -r requirements.txt
# En caso de faltar librerías específicas:
pip install requests google-auth psycopg2-binary
```

**3. Configurar las Variables de Entorno (`.env`):**

Crea el archivo `.env` en la carpeta `backend/`:

```bash
nano .env
```

Pega el siguiente contenido *(Nota: Si tu clave de BD tiene un arroba `@`, reemplázalo por `%40`)*:

```env
DATABASE_URL=postgresql://postgres:TuPasswordSeguro123@localhost:5432/estacion_u
SECRET_KEY=tu_super_llave_secreta_aqui
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=52560000

# Configuración de Correo Electrónico (Google)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu_correo@gmail.com
SMTP_PASSWORD=tu_contraseña_de_aplicacion
SMTP_FROM_NAME=EstacionU+

# Login de Google
GOOGLE_CLIENT_ID=tu_cliente_id_de_google_cloud.apps.googleusercontent.com
```

**4. Crear el Servicio de Systemd** *(Para que el backend nunca se apague)*:

```bash
nano /etc/systemd/system/estacionu.service
```

Pega este bloque de configuración:

```ini
[Unit]
Description=Gunicorn instance to serve EstacionU FastAPI Application
After=network.target

[Service]
User=root
Group=www-data
WorkingDirectory=/root/EstacionU/backend
Environment="PATH=/root/EstacionU/backend/venv/bin"
ExecStart=/root/EstacionU/backend/venv/bin/uvicorn app.main:app --host 127.0.0.1 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

**5. Habilita e inicia el servicio:**

```bash
systemctl daemon-reload
systemctl start estacionu
systemctl enable estacionu
```

---

## Paso 5: Desplegar el Frontend (React + Vite)

Construye la versión de producción que será leída por el servidor web:

```bash
cd ~/EstacionU/frontend
npm install
npm run build
```

> Esto generará una carpeta llamada `dist/` en tu directorio `frontend/`.

---

## Paso 6: Configurar el Servidor Web (Nginx)

Le indicaremos a Nginx cómo mostrar el frontend y cómo conectar con el backend:

```bash
nano /etc/nginx/sites-available/estacionu
```

Pega esta configuración *(sustituye `midominio.com` por tu dominio oficial)*:

```nginx
server {
    listen 80;
    server_name midominio.com www.midominio.com;

    # Bloque para el Frontend (React)
    location / {
        root /root/EstacionU/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Bloque para el Backend (API)
    location /api/ {
        proxy_pass http://127.0.0.1:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Habilita la web y reinicia Nginx:

```bash
ln -s /etc/nginx/sites-available/estacionu /etc/nginx/sites-enabled/
systemctl restart nginx
```

---

## Paso 7: Seguridad y Certificado SSL (HTTPS)

Para habilitar el candadito de seguridad *(esencial para Google Login)*, instala Certbot:

```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d midominio.com -d www.midominio.com
```

> Sigue las instrucciones en pantalla y asegúrate de elegir la opción **2: Redirect** cuando te pregunte si deseas redirigir todo el tráfico a HTTPS.

---

## Paso 8: Configuración Final en Google Cloud (OAuth)

1. Ve a la [Consola de Credenciales de Google Cloud](https://console.cloud.google.com/apis/credentials).
2. Edita tus credenciales de **OAuth 2.0**.
3. En **Orígenes de JavaScript autorizados**, añade:
   ```
   https://midominio.com
   ```
4. En **URIs de redireccionamiento autorizados**, añade:
   ```
   https://midominio.com
   ```

---

## 🛠️ Comandos Útiles de Mantenimiento

**¿Cómo actualizar la página cuando hago cambios en el código?**

```bash
# 1. Bajar los cambios
cd ~/EstacionU
git pull origin main

# 2. Reconstruir el Frontend (si hubo cambios visuales)
cd frontend
npm run build

# 3. Reiniciar el Backend (si hubo cambios lógicos o de base de datos)
systemctl restart estacionu
```

**Ver el estado y los errores del Backend:**

```bash
systemctl status estacionu
journalctl -u estacionu.service -n 50 --no-pager
```
