"use client";

import { useRef } from "react";
import { CurvaEdad } from "@/components/curva/curva-edad";
import { Hero } from "@/components/landing/hero";
import { PesoMunicipio } from "@/components/municipio/peso-municipio";

export function Experience() {
  const curvaRef = useRef<HTMLElement>(null);

  function start() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    curvaRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <main>
      <Hero onStart={start} />
      <CurvaEdad ref={curvaRef} />
      <PesoMunicipio />
      <footer className="hud flex flex-col gap-2 border-t border-line px-6 py-8 sm:px-10">
        <p>Fuente de datos: INE · Conteos Censales de Participación Ciudadana 2009—2024</p>
        <p>
          Arte de los cubos: convocatoria Hackea la participación, INE · Fondo: Gradient Wallpapers,
          Unsplash
        </p>
      </footer>
    </main>
  );
}
