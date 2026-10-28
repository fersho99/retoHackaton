"use client";

import { useRef } from "react";
import { CurvaEdad } from "@/components/curva/curva-edad";
import { Hero } from "@/components/landing/hero";
import { NoVotaron } from "@/components/interludio/no-votaron";
import { Tinta } from "@/components/interludio/tinta";
import { PesoMunicipio } from "@/components/municipio/peso-municipio";
import { Simulador } from "@/components/simulador/simulador";

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
      <NoVotaron />
      <PesoMunicipio />
      <Simulador />
      <Tinta />
      <footer className="hud px-6 py-10 sm:px-10">
        Fuente de datos: INE · Conteos Censales de Participación Ciudadana 2009—2024
      </footer>
    </main>
  );
}
