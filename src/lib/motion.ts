// Vocabulario de movimiento compartido. Mismos valores que las variables CSS
// de globals.css, para que CSS y JS se sientan como un solo sistema.

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;
export const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;
export const EASE_DRAWER = [0.32, 0.72, 0, 1] as const;

export const DUR = {
  press: 0.14,
  small: 0.18,
  ui: 0.22,
  reveal: 0.7,
} as const;

// Separación entre elementos que entran juntos (30–80 ms)
export const STAGGER = 0.06;

// Resorte sutil para valores que cambian por interacción (slider, cifras)
export const SPRING_SOFT = { type: "spring", duration: 0.5, bounce: 0.15 } as const;
