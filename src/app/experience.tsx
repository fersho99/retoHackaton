"use client";

import { useRef } from "react";
import { Hero } from "@/components/landing/hero";
import { useLandingForm } from "@/components/landing/use-landing-form";

export function Experience() {
  const form = useLandingForm();
  const nextRef = useRef<HTMLElement>(null);

  function start() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    nextRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <main>
      <Hero form={form} onStart={start} />
      <section
        ref={nextRef}
        className="flex min-h-svh flex-col justify-center border-t border-line px-6 sm:px-10"
      >
        <p className="hud">Participación por edad · {form.nombre ?? "Nacional"} · 2024</p>
        <p className="mt-4 max-w-2xl text-2xl text-ink-2">
          Tu punto en la curva: <span className="num text-magenta">{form.edad}</span> años.
        </p>
      </section>
    </main>
  );
}
