// Genera los iconos de la app instalable a partir de un dibujo propio:
// un círculo violeta (la elección) con un punto magenta (tú).
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const salida = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(salida, { recursive: true });

// `zona` es la fracción del lienzo que ocupa el dibujo; las máscaras de
// Android recortan los bordes, así que la versión maskable lo deja más chico.
const svg = (zona) => {
  const r = 256 * zona;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#08060d"/>
  <circle cx="256" cy="256" r="${r * 0.78}" fill="none" stroke="#9b6dff" stroke-width="${r * 0.14}"/>
  <circle cx="256" cy="256" r="${r * 0.3}" fill="#ff4f9a"/>
</svg>`;
};

const crear = (nombre, zona, tam) =>
  sharp(Buffer.from(svg(zona)))
    .resize(tam, tam)
    .png()
    .toFile(join(salida, nombre));

await crear("icon-192.png", 0.86, 192);
await crear("icon-512.png", 0.86, 512);
await crear("icon-maskable-512.png", 0.62, 512);
await crear("apple-touch-icon.png", 0.74, 180);
console.log("iconos listos");
