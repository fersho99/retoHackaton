"use client";

import Image from "next/image";
import { useMemo, type CSSProperties } from "react";
import { Cifra } from "@/components/ui/cifra";
import { fn, totalsForScope } from "@/lib/data";
import { useCube } from "@/lib/use-data";
import { useReveal } from "@/lib/use-reveal";

const YEAR_IDX = 5; // 2024
const FADE_LEFT = "linear-gradient(to right, transparent, black 38%)";
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Tinta() {
  const cube = useCube();
  const pais = useMemo(() => (cube ? totalsForScope(cube, null, YEAR_IDX) : null), [cube]);
  const [rvRef, visible] = useReveal(0.4);

  return (
    <section className="relative flex min-h-[90svh] items-center overflow-hidden px-6 py-24 sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[58%]"
        style={{ maskImage: FADE_LEFT, WebkitMaskImage: FADE_LEFT }}
      >
        <Image
          src="/img/tinta.jpg"
          alt=""
          fill
          sizes="(min-width: 640px) 58vw, 100vw"
          className="object-cover object-left"
        />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bg/65 sm:hidden" />

      <div ref={rvRef} data-visible={visible} className="contenido relative *:max-w-xl">
        <p className="hud rv">Elección federal · todo el país · 2024</p>
        <p
          className="rv display num mt-6 text-[18vw] font-black text-violet-soft sm:text-[10vw] lg:text-[8rem]"
          style={delay(80)}
        >
          <Cifra value={pais?.sv} visible={visible} />
        </p>
        <p className="rv mt-4 text-xl text-ink-2 sm:text-2xl" style={delay(160)}>
          personas se mancharon el dedo. Otras{" "}
          <span className="num text-ink">{pais ? fn(pais.nv) : "—"}</span> estaban inscritas y no lo
          hicieron.
        </p>
      </div>
    </section>
  );
}
