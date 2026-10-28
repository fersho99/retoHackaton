import { create } from "zustand";

export const EDAD_MIN = 18;
export const EDAD_MAX = 90;

/** Campos opcionales: null significa "todo el país" o "todas las edades". */
type Selection = {
  estado: number | null;
  edad: number | null;
  setEstado: (codigo: number | null) => void;
  setEdad: (edad: number | null) => void;
};

export const useSelection = create<Selection>((set) => ({
  estado: null,
  edad: null,
  setEstado: (estado) => set({ estado }),
  setEdad: (edad) =>
    set({
      edad: edad == null ? null : Math.min(EDAD_MAX, Math.max(EDAD_MIN, Math.round(edad))),
    }),
}));

/** "en Sonora" o "en todo el país" */
export function enLugar(nombre: string | null) {
  return nombre ? `en ${nombre}` : "en todo el país";
}

/** Lleva a la portada y deja el cursor en el campo indicado. */
export function irACampo(id: "campo-estado" | "campo-edad") {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  document.getElementById(id)?.focus({ preventScroll: true });
}
