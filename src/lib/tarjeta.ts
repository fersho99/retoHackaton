import { rate, totalsForAge, totalsForScope } from "./data";
import { nombreEstado } from "./estados";
import type { Cube } from "./types";

const YEAR_IDX = 5; // 2024

/** Lee estado y edad de la URL; cualquier valor fuera de rango cuenta como "sin dato". */
export function leerParams(sp: URLSearchParams) {
  const e = Number.parseInt(sp.get("e") ?? "", 10);
  const a = Number.parseInt(sp.get("a") ?? "", 10);
  return {
    estado: e >= 1 && e <= 32 ? e : null,
    edad: a >= 18 && a <= 90 ? a : null,
  };
}

export function paramsDe(estado: number | null, edad: number | null) {
  const sp = new URLSearchParams();
  if (estado != null) sp.set("e", String(estado));
  if (edad != null) sp.set("a", String(edad));
  return sp;
}

/** Lo que dice la tarjeta. Las cifras salen siempre del cubo, nunca de la URL. */
export function datosTarjeta(cube: Cube, estado: number | null, edad: number | null) {
  const nombre = nombreEstado(estado);
  const enLugar = nombre ? `en ${nombre}` : "en todo el país";
  const t =
    edad != null
      ? totalsForAge(cube, estado, YEAR_IDX, edad)
      : totalsForScope(cube, estado, YEAR_IDX);
  const tasa = rate(t);
  const sujeto = edad != null ? `las personas de ${edad} años` : "las personas inscritas";
  return {
    tasa: tasa == null ? null : Math.round(tasa),
    conEdad: edad != null,
    frase: `de ${sujeto} ${enLugar} votó en 2024.`,
    texto:
      tasa == null
        ? "¿Cuánto pesa tu voto?"
        : `${enLugar.charAt(0).toUpperCase()}${enLugar.slice(1)} votó el ${Math.round(tasa)}% de ${sujeto}. ¿Y tú?`,
  };
}
