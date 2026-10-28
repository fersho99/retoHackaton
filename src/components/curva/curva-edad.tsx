"use client";

import Image from "next/image";
import { forwardRef, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { ageCurve, fn, fp, totalsForAge, totalsForScope, rate } from "@/lib/data";
import { nombreEstado } from "@/lib/estados";
import { useSelection } from "@/lib/selection";
import { useCube } from "@/lib/use-data";

const YEAR_IDX = 5; // 2024
const TICK = { fill: "var(--ink-3)", fontSize: 11, fontFamily: "var(--font-mono)" };

function Tip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const estado = payload.find((p) => p.dataKey === "rate")?.value;
  const nacional = payload.find((p) => p.dataKey === "nacional")?.value;
  return (
    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs shadow-lg shadow-black/50">
      <p className="hud mb-1">{label === 90 ? "90 o más" : `${label} años`}</p>
      <p className="num text-ink">Estado · {fp(estado as number)}</p>
      <p className="num text-reference">Nacional · {fp(nacional as number)}</p>
    </div>
  );
}

export const CurvaEdad = forwardRef<HTMLElement>(function CurvaEdad(_, ref) {
  const cube = useCube();
  const { estado, edad } = useSelection();
  const lugar = nombreEstado(estado) ?? "México";

  const view = useMemo(() => {
    if (!cube) return null;
    const local = ageCurve(cube, estado, YEAR_IDX);
    const nacional = ageCurve(cube, null, YEAR_IDX);
    const data = local.map((p, i) => ({
      age: p.age,
      rate: p.rate,
      nacional: nacional[i].rate,
    }));
    const user = local.find((p) => p.age === edad);
    // Ignora edades con muy pocas personas: un grupo diminuto distorsiona el máximo
    const robustos = local.filter((p) => p.rate != null && p.ln >= 500);
    const peak = robustos.reduce((a, b) => ((b.rate ?? 0) > (a.rate ?? 0) ? b : a));
    const scope = totalsForScope(cube, estado, YEAR_IDX);
    const edadTot = totalsForAge(cube, estado, YEAR_IDX, edad);
    return { data, user, peak, scopeRate: rate(scope), edadTot };
  }, [cube, estado, edad]);

  const userRate = view?.user?.rate ?? null;

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden px-6 pb-24 pt-[42svh] sm:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[46svh] opacity-80"
        style={{
          maskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 45%, transparent 100%)",
        }}
      >
        <Image src="/img/valle.jpg" alt="" fill sizes="100vw" className="object-cover object-center" />
      </div>
      <p className="hud relative">
        Participación por edad · {lugar} · 2024
      </p>

      <div className="relative mt-8 grid items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          <p className="display num text-[22vw] font-black text-magenta sm:text-[14vw] lg:text-[9rem]">
            {userRate != null ? `${Math.round(userRate)}%` : "—"}
          </p>
          <p className="mt-4 max-w-md text-xl text-ink-2 sm:text-2xl">
            de las personas de <span className="num text-ink">{edad}</span> años en{" "}
            <span className="text-ink">{lugar}</span> votó en la elección de 2024.
          </p>

          {view && (
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4">
              <div>
                <dt className="hud">Tu edad</dt>
                <dd className="num mt-1 text-lg text-magenta">{fp(userRate, 0)}</dd>
              </div>
              <div>
                <dt className="hud">Todas las edades</dt>
                <dd className="num mt-1 text-lg text-ink">{fp(view.scopeRate, 0)}</dd>
              </div>
              <div>
                <dt className="hud">Máximo · {view.peak.age} años</dt>
                <dd className="num mt-1 text-lg text-violet-soft">{fp(view.peak.rate, 0)}</dd>
              </div>
            </dl>
          )}

          {view && view.edadTot.ln > 0 && view.edadTot.ln < 1500 && (
            <p className="mt-3 max-w-md text-sm text-ink-3">
              A esta edad hay pocas personas en la lista nominal ({fn(view.edadTot.ln)}), así que la
              cifra puede cambiar bastante de una elección a otra.
            </p>
          )}
        </div>

        <div>
          <div className="h-[340px] sm:h-[440px]">
            {view && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={view.data} margin={{ top: 12, right: 8, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="relleno-curva" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--violet)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="var(--violet)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--line)" vertical={false} />
                  <XAxis
                    dataKey="age"
                    type="number"
                    domain={[18, 90]}
                    ticks={[18, 25, 30, 40, 50, 60, 70, 80, 90]}
                    tickFormatter={(a) => (a === 90 ? "90+" : String(a))}
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
                  <Tooltip content={Tip} cursor={{ stroke: "var(--line-strong)" }} />
                  <Line
                    dataKey="nacional"
                    stroke="var(--reference)"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                  <Area
                    dataKey="rate"
                    type="monotone"
                    stroke="var(--violet)"
                    strokeWidth={2.5}
                    fill="url(#relleno-curva)"
                    isAnimationActive={false}
                    connectNulls
                  />
                  <ReferenceLine
                    x={edad}
                    stroke="var(--magenta)"
                    strokeOpacity={0.45}
                    strokeDasharray="2 4"
                  />
                  {userRate != null && (
                    <ReferenceDot
                      x={edad}
                      y={userRate}
                      r={6}
                      fill="var(--magenta)"
                      stroke="var(--bg)"
                      strokeWidth={2}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="hud mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <i className="inline-block h-0.5 w-5 bg-violet" /> {lugar}
            </span>
            <span className="flex items-center gap-2">
              <i className="inline-block w-5 border-t border-dashed border-reference" /> Promedio nacional
            </span>
            <span className="flex items-center gap-2">
              <i className="inline-block size-2 rounded-full bg-magenta" /> Tú
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});
