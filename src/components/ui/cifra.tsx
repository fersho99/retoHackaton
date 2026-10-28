"use client";

import NumberFlow from "@number-flow/react";
import type { CSSProperties } from "react";

type Props = {
  value: number | null | undefined;
  /** Mientras sea false la cifra se queda en cero; al activarse gira hasta su valor. */
  visible: boolean;
  suffix?: string;
  className?: string;
};

export function Cifra({ value, visible, suffix, className }: Props) {
  if (value == null) return <span className={className}>—</span>;
  // El recorte deja que los dígitos giren dentro de su renglón sin invadir el texto vecino
  return (
    <span className="-mb-[0.1em] inline-block overflow-clip pb-[0.1em] align-bottom">
      <NumberFlow
        value={visible ? value : 0}
        suffix={suffix}
        locales="en-US"
        format={{ maximumFractionDigits: 0 }}
        className={className}
        style={{ "--number-flow-mask-height": "0.06em" } as CSSProperties}
      />
    </span>
  );
}
