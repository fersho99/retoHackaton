"use client";

import clsx from "clsx";
import Image from "next/image";
import type { CSSProperties } from "react";
import { useReveal } from "@/lib/use-reveal";

type Props = {
  src: string;
  sizes: string;
  /** Contenedor: posición, tamaño, máscara y opacidad */
  className?: string;
  style?: CSSProperties;
  imgClassName?: string;
};

/** Foto de fondo que se asienta al entrar en pantalla y se desplaza un poco con el scroll. */
export function Foto({ src, sizes, className, style, imgClassName }: Props) {
  const [ref, visible] = useReveal<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      aria-hidden
      data-visible={visible}
      // clip y no hidden: hidden crea un contenedor de scroll y el paralaje dejaría de moverse
      className={clsx("pointer-events-none absolute overflow-clip", className)}
      style={style}
    >
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        className={clsx("foto object-cover", imgClassName)}
      />
    </div>
  );
}
