"use client";

import { useMemo, type CSSProperties } from "react";
import { Cifra } from "@/components/ui/cifra";
import { Foto } from "@/components/ui/foto";
import { fn, totalsForScope } from "@/lib/data";
import { useCube } from "@/lib/use-data";
import { useReveal } from "@/lib/use-reveal";

const YEAR_IDX = 5; // 2024
// Se desvanece hacia el texto y también arriba y abajo, para que no se vea el corte entre secciones
const MASCARA = [
  "linear-gradient(to right, transparent, black 38%)",
  "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
].join(", ");
const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Tinta() {
  const cube = useCube();
  const pais = useMemo(() => (cube ? totalsForScope(cube, null, YEAR_IDX) : null), [cube]);
  const [rvRef, visible] = useReveal(0.4);

  return (
    <section className="relative flex min-h-[90svh] items-center overflow-clip px-6 py-24 sm:px-10">
      <Foto
        src="/img/tinta.jpg"
        sizes="(min-width: 640px) 58vw, 100vw"
        className="inset-y-0 right-0 w-full sm:w-[58%]"
        style={{
          maskImage: MASCARA,
          WebkitMaskImage: MASCARA,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
        imgClassName="object-left"
      />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-bg/65 sm:hidden" />

      <div ref={rvRef} data-visible={visible} className="contenido relative *:max-w-xl">
        <p
          className="rv display num text-[18vw] font-black text-violet-soft sm:text-[10vw] lg:text-[8rem]"
          style={delay(80)}
        >
          <Cifra value={pais?.sv} visible={visible} />
        </p>
        <p className="rv mt-4 text-xl text-ink-2 sm:text-2xl" style={delay(160)}>
          personas en todo el país se mancharon el dedo en 2024. Otras{" "}
          <span className="num text-ink">{pais ? fn(pais.nv) : "—"}</span> estaban inscritas y no lo
          hicieron.
        </p>
      </div>
    </section>
  );
}
