import type { Cube, Muni, Totals } from "./types";

export const YEARS = [2009, 2012, 2015, 2018, 2021, 2024];
export const PRES = [1, 3, 5]; // índices de elecciones presidenciales
export const MIDI = [0, 2, 4]; // índices de elecciones intermedias
export const BANDN = ["18–24", "25–29", "30–39", "40–59", "60 o más"];
export const BAND_BOUNDS: [number, number][] = [
  [18, 24],
  [25, 29],
  [30, 39],
  [40, 59],
  [60, 90],
];

export function bandOf(age: number): number {
  if (age <= 24) return 0;
  if (age <= 29) return 1;
  if (age <= 39) return 2;
  if (age <= 59) return 3;
  return 4;
}

export function rate(o: Totals | null | undefined): number | null {
  if (!o || o.sv + o.nv <= 0) return null;
  return (o.sv / (o.sv + o.nv)) * 100;
}

export function fp(v: number | null | undefined, d = 1): string {
  if (v == null || !isFinite(v)) return "—";
  return v.toFixed(d) + "%";
}

export function fn(v: number | null | undefined): string {
  if (v == null || !isFinite(v)) return "—";
  return Math.round(v).toLocaleString("es-MX");
}

function emptyTotals(): Totals {
  return { ln: 0, sv: 0, nv: 0 };
}
function addTotals(a: Totals, o: { ln: number; sv: number; nv: number }) {
  a.ln += o.ln;
  a.sv += o.sv;
  a.nv += o.nv;
}

let cubePromise: Promise<Cube> | null = null;
let muniPromise: Promise<Muni> | null = null;

export function loadCube(): Promise<Cube> {
  if (!cubePromise) {
    cubePromise = fetch("/data/cube.json").then((r) => r.json());
  }
  return cubePromise;
}

export function loadMuni(): Promise<Muni> {
  if (!muniPromise) {
    muniPromise = fetch("/data/municipal.json").then((r) => r.json());
  }
  return muniPromise;
}

/** Curva de participación por edad exacta (18–90), para un estado (entCode) o nacional (entCode=null). */
export function ageCurve(
  cube: Cube,
  entCode: number | null,
  yearIdx: number,
): { age: number; rate: number | null; ln: number }[] {
  const byAge = new Map<number, Totals>();
  const n = cube.y.length;
  for (let i = 0; i < n; i++) {
    if (cube.y[i] !== yearIdx) continue;
    if (entCode != null && cube.e[i] !== entCode) continue;
    const a = cube.a[i];
    let o = byAge.get(a);
    if (!o) {
      o = emptyTotals();
      byAge.set(a, o);
    }
    addTotals(o, { ln: cube.ln[i], sv: cube.sv[i], nv: cube.nv[i] });
  }
  const out: { age: number; rate: number | null; ln: number }[] = [];
  for (let a = 18; a <= 90; a++) {
    const o = byAge.get(a);
    out.push({ age: a, rate: rate(o), ln: o ? o.ln : 0 });
  }
  return out;
}

/** Totales para una edad exacta dentro de un estado (o nacional si entCode=null). */
export function totalsForAge(
  cube: Cube,
  entCode: number | null,
  yearIdx: number,
  age: number,
): Totals {
  const out = emptyTotals();
  const n = cube.y.length;
  for (let i = 0; i < n; i++) {
    if (cube.y[i] !== yearIdx) continue;
    if (entCode != null && cube.e[i] !== entCode) continue;
    if (cube.a[i] !== age) continue;
    addTotals(out, { ln: cube.ln[i], sv: cube.sv[i], nv: cube.nv[i] });
  }
  return out;
}

/** Totales para un rango de edades [desde, hasta] dentro de un estado (o nacional). */
export function totalsForAgeRange(
  cube: Cube,
  entCode: number | null,
  yearIdx: number,
  desde: number,
  hasta: number,
): Totals {
  const out = emptyTotals();
  const n = cube.y.length;
  for (let i = 0; i < n; i++) {
    if (cube.y[i] !== yearIdx) continue;
    if (entCode != null && cube.e[i] !== entCode) continue;
    if (cube.a[i] < desde || cube.a[i] > hasta) continue;
    addTotals(out, { ln: cube.ln[i], sv: cube.sv[i], nv: cube.nv[i] });
  }
  return out;
}

/** Promedio nacional por grupo de edad (banda 0–4), calculado desde el cubo de edad exacta. */
export function nationalBandTotals(cube: Cube, band: number, yearIdx: number): Totals {
  const out = emptyTotals();
  const n = cube.y.length;
  for (let i = 0; i < n; i++) {
    if (cube.y[i] !== yearIdx) continue;
    if (bandOf(cube.a[i]) !== band) continue;
    addTotals(out, { ln: cube.ln[i], sv: cube.sv[i], nv: cube.nv[i] });
  }
  return out;
}

/** Lista de municipios por estado, ordenada alfabéticamente, con su índice en muni.mp. */
export function listMunicipiosByEnt(muni: Muni): Record<number, { i: number; n: string }[]> {
  const out: Record<number, { i: number; n: string }[]> = {};
  muni.mp.forEach((m, i) => {
    const [edo, , nombre] = m;
    if (!out[edo]) out[edo] = [];
    out[edo].push({ i, n: nombre });
  });
  Object.keys(out).forEach((k) => {
    out[+k].sort((a, b) => a.n.localeCompare(b.n, "es"));
  });
  return out;
}

/** Totales por grupo de edad (5 bandas) para un municipio y una elección. */
export function municipioBands(muni: Muni, mi: number, yearIdx: number): Totals[] {
  const out = BANDN.map(() => emptyTotals());
  const n = muni.i.length;
  for (let r = 0; r < n; r++) {
    if (muni.i[r] !== mi || muni.y[r] !== yearIdx) continue;
    addTotals(out[muni.g[r]], { ln: muni.ln[r], sv: muni.sv[r], nv: muni.nv[r] });
  }
  return out;
}

/** Totales para un estado (o nacional) y una elección, sumando todas las edades. */
export function totalsForScope(cube: Cube, entCode: number | null, yearIdx: number): Totals {
  const out = emptyTotals();
  const n = cube.y.length;
  for (let i = 0; i < n; i++) {
    if (cube.y[i] !== yearIdx) continue;
    if (entCode != null && cube.e[i] !== entCode) continue;
    addTotals(out, { ln: cube.ln[i], sv: cube.sv[i], nv: cube.nv[i] });
  }
  return out;
}

/** Elección comparable anterior (mismo tipo: presidencial o intermedia). */
export function prevSameType(yearIdx: number): number | null {
  const arr = PRES.includes(yearIdx) ? PRES : MIDI;
  const k = arr.indexOf(yearIdx);
  return k > 0 ? arr[k - 1] : null;
}

export function electionLabel(yearIdx: number): string {
  return `${YEARS[yearIdx]} (${PRES.includes(yearIdx) ? "presidencial" : "intermedia"})`;
}
