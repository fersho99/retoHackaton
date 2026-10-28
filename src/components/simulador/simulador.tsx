"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Cifra } from "@/components/ui/cifra";
import { nombreEstado } from "@/lib/estados";
import { enLugar, useSelection } from "@/lib/selection";
import { modelo, simular, type Modelo } from "@/lib/simulacion";
import { useCube } from "@/lib/use-data";
import { useReveal } from "@/lib/use-reveal";

const YEAR_IDX = 5; // 2024
const IMAN = 1.5; // puntos de distancia a los que el slider se pega a un ancla
const PULGAR = 28; // px, debe coincidir con .rango en globals.css
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Simulador() {
  const cube = useCube();
  const { estado, edad } = useSelection();
  const m = useMemo(
    () => (cube ? modelo(cube, estado, YEAR_IDX, edad) : null),
    [cube, estado, edad],
  );
  const [rvRef, visible] = useReveal();
  const lugar = enLugar(nombreEstado(estado));

  return (
    <section className="flex min-h-svh flex-col justify-center px-6 py-24 sm:px-10">
      <div ref={rvRef} data-visible={visible} className="contenido">
        <p className="hud rv">
          Simulación · {m?.grupo.etiqueta ?? "—"} · {nombreEstado(estado) ?? "Todo el país"} ·
          Elección 2024
        </p>
        <h2
          className="rv display mt-6 max-w-3xl text-[11vw] font-black uppercase sm:text-[7vw] lg:text-[5.5rem]"
          style={delay(80)}
        >
          {edad != null ? "¿Y si tu generación votara?" : "¿Y si los jóvenes votaran?"}
        </h2>
        {/* La clave reinicia el slider cuando cambia el grupo o el lugar */}
        {m && <Panel key={`${estado}-${edad}`} m={m} lugar={lugar} visible={visible} />}
      </div>
    </section>
  );
}

function Panel({ m, lugar, visible }: { m: Modelo; lugar: string; visible: boolean }) {
  // Arranca en la primera ancla por encima de hoy: "+0 votos" no cuenta nada
  const [p, setP] = useState(m.anclas[1]?.valor ?? m.hoy);
  const [arrastrando, setArrastrando] = useState(false);
  const pegado = useRef<number | null>(null);
  const [primera, setPrimera] = useState(true);

  // El encendido escalonado de las 100 personas ocurre solo la primera vez
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => setPrimera(false), 1400);
    return () => clearTimeout(t);
  }, [visible]);

  const min = Math.floor(m.hoy);
  const s = simular(m, p);
  const frac = (v: number) => (v - min) / (100 - min);
  const posicion = (v: number) => `calc(${frac(v) * 100}% + ${(0.5 - frac(v)) * PULGAR}px)`;

  const alMover = (v: number) => {
    if (arrastrando) {
      const ancla = m.anclas.find((a) => Math.abs(a.valor - v) <= IMAN);
      if (ancla) {
        if (pegado.current !== ancla.valor) {
          pegado.current = ancla.valor;
          navigator.vibrate?.(8);
        }
        setP(ancla.valor);
        return;
      }
      pegado.current = null;
    }
    setP(v);
  };

  const encendidasHoy = Math.round(m.hoy);
  const encendidas = Math.round(s.p);

  return (
    <div className="mt-10 grid grid-cols-[minmax(0,1fr)] items-center gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
      <div>
        <div className="rv" style={delay(160)}>
          <div className="relative">
            <input
              type="range"
              min={min}
              max={100}
              step={1}
              value={Math.round(s.p)}
              aria-label={`Participación de las personas de ${m.grupo.etiqueta}`}
              aria-valuetext={`${Math.round(s.p)} por ciento`}
              onPointerDown={() => setArrastrando(true)}
              onPointerUp={() => {
                setArrastrando(false);
                pegado.current = null;
              }}
              onPointerCancel={() => setArrastrando(false)}
              onBlur={() => setArrastrando(false)}
              onChange={(e) => alMover(Number(e.target.value))}
              className="rango"
              style={
                {
                  "--hoy": `${frac(m.hoy) * 100}%`,
                  "--fill": `${frac(s.p) * 100}%`,
                } as CSSProperties
              }
            />
            {m.anclas.map((a) => (
              <span
                key={a.etiqueta}
                aria-hidden
                className="pointer-events-none absolute top-[calc(50%+14px)] size-1 -translate-x-1/2 rounded-full bg-ink-3"
                style={{ left: posicion(a.valor) }}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {m.anclas.map((a) => {
              const activa = Math.abs(a.valor - s.p) < 0.5;
              return (
                <button
                  key={a.etiqueta}
                  type="button"
                  onClick={() => setP(a.valor)}
                  aria-pressed={activa}
                  className={clsx(
                    "pressable ancla rounded-full px-4 py-2 text-sm",
                    activa ? "bg-magenta text-bg" : "bg-white/6 text-ink-2",
                  )}
                >
                  {a.etiqueta} · <span className="num">{Math.round(a.valor)}%</span>
                </button>
              );
            })}
          </div>
        </div>

        <p
          className="rv display num mt-12 text-[18vw] font-black text-magenta sm:text-[11vw] lg:text-[7.5rem]"
          style={delay(240)}
        >
          <Cifra value={s.extra} visible={visible} animated={!arrastrando} prefix="+" />
        </p>
        <p className="rv mt-4 max-w-xl text-xl text-ink-2 sm:text-2xl" style={delay(300)}>
          votos más si las personas de{" "}
          <span className="whitespace-nowrap text-ink">{m.grupo.etiqueta}</span> {lugar} votaran al{" "}
          <span className="num text-ink">{Math.round(s.p)}%</span>.
        </p>
        <p className="rv mt-6 max-w-xl text-ink-2" style={delay(360)}>
          Su peso pasaría del <span className="num text-ink">{Math.round(s.pesoHoy)}%</span> al{" "}
          <span className="num text-magenta">{Math.round(s.pesoNuevo)}%</span> de todos los votos.
        </p>
      </div>

      <figure className="rv w-full max-w-[30rem] lg:justify-self-center" style={delay(200)}>
        <div
          className="grid grid-cols-10 gap-2 sm:gap-3"
          data-primera={primera && visible ? "" : undefined}
          role="img"
          aria-label={`De cada 100 personas, ${encendidasHoy} votaron en 2024 y ${encendidas} votarían en la simulación`}
        >
          {Array.from({ length: 100 }, (_, i) => (
            <span
              key={i}
              className={clsx(
                "persona aspect-square rounded-full",
                !visible
                  ? "is-no"
                  : i < encendidasHoy
                    ? "is-voto"
                    : i < encendidas
                      ? "is-nuevo"
                      : "is-no",
              )}
              style={{ "--i": i } as CSSProperties}
            />
          ))}
        </div>
        <figcaption className="hud mt-6 flex flex-wrap gap-x-6 gap-y-2">
          <span className="flex items-center gap-2">
            <i className="persona is-voto inline-block size-2.5 rounded-full" /> Votó en 2024
          </span>
          <span className="flex items-center gap-2">
            <i className="persona is-nuevo inline-block size-2.5 rounded-full" /> Votaría
          </span>
          <span className="flex items-center gap-2">
            <i className="persona is-no inline-block size-2.5 rounded-full" /> No votaría
          </span>
        </figcaption>
        <p className="mt-2 text-sm text-ink-3">
          De cada 100 personas de {m.grupo.etiqueta} {lugar}.
        </p>
      </figure>
    </div>
  );
}
