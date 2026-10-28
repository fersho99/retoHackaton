"use client";

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
import { BANDN, bandOf, fn, fp, listMunicipiosByEnt, municipioBands, rate } from "@/lib/data";
import { nombreEstado } from "@/lib/estados";
import { useSelection } from "@/lib/selection";
import { useMuni } from "@/lib/use-data";
import { EASE_OUT } from "@/lib/motion";
import { useReveal } from "@/lib/use-reveal";
import { Cifra } from "@/components/ui/cifra";
import { usePrefersReducedMotion } from "@number-flow/react";

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

export const PesoMunicipio = forwardRef<HTMLElement>(function PesoMunicipio(_, ref) {
  const muni = useMuni();
  const { estado, edad } = useSelection();
  const [elegido, setElegido] = useState<{ estado: number; mi: number } | null>(null);
  const banda = bandOf(edad);
  const [rvRef, visible] = useReveal();
  const reduce = usePrefersReducedMotion();
  // Las barras crecen al aparecer; al cambiar de municipio solo se ajustan rápido
  const [crecidas, setCrecidas] = useState(false);

  const opciones = useMemo(
    () => (muni && estado != null ? (listMunicipiosByEnt(muni)[estado] ?? []) : []),
    [muni, estado],
  );

  // Por defecto, el municipio con más personas en la lista nominal del estado
  const masGrande = useMemo(() => {
    if (!muni || estado == null) return null;
    const suma = new Map<number, number>();
    for (let r = 0; r < muni.i.length; r++) {
      if (muni.y[r] !== YEAR_IDX || muni.mp[muni.i[r]][0] !== estado) continue;
      suma.set(muni.i[r], (suma.get(muni.i[r]) ?? 0) + muni.ln[r]);
    }
    let best: number | null = null;
    let max = -1;
    suma.forEach((v, k) => {
      if (v > max) {
        max = v;
        best = k;
      }
    });
    return best;
  }, [muni, estado]);

  const mi = elegido && elegido.estado === estado ? elegido.mi : masGrande;

  const view = useMemo(() => {
    if (!muni || mi == null) return null;
    const bands = municipioBands(muni, mi, YEAR_IDX);
    const lnTotal = bands.reduce((s, b) => s + b.ln, 0);
    const svTotal = bands.reduce((s, b) => s + b.sv, 0);
    const mine = bands[banda];
    return {
      nombre: muni.mp[mi][2],
      data: BANDN.map((n, i) => ({
        nombre: n,
        tasa: rate(bands[i]),
        ln: bands[i].ln,
        esTuyo: i === banda,
      })),
      tasa: rate(mine),
      partLista: lnTotal > 0 ? (mine.ln / lnTotal) * 100 : null,
      partVotos: svTotal > 0 ? (mine.sv / svTotal) * 100 : null,
      noVotaron: mine.nv,
    };
  }, [muni, mi, banda]);

  const lugar = nombreEstado(estado);
  const grupo = banda === 4 ? "60 años o más" : `${BANDN[banda]} años`;
  const aportaMenos =
    view?.partLista != null && view.partVotos != null && view.partVotos < view.partLista - 0.5;

  return (
    <section ref={ref} className="flex min-h-svh flex-col justify-center px-6 py-24 sm:px-10">
      <div ref={rvRef} data-visible={visible}>
        <p className="hud rv">
          Participación por grupo de edad · {view?.nombre ?? "Tu municipio"}
          {lugar ? ` · ${lugar}` : ""} · 2024
        </p>

        {estado == null ? (
          <p className="rv mt-8 max-w-xl text-2xl text-ink-2" style={delay(80)}>
            Elige tu estado al inicio para ver cómo votó tu grupo de edad en tu municipio.
          </p>
        ) : (
          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <label
                className="rv flex max-w-md flex-col gap-1 rounded-md bg-surface-2/70 px-4 py-3"
                style={delay(80)}
              >
                <span className="hud">Tu municipio</span>
                <select
                  value={mi ?? ""}
                  onChange={(e) => setElegido({ estado, mi: Number(e.target.value) })}
                  className="appearance-none bg-transparent text-lg text-ink outline-none"
                >
                  {opciones.map((o) => (
                    <option key={o.i} value={o.i} className="bg-surface">
                      {o.n}
                    </option>
                  ))}
                </select>
              </label>

              {view && (
                <>
                  <p
                    className="rv display num mt-8 text-[22vw] font-black text-magenta sm:text-[14vw] lg:text-[9rem]"
                    style={delay(160)}
                  >
                    <Cifra
                      value={view.partLista != null ? Math.round(view.partLista) : null}
                      visible={visible}
                      suffix="%"
                    />
                  </p>
                  <p className="rv mt-4 max-w-md text-xl text-ink-2 sm:text-2xl" style={delay(240)}>
                    de la lista nominal de <span className="text-ink">{view.nombre}</span> tiene{" "}
                    <span className="num whitespace-nowrap text-ink">{grupo}</span>
                    {aportaMenos ? ", pero aportó solo el " : " y aportó el "}
                    <span className="num text-magenta">
                      {view.partVotos != null ? Math.round(view.partVotos) : "—"}%
                    </span>{" "}
                    de los votos.
                  </p>
                  <p className="rv mt-6 max-w-md text-ink-2" style={delay(320)}>
                    Votó el <span className="num text-ink">{fp(view.tasa, 0)}</span> de tu grupo;{" "}
                    <span className="num text-ink">{fn(view.noVotaron)}</span> personas no lo
                    hicieron.
                  </p>
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
                          fillOpacity={d.esTuyo ? 1 : 0.6}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
});
