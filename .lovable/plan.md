

## Plan: Overlap agresivo de Servicios sobre Hero

**Objetivo**: Que la sección de servicios "se coma" el Hero y la Intro al hacer scroll, dando la sensación de que la sección sube y tapa todo lo anterior, no de scroll normal.

### Enfoque técnico

La sección de servicios ya tiene `z-20` (por encima del Hero `z-0` e Intro `z-0`), y usa `translateY` negativo sincronizado con scroll. Solo necesitamos:

1. **Aumentar `maxLift` drásticamente** en `ServicesSection.tsx` (líneas 66-70): de `280/240/180/120` a valores mucho más altos como `500/420/340/260`, para que la sección suba lo suficiente y tape el Hero completo.

2. **Hacer la sombra-cap más alta** (línea 121): cambiar `h-12 md:h-16 lg:h-20` a `h-24 md:h-32 lg:h-40` para que el desvanecimiento cubra más contenido al subir.

3. **Ajustar el rango de scroll** (líneas 61-62): ampliar el rango (`start`/`end`) para que el efecto empiece antes y dure más, creando una animación más progresiva.

4. **Asegurar z-index del Hero e Intro**: Verificar que Hero e Intro tengan `z-index` inferior (ya lo tienen con `z-0`), así la sección de servicios pasa por encima.

### Archivos a modificar
- `src/components/home/ServicesSection.tsx` — maxLift, shadow height, scroll range

