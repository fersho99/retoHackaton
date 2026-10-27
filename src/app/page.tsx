const SWATCHES = [
  ["bg", "var(--bg)"],
  ["surface", "var(--surface)"],
  ["surface-2", "var(--surface-2)"],
  ["ink", "var(--ink)"],
  ["ink-2", "var(--ink-2)"],
  ["ink-3", "var(--ink-3)"],
  ["violet", "var(--violet)"],
  ["magenta · tú", "var(--magenta)"],
  ["referencia", "var(--reference)"],
] as const;

export default function Specimen() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <p className="hud">Sistema de diseño · v1</p>
      <h1 className="display mt-4 text-7xl font-black uppercase sm:text-8xl">
        No elegir,
        <br />
        también es una elección
      </h1>
      <p className="mt-6 max-w-xl text-lg text-ink-2">
        Texto de lectura en Archivo. Las cifras usan números tabulares:{" "}
        <span className="num font-mono text-ink">49.6% · 35.1% · 16,768</span>
      </p>

      <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-9">
        {SWATCHES.map(([name, color]) => (
          <div key={name} className="flex flex-col gap-2">
            <div
              className="aspect-square rounded-md border border-line"
              style={{ background: color }}
            />
            <span className="hud">{name}</span>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <button className="pressable rounded-full bg-violet px-7 py-3.5 font-semibold text-bg">
          Ver mi impacto
        </button>
        <button className="pressable hover-lift rounded-full border border-line px-7 py-3.5 text-ink">
          Secundario
        </button>
        <span className="hud">00:00:19:18 · Sonora · 25 años</span>
      </div>
    </main>
  );
}
