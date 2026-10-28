"use client";

import { useState } from "react";
import { nombreEstado } from "@/lib/estados";

export function useLandingForm() {
  const [estado, setEstado] = useState<number | null>(null);
  const [edadTxt, setEdadTxt] = useState("25");
  const edad = Number.parseInt(edadTxt, 10);
  const edadValida = Number.isFinite(edad) && edad >= 18 && edad <= 90;

  function commitEdad() {
    if (!Number.isFinite(edad)) return setEdadTxt("25");
    setEdadTxt(String(Math.min(90, Math.max(18, edad))));
  }

  return {
    estado,
    setEstado,
    edadTxt,
    setEdadTxt,
    edad,
    edadValida,
    commitEdad,
    nombre: nombreEstado(estado),
    ready: estado != null && edadValida,
  };
}
