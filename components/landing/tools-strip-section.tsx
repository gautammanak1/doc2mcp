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

export function ToolsStripSection() {
  return (
    <section className="relative border-border/40 border-y bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        <div className="text-center">
          <p className="font-display font-semibold text-foreground text-xl sm:text-2xl">
            Works with your favorite AI tools
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            One MCP server, ready to paste into every major AI editor.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {TOOLS.map((tool) => (
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3.5 py-2 text-foreground/80 text-sm transition-colors hover:border-border hover:text-foreground"
              key={tool.name}
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
              <span className="font-medium">{tool.name}</span>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-muted-foreground/80 text-xs">
          Plus any MCP-compatible AI tool via manual configuration.
        </p>
      </div>
    </section>
  );
}
