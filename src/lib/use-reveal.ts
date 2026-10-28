"use client";

import { useInView } from "motion/react";
import { useRef } from "react";

/** Marca un bloque como visible la primera vez que entra en pantalla. */
export function useReveal<T extends Element = HTMLDivElement>(amount = 0.25) {
  const ref = useRef<T>(null);
  const visible = useInView(ref, { once: true, amount });
  return [ref, visible] as const;
}
