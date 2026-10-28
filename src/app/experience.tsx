"use client";

import { useEffect, useRef } from "react";
import { Compartir } from "@/components/compartir/compartir";
import { CurvaEdad } from "@/components/curva/curva-edad";
import { Hero } from "@/components/landing/hero";
import { NoVotaron } from "@/components/interludio/no-votaron";
import { Tinta } from "@/components/interludio/tinta";
import { PesoMunicipio } from "@/components/municipio/peso-municipio";
import { Simulador } from "@/components/simulador/simulador";
import { useSelection } from "@/lib/selection";
import { leerParams, paramsDe } from "@/lib/tarjeta";

export function Experience() {
  const curvaRef = useRef<HTMLElement>(null);
  const { estado, edad, setEstado, setEdad } = useSelection();
  const leido = useRef(false);

  // Un enlace compartido abre la página con el estado y la edad de quien lo envió
  useEffect(() => {
    // Solo una vez: en desarrollo los efectos corren dos veces y la URL ya podría estar reescrita
    if (leido.current) return;
    const inicial = leerParams(new URLSearchParams(window.location.search));
    setEstado(inicial.estado);
    setEdad(inicial.edad);
    leido.current = true;
  }, [setEstado, setEdad]);

  // La barra de direcciones siempre refleja la selección actual
  useEffect(() => {
    if (!leido.current) return;
    const q = paramsDe(estado, edad).toString();
    window.history.replaceState(null, "", q ? `?${q}` : window.location.pathname);
  }, [estado, edad]);

  function start() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    curvaRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <main>
      <Hero onStart={start} />
      <CurvaEdad ref={curvaRef} />
      <NoVotaron />
      <PesoMunicipio />
      <Simulador />
      <Tinta />
      <Compartir />
      <footer className="px-6 py-10 sm:px-10">
        <p className="contenido hud">
          Fuente de datos: INE · Conteos Censales de Participación Ciudadana 2009—2024
        </p>
      </footer>
    </main>
  );
}
