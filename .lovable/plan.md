

## Implementar 3 mejoras de auditoría en ServicesSection

### Cambios en `src/components/home/ServicesSection.tsx`

**1. Reducir maxLift** (líneas 66-70)
- De `420 / 360 / 280 / 200` a `280 / 240 / 180 / 120`
- Evita que la sección suba tanto y la sombra invada el Hero.

**2. Cambiar min-h-screen a min-h-[85vh]** (línea 128)
- `min-h-screen` → `min-h-[85vh]`
- Elimina espacio vacío innecesario en pantallas altas.

**3. Añadir gradiente inferior** (después de línea 139, dentro del `div.absolute.inset-0`)
- Nuevo `div` con gradiente `bg-gradient-to-t from-background via-background/40 to-transparent` en la parte inferior (~25% de altura).
- Suaviza la transición de la sección oscura de servicios al fondo claro de "¿Por qué elegirnos?".

