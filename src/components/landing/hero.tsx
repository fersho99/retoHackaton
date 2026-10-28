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
    <section className="grain relative flex min-h-svh flex-col overflow-clip">
      <Image
        src="/img/hero-multitud.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="foto-portada pointer-events-none object-cover object-[72%_center]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-bg/55 sm:bg-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-linear-to-b from-bg/80 to-transparent"
      />

      <header className="relative px-6 pt-6 sm:px-10">
        <p className="hud a-fade text-ink-2!" style={delay(500)}>
          Elección federal del 2 de junio de 2024
        </p>
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

      <div className="relative px-6 pb-6 sm:px-10 sm:pb-10">
        <div
          className="a-fade-up panel grid grid-cols-[minmax(0,1fr)] gap-1 rounded-[1.25rem] p-2 sm:grid-cols-[minmax(0,1fr)_15rem] lg:max-w-5xl lg:grid-cols-[minmax(0,1fr)_15rem_17rem]"
          style={delay(650)}
        >
          <CampoSelect
            id="campo-estado"
            etiqueta="Tu estado"
            value={estado}
            onChange={setEstado}
            vacio="Todo el país"
            opciones={OPCIONES_ESTADO}
            className="rounded-xl px-5 py-3"
          />
          <CampoEdad
            id="campo-edad"
            value={edad}
            onChange={setEdad}
            className="rounded-xl px-5 py-3"
          />
          <button
            onClick={onStart}
            className="pressable mt-1 flex min-h-14 items-center justify-center gap-3 rounded-full bg-violet px-8 font-semibold whitespace-nowrap text-bg sm:col-span-2 lg:col-span-1 lg:mt-0"
          >
            {personalizado ? "Ver mi impacto" : "Ver el promedio nacional"}{" "}
            <span aria-hidden>↓</span>
          </button>
        </div>
      </div>
    </section>
  );
}
