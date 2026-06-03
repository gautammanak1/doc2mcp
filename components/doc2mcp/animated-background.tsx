"use client";

export function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden bg-[#040409]"
    >
      {/* Drifting gradient orbs */}
      <div className="absolute -top-[35%] left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[150px] [animation:bg-drift-a_15s_ease-in-out_infinite]" />
      <div className="absolute top-[12%] -right-[15%] size-[640px] rounded-full bg-sky-500/12 blur-[130px] [animation:bg-drift-c_19s_ease-in-out_infinite]" />
      <div className="absolute -bottom-[28%] -left-[10%] size-[560px] rounded-full bg-fuchsia-600/10 blur-[120px] [animation:bg-drift-b_17s_ease-in-out_infinite]" />

      {/* Top spotlight */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -8%, oklch(0.6 0.2 290 / 0.16), transparent 60%)",
        }}
      />

      {/* Panning grid */}
      <div
        className="absolute inset-0 opacity-[0.045] [animation:grid-pan_22s_linear_infinite]"
        style={{
          backgroundImage: `linear-gradient(oklch(1 0 0 / 0.18) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 0.18) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Scanning beam */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent [animation:beam-sweep_9s_linear_infinite]" />

      {/* Edge vignette to deepen the black */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, #000 100%)",
        }}
      />
    </div>
  );
}
