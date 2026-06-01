import Image from "next/image";

type Tool = {
  name: string;
  icon: string;
  /** Monochrome marks invert on dark mode; coloured brand marks stay as-is. */
  invertOnDark?: boolean;
};

const TOOLS: Tool[] = [
  { name: "Cursor", icon: "/icons/tools/cursor.svg", invertOnDark: true },
  { name: "Claude Desktop", icon: "/icons/tools/claude.svg" },
  {
    name: "VS Code",
    icon: "/icons/tools/visualstudiocode.svg",
    invertOnDark: true,
  },
  { name: "Claude Code", icon: "/icons/tools/claude.svg" },
  {
    name: "Windsurf",
    icon: "/icons/tools/windsurf.svg",
    invertOnDark: true,
  },
  { name: "Codex", icon: "/icons/tools/openai.svg", invertOnDark: true },
  { name: "Gemini CLI", icon: "/icons/tools/googlegemini.svg" },
  { name: "ChatGPT", icon: "/icons/tools/openai.svg", invertOnDark: true },
  { name: "Zed", icon: "/icons/tools/zedindustries.svg" },
];

// Duplicate the list so the translate animation can loop seamlessly
// (when the first copy fully translates off-screen the second copy is
// already in the same position).
const MARQUEE = [...TOOLS, ...TOOLS];

function ToolPill({ tool }: { tool: Tool }) {
  return (
    <div
      aria-hidden="true"
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 py-2 text-foreground/80 text-sm transition-colors hover:border-border hover:text-foreground"
    >
      <Image
        alt=""
        className={
          tool.invertOnDark
            ? "size-4 shrink-0 dark:invert"
            : "size-4 shrink-0"
        }
        height={16}
        src={tool.icon}
        width={16}
      />
      <span className="whitespace-nowrap font-medium">{tool.name}</span>
    </div>
  );
}

export function ToolsStripSection() {
  return (
    <section className="relative border-border/40 border-y bg-background py-14 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6 lg:px-12">
        <div className="text-center">
          <p className="font-display font-semibold text-foreground text-xl sm:text-2xl">
            Works with your favorite AI tools
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            One MCP server, ready to paste into every major AI editor.
          </p>
        </div>

        {/* Accessible flat list for screen readers — visually replaced by
            the animated marquee below. */}
        <ul className="sr-only">
          {TOOLS.map((tool) => (
            <li key={tool.name}>{tool.name}</li>
          ))}
        </ul>

        <div
          aria-hidden="true"
          className="tools-marquee relative mt-8 sm:mt-10"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="tools-marquee-track flex w-max items-center gap-3 sm:gap-3.5">
            {MARQUEE.map((tool, i) => (
              <ToolPill key={`${tool.name}-${String(i)}`} tool={tool} />
            ))}
          </div>
        </div>

        <p className="mt-7 text-center text-muted-foreground/80 text-xs sm:mt-8">
          Plus any MCP-compatible AI tool via manual configuration.
        </p>
      </div>

      <style>{`
        .tools-marquee {
          overflow: hidden;
        }
        .tools-marquee-track {
          animation: tools-marquee-scroll 38s linear infinite;
          will-change: transform;
        }
        .tools-marquee:hover .tools-marquee-track {
          animation-play-state: paused;
        }
        @keyframes tools-marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .tools-marquee-track { animation: none; }
        }
      `}</style>
    </section>
  );
}
