# Isla Cloud Solutions - Backend API

## Requisitos
- Node.js 18+
- MariaDB 10.6+

## Instalación

```bash
cd backend
npm install
```

## Configuración

Crea un archivo `.env` en esta carpeta:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=islacloud
DB_PASSWORD=tu_password_seguro
DB_NAME=islacloud_db
JWT_SECRET=tu_clave_secreta_jwt_muy_larga_y_segura
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://www.islacloudsolutions.com
UPLOAD_DIR=./uploads
```

## Inicializar base de datos

```bash
npm run init-db
```

Esto creará las tablas y un usuario admin por defecto:
- **Email:** admin@islacloudsolutions.com
- **Password:** IslaCloud2024!

⚠️ **Cambia la contraseña inmediatamente después del primer login.**

## Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Endpoints

### Auth
- `POST /api/auth/login` - Login (devuelve JWT)
- `GET /api/auth/me` - Usuario actual (requiere token)

### Servicios
- `GET /api/services` - Listar servicios (público)
- `GET /api/services/:id` - Detalle servicio (público)
- `POST /api/services` - Crear servicio (admin)
- `PUT /api/services/:id` - Editar servicio (admin)
- `DELETE /api/services/:id` - Eliminar servicio (admin)

### Noticias
- `GET /api/news` - Listar noticias (público)
- `GET /api/news/:id` - Detalle noticia (público)
- `POST /api/news` - Crear noticia (admin)
- `PUT /api/news/:id` - Editar noticia (admin)
- `DELETE /api/news/:id` - Eliminar noticia (admin)

### Contactos
- `POST /api/contacts` - Enviar formulario (público, rate-limited)
- `GET /api/contacts` - Listar contactos (admin)
- `PUT /api/contacts/:id/read` - Marcar como leído (admin)
- `DELETE /api/contacts/:id` - Eliminar contacto (admin)

### Contenidos
- `GET /api/contents` - Listar contenidos editables (público)
- `PUT /api/contents/:key` - Editar contenido (admin)

### Uploads
- `POST /api/upload` - Subir imagen (admin)
