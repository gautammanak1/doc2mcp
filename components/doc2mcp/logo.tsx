import { cn } from "@/lib/utils";

export function Doc2McpMark({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={cn("shrink-0", className)}
      fill="none"
      height={size}
      viewBox="0 0 64 64"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="d2mTile" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.20 0.05 280)" />
          <stop offset="100%" stopColor="oklch(0.10 0.04 280)" />
        </linearGradient>
        <linearGradient id="d2mAccent" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <filter id="d2mGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.6" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect
        fill="url(#d2mTile)"
        height="64"
        rx="14"
        ry="14"
        stroke="url(#d2mAccent)"
        strokeOpacity="0.45"
        strokeWidth="0.75"
        width="64"
      />

      <g filter="url(#d2mGlow)" stroke="url(#d2mAccent)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4">
        {/* Document with folded corner */}
        <path d="M14 18 L 14 46 L 28 46 L 28 22 L 24 18 Z" fill="none" />
        <path d="M24 18 L 24 22 L 28 22" />

        {/* Document lines */}
        <line x1="17.5" x2="24.5" y1="26" y2="26" />
        <line x1="17.5" x2="24.5" y1="31" y2="31" />
        <line x1="17.5" x2="22" y1="36" y2="36" />

        {/* Arrow */}
        <path d="M30 32 L 38 32" />
        <path d="M35.5 29.5 L 38 32 L 35.5 34.5" />

        {/* Terminal */}
        <rect height="16" rx="2.5" ry="2.5" width="14" x="40" y="24" />
        <path d="M43 29 L 45.5 31.5 L 43 34" />
        <line x1="46.5" x2="50.5" y1="35.5" y2="35.5" />
      </g>
    </svg>
  );
}

export function Doc2McpWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-display font-semibold text-xl tracking-tight",
        className
      )}
    >
      <span className="text-foreground">doc</span>
      <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
        2
      </span>
      <span className="text-foreground">mcp</span>
    </span>
  );
}

export function Doc2McpLogo({
  size = 36,
  className,
  showWordmark = true,
}: {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Doc2McpMark className="logo-glow" size={size} />
      {showWordmark ? <Doc2McpWordmark /> : null}
    </div>
  );
}
