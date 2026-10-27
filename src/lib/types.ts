export type Ent = { c: number; n: string; a: string };

export type Cube = {
  years: number[];
  ent: Ent[];
  y: number[];
  e: number[];
  s: number[];
  t: number[];
  a: number[];
  ln: number[];
  sv: number[];
  nv: number[];
};

export type Muni = {
  mp: [number, number, string][];
  i: number[];
  y: number[];
  g: number[];
  ln: number[];
  sv: number[];
  nv: number[];
};

export type Totals = { ln: number; sv: number; nv: number };
