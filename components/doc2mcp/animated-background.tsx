"use client";

export function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -top-[40%] left-1/2 size-[900px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[140px]" />
      <div className="absolute top-[20%] -right-[20%] size-[600px] rounded-full bg-cyan-600/10 blur-[120px]" />
      <div className="absolute -bottom-[30%] -left-[10%] size-[500px] rounded-full bg-fuchsia-600/8 blur-[100px]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(oklch(1 0 0 / 0.15) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 0.15) 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
    </div>
  );
}
