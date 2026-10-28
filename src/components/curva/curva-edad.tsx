"use client";

import { Foto } from "@/components/ui/foto";
import { forwardRef, useMemo, useState, type CSSProperties } from "react";
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
import { enLugar, useSelection } from "@/lib/selection";
import { NotaPromedio } from "@/components/ui/campo";
import clsx from "clsx";
import { useCube } from "@/lib/use-data";
import { EASE_IN_OUT, EASE_OUT } from "@/lib/motion";
import { useReveal } from "@/lib/use-reveal";
import { Cifra } from "@/components/ui/cifra";
import { usePrefersReducedMotion } from "@number-flow/react";

const YEAR_IDX = 5; // 2024
const TICK = { fill: "var(--ink-3)", fontSize: 12, fontFamily: "var(--font-archivo)" };
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
// Se desvanece arriba (donde termina la portada) y abajo (donde empieza la gráfica)
const VALLE_MASCARA = "linear-gradient(to bottom, transparent, black 14%, black 45%, transparent)";

function PuntoTu({ cx, cy }: { cx?: number; cy?: number }) {
  if (cx == null || cy == null) return <g />;
  return (
    <circle
      className="dot-in"
      cx={cx}
      cy={cy}
      r={6}
      fill="var(--magenta)"
      stroke="var(--bg)"
      strokeWidth={2}
    />
  );
}

function Tip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;
  const estado = payload.find((p) => p.dataKey === "rate")?.value;
  const nacional = payload.find((p) => p.dataKey === "nacional")?.value;
  return (
    <div className="rounded-md bg-surface-2 px-3 py-2 text-xs shadow-lg shadow-black/50">
      <p className="hud mb-1">{label === 90 ? "90 o más" : `${label} años`}</p>
      {nacional === undefined ? (
        <p className="num text-ink">Votó · {fp(estado as number)}</p>
      ) : (
        <>
          <p className="num text-ink">Estado · {fp(estado as number)}</p>
          <p className="num text-reference">Nacional · {fp(nacional as number)}</p>
        </>
      )}
    </div>
  );
}

export const CurvaEdad = forwardRef<HTMLElement>(function CurvaEdad(_, ref) {
  const cube = useCube();
  const { estado, edad } = useSelection();
  const nombre = nombreEstado(estado);
  const lugar = nombre ?? "Todo el país";
  const conEdad = edad != null;
  const [rvRef, visible] = useReveal();
  const reduce = usePrefersReducedMotion();
  // La curva se dibuja una vez; después solo se transforma rápido si cambian los datos
  const [drawn, setDrawn] = useState(false);
  const animar = !reduce;
  const duracion = drawn ? 350 : 1000;

  const view = useMemo(() => {
    if (!cube) return null;
    const local = ageCurve(cube, estado, YEAR_IDX);
    const nacional = ageCurve(cube, null, YEAR_IDX);
    const data = local.map((p, i) => ({
      age: p.age,
      rate: p.rate,
      nacional: nacional[i].rate,
    }));
    const user = edad != null ? local.find((p) => p.age === edad) : undefined;
    // Ignora edades con muy pocas personas: un grupo diminuto distorsiona el máximo
    const robustos = local.filter((p) => p.rate != null && p.ln >= 500);
    const peak = robustos.reduce((a, b) => ((b.rate ?? 0) > (a.rate ?? 0) ? b : a));
    const scope = totalsForScope(cube, estado, YEAR_IDX);
    const edadTot = edad != null ? totalsForAge(cube, estado, YEAR_IDX, edad) : null;
    // Jóvenes: 18–29 años sumando personas, no promediando tasas
    const jovenes = { ln: 0, sv: 0, nv: 0 };
    for (let a = 18; a <= 29; a++) {
      const t = totalsForAge(cube, estado, YEAR_IDX, a);
      jovenes.ln += t.ln;
      jovenes.sv += t.sv;
      jovenes.nv += t.nv;
    }
    return { data, user, peak, jovenesRate: rate(jovenes), scopeRate: rate(scope), edadTot };
  }, [cube, estado, edad]);

  const userRate = view?.user?.rate ?? null;
  const cifra = conEdad ? userRate : (view?.scopeRate ?? null);

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col justify-center overflow-clip px-6 pb-24 pt-[42svh] sm:px-10"
    >
      <Foto
        src="/img/valle.jpg"
        sizes="100vw"
        className="inset-x-0 top-0 h-[46svh] opacity-80"
        style={{ maskImage: VALLE_MASCARA, WebkitMaskImage: VALLE_MASCARA }}
        imgClassName="object-center"
      />
      <div ref={rvRef} data-visible={visible} className="contenido relative">
        <p className="hud rv">Participación por edad {enLugar(nombre)}, elección de 2024</p>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)] items-center gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <p
              className={clsx(
                "rv display num text-[22vw] font-black sm:text-[14vw] lg:text-[9rem]",
                conEdad ? "text-magenta" : "text-ink",
              )}
              style={delay(80)}
            >
              <Cifra
                value={cifra != null ? Math.round(cifra) : null}
                visible={visible}
                suffix="%"
              />
            </p>
            <p className="rv mt-4 max-w-md text-xl text-ink-2 sm:text-2xl" style={delay(160)}>
              {conEdad ? (
                <>
                  de las personas de <span className="num text-ink">{edad}</span> años{" "}
                </>
              ) : (
                "de las personas inscritas "
              )}
              <span className="text-ink">{enLugar(nombre)}</span> votó en la elección de 2024.
            </p>

            {view && (
              <dl className="rv mt-10 grid max-w-md grid-cols-3 gap-4" style={delay(240)}>
                {conEdad ? (
                  <div>
                    <dt className="hud">Tu edad</dt>
                    <dd className="num mt-1 text-lg text-magenta">{fp(userRate, 0)}</dd>
                  </div>
                ) : (
                  <div>
                    <dt className="hud">18–29 años</dt>
                    <dd className="num mt-1 text-lg text-ink">{fp(view.jovenesRate, 0)}</dd>
                  </div>
                )}
                <div>
                  <dt className="hud">Todas las edades</dt>
                  <dd className="num mt-1 text-lg text-ink">{fp(view.scopeRate, 0)}</dd>
                </div>
                <div>
                  <dt className="hud">Máximo, a los {view.peak.age} años</dt>
                  <dd className="num mt-1 text-lg text-violet-soft">{fp(view.peak.rate, 0)}</dd>
                </div>
              </dl>
            )}

            {!conEdad && (
              <div className="rv" style={delay(300)}>
                <NotaPromedio campo="campo-edad">¿Y a tu edad? Escríbela arriba</NotaPromedio>
              </div>
            )}

            {view?.edadTot && view.edadTot.ln > 0 && view.edadTot.ln < 1500 && (
              <p className="rv mt-3 max-w-md text-sm text-ink-3" style={delay(300)}>
                A esta edad hay pocas personas en la lista nominal ({fn(view.edadTot.ln)}), así que
                la cifra puede cambiar bastante de una elección a otra.
              </p>
            )}
          </div>

          <div className="rv" style={delay(200)}>
            <div className="h-[340px] sm:h-[440px]">
              {view && visible && (
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={view.data}
                    margin={{ top: 12, right: 8, left: -12, bottom: 0 }}
                  >
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
                    <Tooltip
                      content={Tip}
                      cursor={{ stroke: "var(--line-strong)" }}
                      isAnimationActive={false}
                    />
                    {estado != null && (
                      <Line
                        dataKey="nacional"
                        stroke="var(--reference)"
                        strokeWidth={1.5}
                        strokeDasharray="4 4"
                        dot={false}
                        activeDot={false}
                        isAnimationActive={animar}
                        animationDuration={duracion}
                        animationEasing={drawn ? EASE_OUT : EASE_IN_OUT}
                        connectNulls
                      />
                    )}
                    <Area
                      dataKey="rate"
                      type="monotone"
                      stroke="var(--violet)"
                      strokeWidth={2.5}
                      fill="url(#relleno-curva)"
                      isAnimationActive={animar}
                      animationDuration={duracion}
                      animationEasing={drawn ? EASE_OUT : EASE_IN_OUT}
                      onAnimationEnd={() => setDrawn(true)}
                      connectNulls
                    />
                    {conEdad && (
                      <ReferenceLine
                        x={edad}
                        stroke="var(--magenta)"
                        strokeOpacity={0.45}
                        strokeDasharray="2 4"
                      />
                    )}
                    {conEdad && userRate != null && (drawn || !animar) && (
                      <ReferenceDot x={edad} y={userRate} r={6} shape={PuntoTu} />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            <div className="hud mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-2">
                <i className="inline-block h-0.5 w-5 bg-violet" /> {lugar}
              </span>
              {estado != null && (
                <span className="flex items-center gap-2">
                  <i className="inline-block w-5 border-t border-dashed border-reference" />{" "}
                  Promedio nacional
                </span>
              )}
              {conEdad && (
                <span className="flex items-center gap-2">
                  <i className="inline-block size-2 rounded-full bg-magenta" /> Tú
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});
