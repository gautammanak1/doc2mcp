"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutTextFlip } from "@/components/ui/layout-text-flip";

const words = [
  "AI Tools",
  "Cursor Context",
  "Claude Servers",
  "Knowledge bases",
];

const EXAMPLES = [
  "https://docs.stripe.com",
  "https://github.com/langchain-ai/langchain",
  "https://mintlify.com/docs",
];

const STATS = [
  { value: "<60s", label: "docs → MCP", tag: "PIPELINE" },
  { value: "1 URL", label: "paste & go", tag: "INPUT" },
  { value: "Hosted", label: "no install", tag: "REMOTE" },
  { value: "5+", label: "MCP clients", tag: "EXPORTS" },
];

export function HeroSection() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      return;
    }

    // Redirect to the chat page with the URL prefilled
    router.push(`/chat?url=${encodeURIComponent(urlInput.trim())}`);
  };

  return (
    <section className="relative flex flex-col min-h-screen items-center justify-center overflow-hidden py-24 sm:py-32">
      {/* Premium Gemini Gradient Glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none opacity-45 dark:opacity-20 blur-[120px]"
        style={{
          background:
            "radial-gradient(circle, rgba(66, 133, 244, 0.12) 0%, rgba(66, 133, 244, 0.04) 60%, transparent 100%)",
        }}
      />

      <div className="flex flex-col items-center justify-center relative z-10 mx-auto w-full max-w-[950px] px-6 text-center">
        {/* Technical Badge */}
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/40 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground/80 backdrop-blur-md mb-8"
          initial={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          Any URL to Model Context Protocol
        </motion.div>

        {/* Headline */}
        <h1
          className={`font-display text-[clamp(2rem,6vw,4.25rem)] leading-[1.05] font-semibold tracking-tight transition-all duration-1000 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <span className="block text-foreground">Turn Any Documentation</span>
          <div className="relative mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <LayoutTextFlip duration={3000} text="Into " words={words} />
          </div>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-8 max-w-2xl text-muted-foreground text-base sm:text-lg leading-relaxed transition-all delay-150 duration-700 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          Paste a docs URL—Mintlify, Docusaurus, GitHub, OpenAPI—and get a
          hosted, Cursor-ready MCP server in seconds. No setup, no local
          scripts.
        </p>

        {/* Gemini Pill Input Form with Bluish Glow */}
        <motion.form
          animate={isVisible ? { y: 0, opacity: 1 } : { y: 15, opacity: 0 }}
          className="mt-10 w-full max-w-[620px] rounded-full border border-border/80 bg-card/50 hover:bg-card/75 hover:border-[#4285f4] dark:hover:border-[#8ab4f8] transition-all duration-300 p-1.5 focus-within:border-[#4285f4] dark:focus-within:border-[#8ab4f8] focus-within:ring-2 focus-within:ring-[#4285f4]/20 focus-within:shadow-[0_0_24px_rgba(66,133,244,0.15)] dark:focus-within:shadow-[0_0_24px_rgba(138,180,248,0.12)] flex items-center animate-fade-in"
          data-tour="hero-url"
          onSubmit={handleSubmit}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <input
            className="flex-1 bg-transparent px-5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/40 font-sans"
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste documentation URL (e.g. docs.stripe.com)..."
            type="text"
            value={urlInput}
          />
          <button
            className="rounded-full bg-[#4285f4] dark:bg-[#8ab4f8] hover:opacity-90 active:scale-[0.98] px-6 py-2.5 text-white dark:text-[#131314] font-medium text-sm flex items-center gap-1.5 transition-all shadow-sm shrink-0"
            type="submit"
          >
            Generate
            <ArrowRight className="size-3.5" />
          </button>
        </motion.form>

        {/* Example Tags */}
        <motion.div
          animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <span>Try an example:</span>
          {EXAMPLES.map((ex) => (
            <button
              className="rounded-full border border-border/50 bg-card/20 px-3 py-1 font-mono text-[11px] text-muted-foreground hover:text-foreground hover:bg-card/50 transition-colors"
              key={ex}
              onClick={() => setUrlInput(ex)}
              type="button"
            >
              {ex.replace("https://", "")}
            </button>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          className="mt-14 grid w-full max-w-[760px] grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {STATS.map((stat) => (
            <div
              className="group relative overflow-hidden rounded-xl border border-border/50 bg-card/30 px-4 py-4 text-left backdrop-blur-md transition-colors hover:border-[#4285f4]/50 dark:hover:border-[#8ab4f8]/50"
              key={stat.tag}
            >
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4285f4]/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:via-[#8ab4f8]/50" />
              <p className="font-display font-semibold text-2xl tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">{stat.label}</p>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                {stat.tag}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
