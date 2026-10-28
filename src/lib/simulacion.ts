import { BAND_BOUNDS, BANDN, bandOf, rate, totalsForAgeRange, totalsForScope } from "./data";
import type { Cube } from "./types";

export type Grupo = { etiqueta: string; desde: number; hasta: number; banda: number | null };

/** El grupo que se simula: el de tu edad o, sin edad, las personas de 18 a 29. */
export function grupoDe(edad: number | null): Grupo {
  if (edad == null) return { etiqueta: "18–29 años", desde: 18, hasta: 29, banda: null };
  const banda = bandOf(edad);
  const [desde, hasta] = BAND_BOUNDS[banda];
  return { etiqueta: banda === 4 ? "60 años o más" : `${BANDN[banda]} años`, desde, hasta, banda };
}

export type Ancla = { valor: number; etiqueta: string };

export type Modelo = {
  grupo: Grupo;
  /** Personas del grupo que votaron o no (base de la tasa) */
  base: number;
  votaron: number;
  /** Participación real del grupo, en % */
  hoy: number;
  /** Votos emitidos por todas las edades en el lugar */
  votosTotales: number;
  anclas: Ancla[];
};

export function modelo(cube: Cube, estado: number | null, yearIdx: number, edad: number | null) {
  const grupo = grupoDe(edad);
  const g = totalsForAgeRange(cube, estado, yearIdx, grupo.desde, grupo.hasta);
  const todos = totalsForScope(cube, estado, yearIdx);
  const hoy = rate(g);
  if (hoy == null) return null;

  const anclas: Ancla[] = [{ valor: hoy, etiqueta: "Hoy" }];
  const promedio = rate(todos);
  if (promedio != null && promedio > hoy + 1)
    anclas.push({ valor: promedio, etiqueta: "Promedio" });

  // El grupo de edad que más votó en el mismo lugar
  let mejor: { tasa: number; banda: number } | null = null;
  for (let b = 0; b < BAND_BOUNDS.length; b++) {
    if (b === grupo.banda) continue;
    const [d, h] = BAND_BOUNDS[b];
    const t = rate(totalsForAgeRange(cube, estado, yearIdx, d, h));
    if (t != null && (mejor == null || t > mejor.tasa)) mejor = { tasa: t, banda: b };
  }
  if (mejor && mejor.tasa > hoy + 1) {
    anclas.push({
      valor: mejor.tasa,
      etiqueta: mejor.banda === 4 ? "Como los de 60+" : `Como los de ${BANDN[mejor.banda]}`,
    });
  }
  anclas.push({ valor: 100, etiqueta: "Todos" });

  return {
    grupo,
    base: g.sv + g.nv,
    votaron: g.sv,
    hoy,
    votosTotales: todos.sv,
    anclas,
  } satisfies Modelo;
}

/** Qué pasaría si el grupo votara al p %. */
export function simular(m: Modelo, p: number) {
  const pEf = Math.max(m.hoy, Math.min(100, p));
  const votarian = (pEf / 100) * m.base;
  const extra = votarian - m.votaron;
  return {
    p: pEf,
    extra,
    pesoHoy: (m.votaron / m.votosTotales) * 100,
    pesoNuevo: (votarian / (m.votosTotales + extra)) * 100,
  };
}
