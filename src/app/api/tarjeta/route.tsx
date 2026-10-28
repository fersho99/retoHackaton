import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { datosTarjeta, leerParams } from "@/lib/tarjeta";
import type { Cube } from "@/lib/types";

/* eslint-disable @next/next/no-img-element -- la imagen se dibuja en el servidor, next/image no aplica */

const C = {
  bg: "#08060d",
  ink: "#f4f1fa",
  ink2: "#b9b0cc",
  ink3: "#7d7393",
  magenta: "#ff4f9a",
};

// La imagen de fondo mide 1024×572 y el punto magenta ("tú") está en (755, 285)
const FONDO = { w: 1024, h: 572, x: 755, y: 285 };

type Recursos = {
  cube: Cube;
  fondo: string;
  fuentes: { name: string; data: Buffer; weight: 500 | 900 }[];
};

let recursos: Promise<Recursos> | null = null;

function cargar(): Promise<Recursos> {
  recursos ??= (async () => {
    const raiz = process.cwd();
    const [cube, fondo, negra, media] = await Promise.all([
      readFile(join(raiz, "public/data/cube.json"), "utf8"),
      readFile(join(raiz, "public/img/compartir-fondo.jpg")),
      readFile(join(raiz, "assets/fonts/Archivo-CondensedBlack.woff")),
      readFile(join(raiz, "assets/fonts/Archivo-Medium.woff")),
    ]);
    return {
      cube: JSON.parse(cube) as Cube,
      fondo: `data:image/jpeg;base64,${fondo.toString("base64")}`,
      fuentes: [
        { name: "Display", data: negra, weight: 900 },
        { name: "Texto", data: media, weight: 500 },
      ],
    };
  })();
  return recursos;
}

/** Coloca el fondo para que el punto magenta caiga en (cx, cy) con la altura dada. */
function fondoEn(alto: number, cx: number, cy: number) {
  const k = alto / FONDO.h;
  return { width: FONDO.w * k, height: alto, left: cx - FONDO.x * k, top: cy - FONDO.y * k };
}

export async function GET(req: NextRequest) {
  const { cube, fondo, fuentes } = await cargar();
  const { estado, edad } = leerParams(req.nextUrl.searchParams);
  const d = datosTarjeta(cube, estado, edad);
  const og = req.nextUrl.searchParams.get("f") === "og";
  const sitio = req.nextUrl.host;
  const colorCifra = d.conEdad ? C.magenta : C.ink;
  const cifra = d.tasa == null ? "—" : `${d.tasa}%`;

  const etiqueta = { fontFamily: "Texto", color: C.ink3 };

  const imagen = og ? (
    <div
      style={{ display: "flex", width: 1200, height: 630, background: C.bg, position: "relative" }}
    >
      <img src={fondo} alt="" style={{ position: "absolute", ...fondoEn(670, 930, 300) }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          backgroundImage: `linear-gradient(to right, ${C.bg} 30%, rgba(8,6,13,0) 75%)`,
        }}
      />
      <div style={{ display: "flex", flexDirection: "column", padding: 64, width: 720 }}>
        <div style={{ ...etiqueta, fontSize: 24 }}>Elección federal de 2024</div>
        <div
          style={{
            fontFamily: "Display",
            fontSize: 220,
            lineHeight: 0.9,
            color: colorCifra,
            marginTop: 40,
          }}
        >
          {cifra}
        </div>
        <div
          style={{
            fontFamily: "Texto",
            fontSize: 36,
            color: C.ink2,
            marginTop: 16,
            lineHeight: 1.25,
          }}
        >
          {d.frase}
        </div>
        <div style={{ ...etiqueta, fontSize: 24, marginTop: "auto" }}>{sitio} · Datos del INE</div>
      </div>
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 1080,
        height: 1920,
        background: C.bg,
        position: "relative",
        padding: 96,
      }}
    >
      <img src={fondo} alt="" style={{ position: "absolute", ...fondoEn(1150, 540, 560) }} />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1152,
          display: "flex",
          // Llega al fondo antes del borde de la foto para que no se note el corte
          backgroundImage: `linear-gradient(to bottom, rgba(8,6,13,0.55) 0%, rgba(8,6,13,0) 20%, rgba(8,6,13,0) 50%, ${C.bg} 94%)`,
        }}
      />
      <div style={{ ...etiqueta, fontSize: 34 }}>Elección federal de 2024</div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
        <div style={{ fontFamily: "Display", fontSize: 360, lineHeight: 0.88, color: colorCifra }}>
          {cifra}
        </div>
        <div
          style={{
            fontFamily: "Texto",
            fontSize: 58,
            lineHeight: 1.2,
            color: C.ink2,
            marginTop: 28,
          }}
        >
          {d.frase}
        </div>
        <div
          style={{
            fontFamily: "Display",
            fontSize: 190,
            lineHeight: 0.9,
            color: C.ink,
            marginTop: 96,
            textTransform: "uppercase",
          }}
        >
          ¿Y tú?
        </div>
        <div style={{ fontFamily: "Texto", fontSize: 40, color: C.ink2, marginTop: 24 }}>
          Descubre cuánto pesa tu voto.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 96,
            ...etiqueta,
            fontSize: 30,
          }}
        >
          <span>{sitio}</span>
          <span>Datos del INE</span>
        </div>
      </div>
    </div>
  );

  return new ImageResponse(imagen, {
    width: og ? 1200 : 1080,
    height: og ? 630 : 1920,
    fonts: fuentes.map((f) => ({ ...f, style: "normal" as const })),
    headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
  });
}
