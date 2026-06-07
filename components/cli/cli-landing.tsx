"use client";

import { Check, Copy } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

const INSTALL_COMMAND = "npm install -g doc2mcp";

const HERO_ASCII = `██████╗  ██████╗  ██████╗██████╗ ███╗   ███╗ ██████╗██████╗
██╔══██╗██╔═══██╗██╔════╝╚════██╗████╗ ████║██╔════╝██╔══██╗
██║  ██║██║   ██║██║      █████╔╝██╔████╔██║██║     ██████╔╝
██║  ██║██║   ██║██║     ██╔═══╝ ██║╚██╔╝██║██║     ██╔═══╝
██████╔╝╚██████╔╝╚██████╗███████╗██║ ╚═╝ ██║╚██████╗██║
╚═════╝  ╚═════╝  ╚═════╝╚══════╝╚═╝     ╚═╝ ╚═════╝╚═╝`;

type TerminalSequence = {
  command: string;
  outputs: string[];
};

const TERMINAL_SEQUENCES: TerminalSequence[] = [
  {
    command: "doc2mcp login",
    outputs: [
      "Opening your browser to authorize…",
      "Approved as you@company.com",
      "You're logged in.",
    ],
  },
  {
    command: "doc2mcp https://docs.stripe.com",
    outputs: [
      "Crawling docs.stripe.com…",
      "Indexed 248 pages into a hosted MCP",
      "MCP ready: https://doc2mcp.site/api/mcp/stripe",
    ],
  },
  {
    command: "doc2mcp install stripe",
    outputs: [
      "Select editors: Cursor, VS Code",
      "Wrote MCP config to ~/.cursor/mcp.json",
      "Installed — restart your editor to use it.",
    ],
  },
  {
    command: "doc2mcp chat",
    outputs: [
      "Chatting with Stripe docs…",
      "you: how do I create a PaymentIntent?",
      "doc2mcp: POST /v1/payment_intents with amount + currency.",
    ],
  },
];

const COMMANDS = TERMINAL_SEQUENCES.map((sequence) => sequence.command);

const IDES = [
  { name: "cursor", desc: "AI-powered editor" },
  { name: "vscode", desc: "VS Code + Copilot" },
  { name: "claude", desc: "Claude Desktop" },
  { name: "windsurf", desc: "Codeium Windsurf" },
  { name: "cline", desc: "Autonomous coding" },
  { name: "any-mcp", desc: "Any MCP client" },
] as const;

const STEP_CARDS = [
  {
    id: "login",
    step: "01",
    title: "Authenticate",
    desc: "Browser-based login — no API keys to copy around.",
    command: "doc2mcp login",
  },
  {
    id: "convert",
    step: "02",
    title: "Convert docs",
    desc: "Point at any docs URL and get a hosted, token-secured MCP.",
    command: "doc2mcp https://docs.stripe.com",
  },
  {
    id: "chat",
    step: "03",
    title: "Chat in terminal",
    desc: "Ask questions and get cited answers without leaving your shell.",
    command: "doc2mcp chat",
  },
] as const;

function useCopyState() {
  const [copied, setCopied] = useState<Record<string, boolean>>({});
  const copy = useCallback((text: string, key: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied((prev) => ({ ...prev, [key]: true }));
        setTimeout(() => {
          setCopied((prev) => ({ ...prev, [key]: false }));
        }, 2000);
      })
      .catch(() => {
        setCopied((prev) => ({ ...prev, [key]: false }));
      });
  }, []);
  return { copied, copy };
}

function CopyButton({
  command,
  copied,
  onCopy,
  label,
}: {
  command: string;
  copied: boolean;
  onCopy: () => void;
  label?: string;
}) {
  return (
    <button
      className="group relative w-full cursor-pointer text-left sm:w-auto"
      onClick={onCopy}
      type="button"
    >
      <span className="absolute inset-0 border border-gray-600 bg-gray-900/20 transition-all duration-300 group-hover:border-white" />
      <span className="relative flex translate-x-0.5 translate-y-0.5 items-center gap-2 border border-gray-400 bg-transparent px-6 py-3 font-medium text-white text-sm transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-white group-hover:bg-gray-900/30">
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4 text-gray-400" />
        )}
        <span className="text-gray-500">$</span>
        <span>{label ?? command}</span>
      </span>
    </button>
  );
}

function useTypingTerminal() {
  const [currentCommand, setCurrentCommand] = useState(0);
  const [typed, setTyped] = useState("");
  const [lines, setLines] = useState<string[]>([]);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const sequence = TERMINAL_SEQUENCES[currentCommand];
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    setLines([]);
    setTyped("");
    setExecuting(false);

    const command = sequence.command;
    for (let i = 0; i <= command.length; i++) {
      timeouts.push(
        setTimeout(() => {
          setTyped(command.slice(0, i));
        }, i * 55)
      );
    }

    const afterTyping = command.length * 55 + 400;
    timeouts.push(
      setTimeout(() => {
        setExecuting(true);
        setTyped("");
        setLines((prev) => [...prev, `you@dev:~$ ${command}`]);
      }, afterTyping)
    );

    sequence.outputs.forEach((output, index) => {
      timeouts.push(
        setTimeout(
          () => {
            setLines((prev) => [...prev, output]);
          },
          afterTyping + 600 + index * 700
        )
      );
    });

    timeouts.push(
      setTimeout(
        () => {
          setCurrentCommand((prev) => (prev + 1) % COMMANDS.length);
        },
        afterTyping + 600 + sequence.outputs.length * 700 + 1800
      )
    );

    return () => {
      for (const id of timeouts) {
        clearTimeout(id);
      }
    };
  }, [currentCommand]);

  return { currentCommand, typed, lines, executing };
}

function HeroTerminal() {
  const { typed, lines, executing } = useTypingTerminal();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="border border-gray-700 bg-gray-950 shadow-2xl">
        <div className="flex items-center justify-between border-gray-700 border-b bg-gray-900 px-5 py-3">
          <div className="flex items-center gap-3">
            <span className="flex gap-2">
              <span className="h-3 w-3 bg-red-500" />
              <span className="h-3 w-3 bg-yellow-500" />
              <span className="h-3 w-3 bg-green-500" />
            </span>
            <span className="text-gray-400 text-sm">doc2mcp — terminal</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
            <span className="text-gray-500 text-xs">LIVE</span>
          </div>
        </div>
        <div className="min-h-[260px] bg-black p-5 font-mono text-sm">
          <div className="space-y-2">
            {lines.map((line) => (
              <div
                className={
                  line.startsWith("you@dev") ? "text-white" : "text-gray-300"
                }
                key={line}
              >
                {line}
              </div>
            ))}
            {executing ? (
              <div className="flex items-center gap-2 text-gray-400">
                <span className="h-1 w-1 animate-bounce rounded-full bg-gray-400" />
                <span className="text-xs">working…</span>
              </div>
            ) : (
              <div className="text-white">
                <span className="text-green-400">you@dev</span>
                <span className="text-gray-500">:</span>
                <span className="text-blue-400">~</span>
                <span>$ </span>
                <span>{typed}</span>
                <span className="animate-pulse">█</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CliLanding() {
  const { copied, copy } = useCopyState();
  const matrix = useMemo(() => {
    const chars = "DOC2MCP01█▓▒░▄▀".split("");
    return Array.from({ length: 90 }, (_, i) => ({
      id: `m-${i}`,
      char: chars[i % chars.length],
    }));
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-black font-mono text-white">
      <div className="pointer-events-none fixed inset-0 opacity-10">
        <div className="grid h-full grid-cols-12 gap-1">
          {matrix.map((cell) => (
            <div className="animate-pulse text-gray-500 text-xs" key={cell.id}>
              {cell.char}
            </div>
          ))}
        </div>
      </div>

      <nav className="sticky top-0 z-10 border-gray-800 border-b bg-gray-950/95 p-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex gap-2">
              <span className="h-3 w-3 bg-red-500" />
              <span className="h-3 w-3 bg-yellow-500" />
              <span className="h-3 w-3 bg-green-500" />
            </span>
            <Link className="flex items-center gap-2" href="/">
              <span className="font-bold text-lg text-white">doc2mcp</span>
              <span className="text-gray-400 text-sm">CLI</span>
            </Link>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            <a className="text-gray-400 text-sm hover:text-white" href="#ides">
              Editors
            </a>
            <a
              className="text-gray-400 text-sm hover:text-white"
              href="#commands"
            >
              Commands
            </a>
            <Link
              className="text-gray-400 text-sm hover:text-white"
              href="/docs/cli"
            >
              Docs
            </Link>
            <a
              className="text-gray-400 text-sm hover:text-white"
              href="https://www.npmjs.com/package/doc2mcp"
              rel="noopener"
              target="_blank"
            >
              npm
            </a>
          </div>
          <CopyButton
            command={INSTALL_COMMAND}
            copied={copied["nav-install"] ?? false}
            label="Install"
            onCopy={() => copy(INSTALL_COMMAND, "nav-install")}
          />
        </div>
      </nav>

      <section className="relative px-6 py-20 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <pre className="mb-8 inline-block font-bold text-[10px] text-white leading-none sm:text-sm lg:text-base">
              {HERO_ASCII}
            </pre>
            <h1 className="mb-6 font-bold text-4xl leading-tight lg:text-6xl">
              Turn any docs into an MCP,
              <br />
              right from your{" "}
              <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                terminal
              </span>
              .
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-gray-300 text-lg leading-relaxed">
              Paste a documentation URL — Stripe, Anthropic, your own — and
              doc2mcp crawls it into a hosted, token-secured MCP server your
              editor can call. Then chat with it without leaving the shell.
            </p>
            <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
              <CopyButton
                command={INSTALL_COMMAND}
                copied={copied["hero-install"] ?? false}
                onCopy={() => copy(INSTALL_COMMAND, "hero-install")}
              />
              <Link
                className="group relative w-full sm:w-auto"
                href="/docs/cli"
              >
                <span className="absolute inset-0 border-2 border-gray-600 border-dashed bg-gray-900/20 transition-all duration-300 group-hover:border-white" />
                <span className="relative flex translate-x-1 translate-y-1 items-center gap-3 border-2 border-gray-400 border-dashed bg-transparent px-8 py-3 font-bold text-white transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:border-white">
                  <span className="text-gray-400">→</span>
                  <span>Read the docs</span>
                </span>
              </Link>
            </div>
          </div>
          <HeroTerminal />
        </div>
      </section>

      <section
        className="border-gray-800 border-t px-6 py-16 lg:px-12"
        id="ides"
      >
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 font-bold text-3xl lg:text-4xl">
              Installs into your editor
            </h2>
            <p className="text-gray-400 text-lg">
              One command wires the MCP into the tools you already use.
            </p>
          </div>
          <div className="border border-gray-800 bg-gray-950 shadow-xl">
            <div className="flex items-center gap-3 border-gray-700 border-b bg-gray-900 px-5 py-3">
              <span className="flex gap-2">
                <span className="h-3 w-3 bg-red-500" />
                <span className="h-3 w-3 bg-yellow-500" />
                <span className="h-3 w-3 bg-green-500" />
              </span>
              <span className="text-gray-400 text-sm">doc2mcp install</span>
            </div>
            <div className="bg-black p-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {IDES.map((ide) => (
                  <div
                    className="flex items-center justify-between border border-transparent px-3 py-2 transition-all hover:border-gray-700 hover:bg-gray-900"
                    key={ide.name}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-green-400">✓</span>
                      <span className="text-white">{ide.name}</span>
                    </span>
                    <span className="hidden text-gray-500 text-xs sm:block">
                      {ide.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="border-gray-800 border-t bg-gray-950/30 px-6 py-20 lg:px-12"
        id="commands"
      >
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="mb-4 font-bold text-3xl lg:text-4xl">
            Three commands to ship
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-gray-400 text-lg">
            Authenticate, convert any docs site, and chat with the result — all
            from your terminal.
          </p>
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEP_CARDS.map((card) => (
              <div className="group relative h-full" key={card.id}>
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 transition-transform duration-300 group-hover:rotate-1" />
                <div className="relative flex h-full flex-col justify-between border border-gray-700 bg-black p-6 transition-all duration-300 group-hover:border-white">
                  <div>
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gray-600 bg-gray-900 group-hover:border-white">
                      <span className="font-mono text-lg text-white">
                        {card.step}
                      </span>
                    </div>
                    <h3 className="mb-3 font-bold text-lg text-white">
                      {card.title}
                    </h3>
                    <p className="mb-4 text-gray-400 text-sm leading-relaxed">
                      {card.desc}
                    </p>
                  </div>
                  <button
                    className="flex cursor-pointer items-center justify-between border border-gray-700 bg-gray-900 p-2.5 text-left font-mono text-xs transition-colors hover:border-gray-500"
                    onClick={() => copy(card.command, card.id)}
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-gray-500">$</span>
                      <span className="text-white">{card.command}</span>
                    </span>
                    {copied[card.id] ? (
                      <Check className="h-3 w-3 text-green-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <CopyButton
              command={INSTALL_COMMAND}
              copied={copied["cta-install"] ?? false}
              onCopy={() => copy(INSTALL_COMMAND, "cta-install")}
            />
          </div>
        </div>
      </section>

      <footer className="border-gray-800 border-t bg-gray-950 px-6 py-10 lg:px-12">
        <div className="mx-auto max-w-7xl text-center text-gray-600 text-sm">
          <p>doc2mcp CLI — paste docs, get an MCP, chat from your terminal.</p>
          <p className="mt-2 text-gray-700">
            © {new Date().getFullYear()} doc2mcp
          </p>
        </div>
      </footer>
    </div>
  );
}
