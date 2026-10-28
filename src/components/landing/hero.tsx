"use client";

import type { CSSProperties } from "react";
import { ESTADOS } from "@/lib/estados";
import type { useLandingForm } from "./use-landing-form";

const LINES = ["No elegir,", "también es", "una elección."];

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

type Props = {
  form: ReturnType<typeof useLandingForm>;
  onStart: () => void;
};

export function Hero({ form: f, onStart }: Props) {
  return (
    <section className="relative flex min-h-svh flex-col overflow-hidden">
      <div
        aria-hidden
        className="a-fade pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 85% 10%, rgb(155 109 255 / 0.22), transparent 70%), radial-gradient(40% 40% at 0% 100%, rgb(255 79 154 / 0.10), transparent 70%)",
        }}
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
        className="a-fade-up relative grid grid-cols-1 border-t border-line sm:grid-cols-[1fr_10rem_auto]"
        style={delay(650)}
      >
        <label className="flex flex-col gap-1 px-6 py-4 sm:px-10">
          <span className="hud">Tu estado</span>
          <select
            value={f.estado ?? ""}
            onChange={(e) => f.setEstado(Number(e.target.value))}
            className="appearance-none bg-transparent text-lg text-ink outline-none"
          >
            <option value="" disabled className="bg-surface">
              Elige tu estado
            </option>
            {ESTADOS.map(([c, n]) => (
              <option key={c} value={c} className="bg-surface">
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 border-t border-line px-6 py-4 sm:border-l sm:border-t-0">
          <span className="hud">Tu edad</span>
          <input
            inputMode="numeric"
            value={f.edadTxt}
            onChange={(e) => f.setEdadTxt(e.target.value.replace(/\D/g, "").slice(0, 2))}
            onBlur={f.commitEdad}
            className="num bg-transparent text-lg text-ink outline-none"
          />
        </label>
        <button
          disabled={!f.ready}
          onClick={onStart}
          className="pressable flex items-center justify-center gap-3 bg-violet px-10 py-5 font-semibold text-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          Ver mi impacto <span aria-hidden>↓</span>
        </button>
      </div>
    </section>
  );
}
