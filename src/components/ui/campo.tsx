"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { EDAD_MAX, EDAD_MIN, irACampo } from "@/lib/selection";

function Chevron() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="pointer-events-none size-4 shrink-0 text-ink-2"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

type SelectProps = {
  id?: string;
  etiqueta: string;
  value: number | null;
  onChange: (v: number | null) => void;
  opciones: { value: number; label: string }[];
  /** Texto de la opción vacía (p. ej. "Todo el país"); sin él, no hay opción vacía. */
  vacio?: string;
  className?: string;
};

export function CampoSelect({
  id,
  etiqueta,
  value,
  onChange,
  opciones,
  vacio,
  className,
}: SelectProps) {
  return (
    <label className={clsx("campo flex flex-col gap-1", className)}>
      <span className="hud">{etiqueta}</span>
      <span className="flex items-center gap-3">
        <select
          id={id}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
          className={clsx(
            "w-full min-w-0 flex-1 cursor-pointer appearance-none truncate bg-transparent text-lg outline-none",
            value == null ? "text-ink-2" : "text-ink",
          )}
        >
          {vacio && (
            <option value="" className="bg-surface text-ink">
              {vacio}
            </option>
          )}
          {opciones.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface text-ink">
              {o.label}
            </option>
          ))}
        </select>
        <Chevron />
      </span>
    </label>
  );
}

const REPETIR_TRAS = 400;
const REPETIR_CADA = 70;

/** Botón − / + que repite mientras se mantiene presionado. */
function Paso({
  dir,
  disabled,
  onStep,
}: {
  dir: -1 | 1;
  disabled: boolean;
  /** Devuelve false cuando ya no hay a dónde avanzar, para cortar la repetición. */
  onStep: (dir: -1 | 1) => boolean;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepRef = useRef(onStep);
  useEffect(() => {
    stepRef.current = onStep;
  }, [onStep]);

  const parar = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  useEffect(() => {
    const t = timer;
    return () => {
      if (t.current) clearTimeout(t.current);
    };
  }, []);

  const repetir = () => {
    if (stepRef.current(dir)) timer.current = setTimeout(repetir, REPETIR_CADA);
    else timer.current = null;
  };

  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={dir < 0 ? "Restar un año" : "Sumar un año"}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        if (stepRef.current(dir)) timer.current = setTimeout(repetir, REPETIR_TRAS);
      }}
      onPointerUp={parar}
      onPointerLeave={parar}
      onPointerCancel={parar}
      // Teclado (Enter/Espacio) llega como click sin puntero
      onClick={(e) => e.detail === 0 && onStep(dir)}
      className="pressable paso grid size-9 shrink-0 place-items-center rounded-full bg-white/6 text-lg text-ink disabled:opacity-30"
    >
      <span aria-hidden>{dir < 0 ? "−" : "+"}</span>
    </button>
  );
}

type EdadProps = {
  id?: string;
  value: number | null;
  onChange: (v: number | null) => void;
  className?: string;
};

export function CampoEdad({ id, value, onChange, className }: EdadProps) {
  const [txt, setTxt] = useState(value == null ? "" : String(value));
  const [editando, setEditando] = useState(false);
  const mostrado = editando ? txt : value == null ? "" : String(value);

  // Vacío ↔ 18 … 90: bajar de 18 regresa a "todas las edades"
  const step = (dir: -1 | 1) => {
    let next: number | null;
    if (value == null) next = dir > 0 ? EDAD_MIN : null;
    else {
      const n = value + dir;
      next = n < EDAD_MIN ? null : Math.min(EDAD_MAX, n);
    }
    if (next === value) return false;
    onChange(next);
    setTxt(next == null ? "" : String(next));
    // Al llegar a "todas" o a 90 se detiene la repetición
    return next != null && next < EDAD_MAX;
  };

  return (
    <div className={clsx("campo campo-texto flex flex-col gap-1", className)}>
      <label htmlFor={id} className="hud cursor-text">
        Tu edad
      </label>
      <div className="flex items-center gap-3">
        <Paso dir={-1} disabled={value == null} onStep={step} />
        <span className="flex min-w-0 flex-1 items-baseline justify-center gap-1.5">
          <input
            id={id}
            inputMode="numeric"
            placeholder="Todas"
            value={mostrado}
            size={5}
            onFocus={() => {
              setTxt(value == null ? "" : String(value));
              setEditando(true);
            }}
            onChange={(e) => {
              const t = e.target.value.replace(/\D/g, "").slice(0, 2);
              setTxt(t);
              if (t === "") onChange(null);
              else {
                const n = Number.parseInt(t, 10);
                if (n >= EDAD_MIN && n <= EDAD_MAX) onChange(n);
              }
            }}
            onBlur={() => setEditando(false)}
            className={clsx(
              "num w-[3ch] bg-transparent text-center text-lg text-ink outline-none placeholder:text-ink-2",
              value == null && !editando && "w-[5.5ch]",
            )}
          />
          {(value != null || (editando && txt !== "")) && (
            <span className="text-lg text-ink-2">años</span>
          )}
        </span>
        <Paso dir={1} disabled={value != null && value >= EDAD_MAX} onStep={step} />
      </div>
    </div>
  );
}

/** Aviso de que se está viendo un promedio, con atajo al campo que lo personaliza. */
export function NotaPromedio({
  campo,
  children,
  className = "mt-6",
}: {
  campo: "campo-estado" | "campo-edad";
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => irACampo(campo)}
      className={clsx(
        // ! porque .hud define su propio color gris
        "pressable nota-promedio hud inline-flex items-baseline gap-2 text-left text-violet-soft! hover:text-ink!",
        className,
      )}
    >
      {children} <span aria-hidden>↑</span>
    </button>
  );
}
