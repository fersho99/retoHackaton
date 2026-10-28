"use client";

import Image from "next/image";
import { useMemo, type CSSProperties } from "react";
import { Cifra } from "@/components/ui/cifra";
import { totalsForAge } from "@/lib/data";
import { nombreEstado } from "@/lib/estados";
import { useSelection } from "@/lib/selection";
import { useCube } from "@/lib/use-data";
import { useReveal } from "@/lib/use-reveal";

const YEAR_IDX = 5; // 2024
const FADE = "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)";
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function NoVotaron() {
  const cube = useCube();
  const { estado, edad } = useSelection();
  const lugar = nombreEstado(estado) ?? "México";
  const [rvRef, visible] = useReveal(0.4);

  const faltan = useMemo(
    () => (cube ? totalsForAge(cube, estado, YEAR_IDX, edad).nv : null),
    [cube, estado, edad],
  );

  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden px-6 py-24 sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      >
        <Image
          src="/img/boleta.jpg"
          alt=""
          fill
          sizes="100vw"
          className="-scale-x-100 object-cover opacity-80"
        />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bg/70 sm:hidden" />

      <div ref={rvRef} data-visible={visible} className="relative">
        <p className="hud rv">
          Lista nominal · {lugar} · {edad} años · 2024
        </p>
        <p
          className="rv display num mt-6 text-[20vw] font-black sm:text-[12vw] lg:text-[9rem]"
          style={delay(80)}
        >
          <Cifra value={faltan} visible={visible} />
        </p>
        <p className="rv mt-4 max-w-md text-xl text-ink-2 sm:text-2xl" style={delay(160)}>
          personas de <span className="num text-ink">{edad}</span> años en{" "}
          <span className="text-ink">{lugar}</span> estaban inscritas para votar y no lo hicieron.
        </p>
      </div>
    </section>
  );
}
