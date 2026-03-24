# 🚀 Checklist de Despliegue — Isla Cloud API

Sigue estos pasos **en orden** cada vez que subas cambios al servidor.

---

## 1. Antes de subir archivos

- [ ] Ejecuta `node -c server.js` en local para verificar que no hay errores de sintaxis.
- [ ] Comprueba que `package.json` incluye todas las dependencias nuevas.
- [ ] Si añadiste nuevos `require()`, asegúrate de que los archivos existen.

## 2. Subir archivos al servidor

- [ ] Sube **todos** los archivos modificados del backend (no solo `server.js`).
- [ ] Incluye: `server.js`, `package.json`, carpetas `routes/`, `middleware/`, `config/`.
- [ ] **No subas** `.env`, `node_modules/`, ni `.git/`.

## 3. Instalar dependencias (si cambiaste package.json)

- [ ] En Plesk → Node.js → **Instalación de NPM**.

## 4. Verificar variables de entorno

- [ ] Comprueba que `.env` existe en la raíz de la app con: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN`, `UPLOAD_DIR`.

## 5. Reiniciar la aplicación

- [ ] En Plesk → Node.js → **Reiniciar app** (NO usar pm2 ni node manual).

## 6. Verificar que funciona

```bash
curl -s https://api.islacloudsolutions.com/api/health | python3 -m json.tool
```

Respuesta esperada:
```json
{
  "status": "healthy",
  "checks": {
    "server": { "status": "ok" },
    "database": { "status": "ok" },
    "environment": { "status": "ok", "missing": [] }
  }
}
```

## 7. Si algo falla

1. Revisa logs: `tail -100 /var/log/passenger/passenger.log`
2. Errores comunes:
   - `Cannot find module` → Falta archivo o `npm install`.
   - `ECONNREFUSED :3306` → MariaDB caída o credenciales incorrectas.
   - `SyntaxError` → Ejecuta `node -c server.js`.

## 8. Verificar CORS

```bash
curl -i -X OPTIONS https://api.islacloudsolutions.com/api/auth/login \
  -H "Origin: https://desa.islacloudsolutions.com" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"
```

Debe devolver `204` con `Access-Control-Allow-Origin`.