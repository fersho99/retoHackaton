"use client";

import { usePrefersReducedMotion } from "@number-flow/react";
import clsx from "clsx";
import { forwardRef, useMemo, useState, type CSSProperties } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { CampoSelect, NotaPromedio } from "@/components/ui/campo";
import { Cifra } from "@/components/ui/cifra";
import {
  BANDN,
  bandOf,
  fn,
  fp,
  listMunicipiosByEnt,
  municipioBands,
  nationalBandTotals,
  rate,
} from "@/lib/data";
import { nombreEstado } from "@/lib/estados";
import { EASE_OUT } from "@/lib/motion";
import { useSelection } from "@/lib/selection";
import type { Totals } from "@/lib/types";
import { useCube, useMuni } from "@/lib/use-data";
import { useReveal } from "@/lib/use-reveal";

const YEAR_IDX = 5; // 2024
const TICK = { fill: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-mono)" };
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

function Tip({ active, payload }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as { nombre: string; tasa: number | null; ln: number };
  return (
    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs shadow-lg shadow-black/50">
      <p className="hud mb-1">{d.nombre}</p>
      <p className="num text-ink">Votó · {fp(d.tasa)}</p>
      <p className="num text-ink-2">Lista nominal · {fn(d.ln)}</p>
    </div>
  );
}

function suma(bands: Totals[]): Totals {
  return bands.reduce((s, b) => ({ ln: s.ln + b.ln, sv: s.sv + b.sv, nv: s.nv + b.nv }), {
    ln: 0,
    sv: 0,
    nv: 0,
  });
}

export const PesoMunicipio = forwardRef<HTMLElement>(function PesoMunicipio(_, ref) {
  const cube = useCube();
  const muni = useMuni();
  const { estado, edad } = useSelection();
  const [elegido, setElegido] = useState<{ estado: number; mi: number } | null>(null);
  const banda = edad != null ? bandOf(edad) : null;
  const [rvRef, visible] = useReveal();
  const reduce = usePrefersReducedMotion();
  // Las barras crecen al aparecer; después solo se ajustan rápido
  const [crecidas, setCrecidas] = useState(false);

  const opciones = useMemo(
    () =>
      muni && estado != null
        ? (listMunicipiosByEnt(muni)[estado] ?? []).map((o) => ({ value: o.i, label: o.n }))
        : [],
    [muni, estado],
  );

  // Por defecto, el municipio con más personas en la lista nominal del estado
  const masGrande = useMemo(() => {
    if (!muni || estado == null) return null;
    const tot = new Map<number, number>();
    for (let r = 0; r < muni.i.length; r++) {
      if (muni.y[r] !== YEAR_IDX || muni.mp[muni.i[r]][0] !== estado) continue;
      tot.set(muni.i[r], (tot.get(muni.i[r]) ?? 0) + muni.ln[r]);
    }
    let best: number | null = null;
    let max = -1;
    tot.forEach((v, k) => {
      if (v > max) {
        max = v;
        best = k;
      }
    });
    return best;
  }, [muni, estado]);

  const mi = elegido && elegido.estado === estado ? elegido.mi : masGrande;

  // Sin estado no hay municipio: se usan los grupos de edad de todo el país
  const view = useMemo(() => {
    let bands: Totals[];
    let nombre: string | null;
    if (estado == null) {
      if (!cube) return null;
      bands = BANDN.map((_, b) => nationalBandTotals(cube, b, YEAR_IDX));
      nombre = null;
    } else {
      if (!muni || mi == null) return null;
      bands = municipioBands(muni, mi, YEAR_IDX);
      nombre = muni.mp[mi][2];
    }
    const total = suma(bands);
    const mine = banda != null ? bands[banda] : null;
    return {
      nombre,
      data: BANDN.map((n, i) => ({
        nombre: n,
        tasa: rate(bands[i]),
        ln: bands[i].ln,
        esTuyo: i === banda,
      })),
      total,
      tasaTotal: rate(total),
      mine,
      tasa: rate(mine),
      partLista: mine && total.ln > 0 ? (mine.ln / total.ln) * 100 : null,
      partVotos: mine && total.sv > 0 ? (mine.sv / total.sv) * 100 : null,
    };
  }, [cube, muni, estado, mi, banda]);

  const lugarEstado = nombreEstado(estado);
  const deLugar = view?.nombre ? `de ${view.nombre}` : "del país";
  const grupo = banda === 4 ? "60 años o más" : banda != null ? `${BANDN[banda]} años` : "";
  const aportaMenos =
    view?.partLista != null && view.partVotos != null && view.partVotos < view.partLista - 0.5;
  const cifra = banda != null ? view?.partLista : view?.tasaTotal;

  return (
    <section ref={ref} className="flex min-h-svh flex-col justify-center px-6 py-24 sm:px-10">
      <div ref={rvRef} data-visible={visible} className="contenido">
        <p className="hud rv">
          Participación por grupo de edad ·{" "}
          {view?.nombre ? `${view.nombre} · ${lugarEstado}` : "Todo el país"} · 2024
        </p>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <div className="rv max-w-md" style={delay(80)}>
              {estado != null ? (
                <CampoSelect
                  etiqueta="Tu municipio"
                  value={mi}
                  onChange={(v) => v != null && setElegido({ estado, mi: v })}
                  opciones={opciones}
                  className="rounded-md bg-surface-2/70 px-4 py-3"
                />
              ) : (
                <NotaPromedio campo="campo-estado" className="py-3">
                  Elige tu estado para ver tu municipio
                </NotaPromedio>
              )}
            </div>

            {view && (
              <>
                <p
                  className={clsx(
                    "rv display num mt-8 text-[22vw] font-black sm:text-[14vw] lg:text-[9rem]",
                    banda != null ? "text-magenta" : "text-ink",
                  )}
                  style={delay(160)}
                >
                  <Cifra
                    value={cifra != null ? Math.round(cifra) : null}
                    visible={visible}
                    suffix="%"
                  />
                </p>

                {banda != null ? (
                  <>
                    <p
                      className="rv mt-4 max-w-md text-xl text-ink-2 sm:text-2xl"
                      style={delay(240)}
                    >
                      de la lista nominal <span className="text-ink">{deLugar}</span> tiene{" "}
                      <span className="num whitespace-nowrap text-ink">{grupo}</span>
                      {aportaMenos ? ", pero aportó solo el " : " y aportó el "}
                      <span className="num text-magenta">
                        {view.partVotos != null ? Math.round(view.partVotos) : "—"}%
                      </span>{" "}
                      de los votos.
                    </p>
                    <p className="rv mt-6 max-w-md text-ink-2" style={delay(320)}>
                      Votó el <span className="num text-ink">{fp(view.tasa, 0)}</span> de tu grupo;{" "}
                      <span className="num text-ink">{fn(view.mine?.nv)}</span> personas no lo
                      hicieron.
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="rv mt-4 max-w-md text-xl text-ink-2 sm:text-2xl"
                      style={delay(240)}
                    >
                      de la lista nominal <span className="text-ink">{deLugar}</span> votó en la
                      elección de 2024.
                    </p>
                    <p className="rv mt-6 max-w-md text-ink-2" style={delay(320)}>
                      <span className="num text-ink">{fn(view.total.nv)}</span> personas inscritas
                      no lo hicieron.
                    </p>
                    <div className="rv" style={delay(360)}>
                      <NotaPromedio campo="campo-edad">
                        Todas las edades · Escribe la tuya para ver tu grupo
                      </NotaPromedio>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="rv h-[320px] sm:h-[420px]" style={delay(200)}>
            {view && visible && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={view.data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis
                    dataKey="nombre"
                    tick={TICK}
                    axisLine={{ stroke: "var(--line-strong)" }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tickFormatter={(v) => `${v}%`}
                    tick={TICK}
                    axisLine={false}
                    tickLine={false}
                    width={44}
                  />
                  <Tooltip
                    content={Tip}
                    cursor={{ fill: "var(--line)" }}
                    isAnimationActive={false}
                  />
                  <Bar
                    dataKey="tasa"
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={!reduce}
                    animationDuration={crecidas ? 300 : 700}
                    animationEasing={EASE_OUT}
                    onAnimationEnd={() => setCrecidas(true)}
                  >
                    {view.data.map((d) => (
                      <Cell
                        key={d.nombre}
                        fill={d.esTuyo ? "var(--magenta)" : "var(--violet)"}
                        fillOpacity={d.esTuyo ? 1 : banda == null ? 0.75 : 0.6}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </section>
  );
});
