"use client";

import clsx from "clsx";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useSelection } from "@/lib/selection";
import { datosTarjeta, paramsDe } from "@/lib/tarjeta";
import { useCube } from "@/lib/use-data";
import { useReveal } from "@/lib/use-reveal";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function Compartir() {
  const cube = useCube();
  const { estado, edad } = useSelection();
  const [rvRef, visible] = useReveal();
  const q = paramsDe(estado, edad).toString();
  const src = `/api/tarjeta${q ? `?${q}` : ""}`;
  const texto = useMemo(
    () => (cube ? datosTarjeta(cube, estado, edad).texto : ""),
    [cube, estado, edad],
  );

  const [cargada, setCargada] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  // El PNG se pide antes de tocar "Compartir": Safari exige compartir justo después del toque
  const archivo = useRef<{ src: string; file: File } | null>(null);

  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 2200);
    return () => clearTimeout(t);
  }, [aviso]);

  const precargar = async () => {
    if (archivo.current?.src === src) return;
    const blob = await (await fetch(src)).blob();
    archivo.current = { src, file: new File([blob], "mi-dato-ine.png", { type: "image/png" }) };
  };

  const enlace = () => `${window.location.origin}/${q ? `?${q}` : ""}`;

  const compartir = async () => {
    const url = enlace();
    const file = archivo.current?.src === src ? archivo.current.file : null;
    try {
      if (file && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `${texto} ${url}` });
      } else if (navigator.share) {
        await navigator.share({ text: texto, url });
      } else {
        await navigator.clipboard.writeText(`${texto} ${url}`);
        setAviso("Enlace copiado");
      }
    } catch (e) {
      // Cerrar el menú de compartir no es un error
      if ((e as Error).name !== "AbortError") setAviso("No se pudo compartir");
    }
  };

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(enlace());
      setAviso("Enlace copiado");
    } catch {
      setAviso("No se pudo copiar");
    }
  };

  return (
    <section className="px-6 py-24 sm:px-10">
      <div
        ref={rvRef}
        data-visible={visible}
        className="contenido grid items-center gap-12 lg:grid-cols-[auto_auto] lg:justify-start lg:gap-20"
      >
        <div>
          <p className="hud rv">Tu tarjeta · 1080 × 1920</p>
          <h2
            className="rv display mt-6 text-[14vw] font-black uppercase sm:text-[9vw] lg:text-[7rem]"
            style={delay(80)}
          >
            Pásalo.
          </h2>
          <p className="rv mt-6 max-w-md text-xl text-ink-2 sm:text-2xl" style={delay(160)}>
            {texto || "Tu dato, listo para tus historias."}
          </p>

          <div className="rv mt-10 flex flex-wrap items-center gap-3" style={delay(240)}>
            <button
              type="button"
              onClick={compartir}
              className="pressable rounded-full bg-violet px-8 py-4 font-semibold text-bg"
            >
              Compartir
            </button>
            <a
              href={src}
              download="mi-dato-ine.png"
              className="pressable boton-sec rounded-full bg-white/6 px-6 py-4 text-ink"
            >
              Descargar imagen
            </a>
            <button
              type="button"
              onClick={copiar}
              className="pressable boton-sec rounded-full bg-white/6 px-6 py-4 text-ink"
            >
              Copiar enlace
            </button>
          </div>
          <p role="status" aria-live="polite" className="hud mt-4 h-4 text-violet-soft!">
            {aviso}
          </p>
        </div>

        <figure className="rv justify-self-center lg:justify-self-start" style={delay(200)}>
          <div className="relative aspect-[9/16] w-[min(72vw,20rem)] overflow-hidden rounded-[1.25rem] bg-surface shadow-2xl shadow-black/60">
            {visible && (
              // eslint-disable-next-line @next/next/no-img-element -- imagen generada en el servidor, ya optimizada
              <img
                key={src}
                src={src}
                alt={texto}
                onLoad={() => {
                  setCargada(src);
                  void precargar();
                }}
                className={clsx(
                  "tarjeta-img absolute inset-0 size-full object-cover",
                  cargada === src ? "opacity-100" : "opacity-0",
                )}
              />
            )}
          </div>
        </figure>
      </div>
    </section>
  );
}
