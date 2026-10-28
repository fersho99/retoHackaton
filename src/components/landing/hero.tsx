"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { CampoEdad, CampoSelect } from "@/components/ui/campo";
import { ESTADOS } from "@/lib/estados";
import { useSelection } from "@/lib/selection";

const LINES = ["No elegir,", "también es", "una elección."];
const OPCIONES_ESTADO = ESTADOS.map(([value, label]) => ({ value, label }));

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Hero({ onStart }: { onStart: () => void }) {
  const { estado, edad, setEstado, setEdad } = useSelection();
  const personalizado = estado != null || edad != null;

  return (
    <section className="grain relative flex min-h-svh flex-col overflow-hidden">
      <Image
        src="/img/hero-multitud.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="a-fade pointer-events-none object-cover object-[72%_center]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-bg/55 sm:bg-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg/80 to-transparent"
      />

      <header className="relative flex items-center justify-between gap-4 px-6 pt-6 sm:px-10">
        <span className="hud a-fade whitespace-nowrap" style={delay(500)}>
          Datos INE · 2009—2024
        </span>
        <span className="hud a-fade num whitespace-nowrap" style={delay(600)}>
          <span className="hidden sm:inline">Elección federal · </span>02.06.2024
        </span>
      </header>

      <div className="relative flex flex-1 flex-col justify-center px-6 sm:px-10">
        <h1 className="display text-[15vw] font-black uppercase sm:text-[11vw] lg:text-[9.5vw]">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <span className="a-rise block" style={delay(i * 90)}>
                {line}
              </span>
            </span>
          ))}
        </h1>
        <p className="a-fade-up mt-6 max-w-md text-lg text-ink-2 sm:text-xl" style={delay(450)}>
          Descubre cuánto pesa tu voto, con los datos oficiales de participación ciudadana.
        </p>
      </div>

      <div
        className="a-fade-up relative grid grid-cols-1 bg-surface/70 sm:grid-cols-[1fr_15rem_19rem]"
        style={delay(650)}
      >
        <CampoSelect
          id="campo-estado"
          etiqueta="Tu estado"
          value={estado}
          onChange={setEstado}
          vacio="Todo el país"
          opciones={OPCIONES_ESTADO}
          className="px-6 py-4 sm:px-10"
        />
        <CampoEdad id="campo-edad" value={edad} onChange={setEdad} className="px-6 py-4" />
        <button
          onClick={onStart}
          className="pressable flex items-center justify-center gap-3 bg-violet px-10 py-5 font-semibold whitespace-nowrap text-bg"
        >
          {personalizado ? "Ver mi impacto" : "Ver el promedio nacional"} <span aria-hidden>↓</span>
        </button>
      </div>
    </section>
  );
}
