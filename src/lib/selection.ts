import { create } from "zustand";

type Selection = {
  estado: number | null;
  edad: number;
  setEstado: (codigo: number | null) => void;
  setEdad: (edad: number) => void;
};

export const useSelection = create<Selection>((set) => ({
  estado: null,
  edad: 25,
  setEstado: (estado) => set({ estado }),
  setEdad: (edad) => set({ edad: Math.min(90, Math.max(18, Math.round(edad))) }),
}));
