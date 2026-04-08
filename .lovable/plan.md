

## Plan: Traducción automática de contenidos CMS con OpenAI

### Resumen

Cuando un administrador guarda un contenido en español desde el panel, el backend automáticamente lo traduce al inglés usando la API de OpenAI y guarda ambas versiones. El frontend pide los contenidos en el idioma activo del usuario.

### Arquitectura

```text
Panel CMS → PUT /api/contents/:key
  ├─ Guarda valor ES (content_key = "hero_title")
  ├─ Llama a OpenAI para traducir ES → EN
  └─ Guarda valor EN (content_key = "hero_title__en")

Frontend (idioma = "en") → GET /api/contents?lang=en
  └─ Devuelve claves con sufijo __en, mapeadas sin sufijo
```

### Cambios

#### 1. Backend: Nuevo archivo `backend/services/translator.js`
- Módulo que llama a la API de OpenAI (`POST https://api.openai.com/v1/chat/completions`)
- Usa `OPENAI_API_KEY` del `.env`
- Modelo: `gpt-4o-mini` (rápido y barato para traducciones)
- System prompt: "Traduce el siguiente texto de español a inglés. Mantén el formato HTML si lo tiene. Devuelve SOLO la traducción."
- Manejo de errores: si falla la traducción, se loguea pero no bloquea el guardado del contenido original

#### 2. Backend: Modificar `backend/routes/contents.js`
- **GET `/api/contents?lang=en`**: Si `lang=en`, busca primero las claves con sufijo `__en`; si no existe, devuelve la versión ES como fallback. Devuelve el mapa sin el sufijo para que el frontend no necesite cambios en las claves.
- **PUT `/api/contents/:key`**: Después de guardar el contenido ES, llama al traductor de forma asíncrona (sin bloquear la respuesta) y guarda el resultado como `{key}__en`. Para contenidos de tipo `json` (como nav links), traduce los valores de texto dentro del JSON.

#### 3. Backend: Actualizar `backend/config/init-db.js`
- Añadir migración segura: nada especial, las claves `__en` se crean dinámicamente en la misma tabla `contents`.

#### 4. Backend: Actualizar `.env.template` y `.env.example`
- Añadir variable `OPENAI_API_KEY`

#### 5. Backend: Actualizar `backend/package.json`
- No se necesitan dependencias nuevas; se usa `fetch` nativo de Node.js 18+ (o el `node-fetch` si es Node <18). El servidor ya corre Node moderno.

#### 6. Frontend: Modificar `src/hooks/useCMS.tsx`
- El `CMSProvider` lee el idioma actual del `LanguageContext`
- Pasa `?lang=es` o `?lang=en` a `contentsApi.list()`
- Cuando el idioma cambia, vuelve a cargar los contenidos

#### 7. Frontend: Modificar `src/lib/api.ts`
- `contentsApi.list()` acepta un parámetro `lang` opcional y lo envía como query string

#### 8. Panel CMS: Indicador visual (opcional pero recomendado)
- Pequeño badge "🌐 Auto-traducido" junto a cada campo en `PanelContenidos.tsx` para que el admin sepa que se traducirá automáticamente

### Configuración necesaria del cliente
- El cliente debe obtener una API key de OpenAI en https://platform.openai.com/api-keys
- Añadirla como `OPENAI_API_KEY` en el `.env` del servidor backend
- Reiniciar el servidor Node.js

### Detalles técnicos clave
- Las traducciones se ejecutan en background (fire-and-forget) para no ralentizar el guardado
- Fallback: si no existe traducción EN, se muestra el texto ES
- Los contenidos tipo `json` (configuración de nav links, redes sociales) no se traducen (son datos estructurales)
- Los contenidos tipo `html` se traducen preservando las etiquetas HTML

