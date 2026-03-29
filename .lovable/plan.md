

## Crossfade suave entre imágenes del Hero

### Problema actual
Con `mode="wait"`, la imagen anterior desaparece completamente antes de que entre la nueva, creando un flash negro. El usuario quiere un fundido cruzado (dissolve) donde ambas imágenes se solapan brevemente.

### Solución

Cambiar la estrategia de `AnimatePresence` en `HeroSection.tsx`:

1. **Quitar `mode="wait"`** — permitir que ambas imágenes coexistan brevemente durante la transición.
2. **Ajustar animaciones del `motion.img`**:
   - `initial`: `opacity: 0, scale: 1.08`
   - `animate`: `opacity: 1, scale: 1` con duración ~0.7s
   - `exit`: `opacity: 0, scale: 1` con duración ~0.5s
3. **Asegurar apilamiento**: la imagen entrante se renderiza encima de la saliente (ya ocurre por orden DOM en AnimatePresence sin mode="wait").

Esto produce un dissolve cinematográfico donde la nueva imagen aparece gradualmente sobre la anterior.

### Archivo afectado
- `src/components/home/HeroSection.tsx` — solo el bloque de `AnimatePresence` + `motion.img` del fondo.

