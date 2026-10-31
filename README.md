# Si no votas, otros deciden por ti

Aplicación web para el hackathon **«Hackea la participación: Datos que construyen democracia»** del Instituto Nacional Electoral, **Reto 3: Comunicación y visualización con impacto público** (storytelling con datos).

Equipo **Code Hunters**: Bryan Fernando Medina Zavala y Jorvid Jesús Chávez Chávez.

- Sitio: https://reto-hackaton-flax.vercel.app
- Se puede instalar como aplicación en el celular y funciona sin conexión.

## Qué hace

La persona escribe su edad y elige su estado, y la historia se recalcula para ella:

1. **La curva por edad.** Cuánta gente de cada edad votó en 2024, con un punto que marca la edad de quien usa el sitio.
2. **Su estado y su municipio.** Qué porcentaje de la lista nominal tiene su edad y qué porcentaje de los votos aportó.
3. **El simulador.** Cuántos votos más habría si su generación votara más, con un control deslizable.
4. **Una tarjeta para compartir.** Imagen vertical con su cifra y un enlace que conserva estado y edad.

Los textos son plantillas con las cifras: el sitio no estima ni interpreta, y el simulador es un ejercicio ilustrativo, no una predicción.

## Datos

Conteos Censales de Participación Ciudadana (CCPC) del INE, elecciones federales de 2009, 2012, 2015, 2018, 2021 y 2024. Se usan datos agregados por elección, entidad, edad y municipio; no hay ningún dato personal.

La participación se calcula como personas que votaron entre las personas inscritas en la lista nominal que votaron o no votaron. El resultado nacional de 2024 (59.7 %) coincide con los reportes del INE.

Los datos ya procesados están en `public/data/` (`cube.json` y `municipal.json`) y se cargan como archivos estáticos.

## Cómo ejecutarlo

Requiere Node.js 20 o superior.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # compilación de producción
npm run start
```

## Estructura

- `src/app/`: páginas, manifiesto de la aplicación y la ruta `/api/tarjeta`, que genera la imagen para compartir.
- `src/components/`: secciones de la historia (`landing`, `curva`, `municipio`, `simulador`, `compartir`).
- `src/lib/`: lectura de datos, estados, simulación y tarjeta.
- `public/`: datos, imágenes, íconos y el service worker (`sw.js`) para el uso sin conexión.

## Tecnología

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Recharts, Motion, NumberFlow y Zustand. Tipografía Archivo. Desplegado en Vercel.
