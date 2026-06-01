"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    title: "Universal docs crawler",
    description:
      "Mintlify, Docusaurus, Swagger, GitBook, GitHub raw markdown, plain HTML — code blocks always preserved.",
    visual: "deploy",
  },
  {
    number: "02",
    title: "AI-native tools",
    description:
      "ASI1 reads the docs and exposes search, page lookup, full read, and natural-language Q&A — not raw REST.",
    visual: "ai",
  },
  {
    number: "03",
    title: "Hosted remote MCP",
    description:
      "No npx, no local clone. Cursor connects with a URL + Bearer token. Same JSON works in Claude Desktop and Windsurf.",
    visual: "collab",
  },
  {
    number: "04",
    title: "Chat the docs first",
    description:
      "Built-in chat lets you ask your docs anything before wiring up the MCP. Switch doc2mcp mode and paste a URL.",
    visual: "security",
  },
];

function DeployVisual() {
  return (
    <svg className="w-full h-full" viewBox="0 0 200 160">
      <defs>
        <clipPath id="deployClip">
          <rect height="120" rx="4" width="140" x="30" y="20" />
        </clipPath>
      </defs>

      {/* Container */}
      <rect
        fill="none"
        height="120"
        rx="4"
        stroke="currentColor"
        strokeWidth="2"
        width="140"
        x="30"
        y="20"
      />

      {/* Animated bars */}
      <g clipPath="url(#deployClip)">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect
            fill="currentColor"
            height="10"
            key={i}
            opacity="0.15"
            rx="2"
            width="120"
            x="40"
            y={35 + i * 16}
          >
            <animate
              attributeName="opacity"
              begin={`${i * 0.15}s`}
              dur="2s"
              repeatCount="indefinite"
              values="0.15;0.8;0.15"
            />
            <animate
              attributeName="width"
              begin={`${i * 0.15}s`}
              dur="2s"
              repeatCount="indefinite"
              values="20;120;20"
            />
          </rect>
        ))}
      </g>

      {/* Progress indicator */}
      <circle cx="100" cy="155" fill="currentColor" opacity="0.3" r="3">
        <animate
          attributeName="opacity"
          dur="1s"
          repeatCount="indefinite"
          values="0.3;1;0.3"
        />
      </circle>
    </svg>
  );
}

/** Fixed coords — Math.cos/sin differ slightly between SSR and client. */
const AI_ORBIT_NODES = [
  { x2: 150, y2: 80 },
  { x2: 125, y2: 123.3 },
  { x2: 75, y2: 123.3 },
  { x2: 50, y2: 80 },
  { x2: 75, y2: 36.7 },
  { x2: 125, y2: 36.7 },
] as const;

function AIVisual() {
  return (
    <svg className="w-full h-full" viewBox="0 0 200 160">
      {/* Central node */}
      <circle cx="100" cy="80" fill="currentColor" r="12">
        <animate
          attributeName="r"
          dur="2s"
          repeatCount="indefinite"
          values="12;14;12"
        />
      </circle>

      {/* Orbiting nodes */}
      {AI_ORBIT_NODES.map((node, i) => (
        <g key={`${node.x2}-${node.y2}`}>
          {/* Connection line */}
          <line
            opacity="0.3"
            stroke="currentColor"
            strokeWidth="1"
            x1="100"
            x2={node.x2}
            y1="80"
            y2={node.y2}
          >
            <animate
              attributeName="opacity"
              begin={`${i * 0.3}s`}
              dur="2s"
              repeatCount="indefinite"
              values="0.3;0.8;0.3"
            />
          </line>

          {/* Outer node */}
          <circle
            cx={node.x2}
            cy={node.y2}
            fill="none"
            r="6"
            stroke="currentColor"
            strokeWidth="2"
          >
            <animate
              attributeName="r"
              begin={`${i * 0.3}s`}
              dur="2s"
              repeatCount="indefinite"
              values="6;8;6"
            />
          </circle>
        </g>
      ))}

      {/* Pulse rings */}
      <circle
        cx="100"
        cy="80"
        fill="none"
        opacity="0"
        r="30"
        stroke="currentColor"
        strokeWidth="1"
      >
        <animate
          attributeName="r"
          dur="2s"
          repeatCount="indefinite"
          values="20;60"
        />
        <animate
          attributeName="opacity"
          dur="2s"
          repeatCount="indefinite"
          values="0.5;0"
        />
      </circle>
    </svg>
  );
}

function CollabVisual() {
  return (
    <svg className="w-full h-full" viewBox="0 0 200 160">
      {/* User A */}
      <g>
        <rect
          fill="none"
          height="60"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          width="50"
          x="30"
          y="50"
        />
        <text
          fill="currentColor"
          fontFamily="monospace"
          fontSize="20"
          textAnchor="middle"
          x="55"
          y="85"
        >
          A
        </text>
        <circle
          cx="55"
          cy="35"
          fill="none"
          r="12"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>

      {/* User B */}
      <g>
        <rect
          fill="none"
          height="60"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
          width="50"
          x="120"
          y="50"
        />
        <text
          fill="currentColor"
          fontFamily="monospace"
          fontSize="20"
          textAnchor="middle"
          x="145"
          y="85"
        >
          B
        </text>
        <circle
          cx="145"
          cy="35"
          fill="none"
          r="12"
          stroke="currentColor"
          strokeWidth="2"
        />
      </g>

      {/* Connection */}
      <line
        stroke="currentColor"
        strokeDasharray="4 4"
        strokeWidth="2"
        x1="80"
        x2="120"
        y1="80"
        y2="80"
      >
        <animate
          attributeName="stroke-dashoffset"
          dur="0.5s"
          repeatCount="indefinite"
          values="0;-8"
        />
      </line>

      {/* Data packet */}
      <circle fill="currentColor" r="4">
        <animateMotion dur="1.5s" repeatCount="indefinite">
          <mpath href="#dataPath" />
        </animateMotion>
      </circle>
      <path d="M 80 80 L 120 80" fill="none" id="dataPath" />

      {/* Sync indicator */}
      <g transform="translate(100, 130)">
        <circle fill="none" r="6" stroke="currentColor" strokeWidth="2">
          <animate
            attributeName="r"
            dur="1s"
            repeatCount="indefinite"
            values="6;10;6"
          />
          <animate
            attributeName="opacity"
            dur="1s"
            repeatCount="indefinite"
            values="1;0.3;1"
          />
        </circle>
      </g>
    </svg>
  );
}

function SecurityVisual() {
  return (
    <svg className="w-full h-full" viewBox="0 0 200 160">
      {/* Shield */}
      <path
        d="M 100 20 L 150 40 L 150 90 Q 150 130 100 145 Q 50 130 50 90 L 50 40 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />

      {/* Inner shield */}
      <path
        d="M 100 35 L 135 50 L 135 85 Q 135 115 100 128 Q 65 115 65 85 L 65 50 Z"
        fill="currentColor"
        opacity="0.1"
      >
        <animate
          attributeName="opacity"
          dur="2s"
          repeatCount="indefinite"
          values="0.1;0.2;0.1"
        />
      </path>

      {/* Lock icon */}
      <rect fill="currentColor" height="25" rx="3" width="30" x="85" y="70" />
      <path
        d="M 90 70 L 90 60 Q 90 50 100 50 Q 110 50 110 60 L 110 70"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />

      {/* Keyhole */}
      <circle cx="100" cy="80" fill="white" r="4" />
      <rect fill="white" height="8" width="4" x="98" y="82" />

      {/* Scan lines */}
      <line
        opacity="0"
        stroke="currentColor"
        strokeWidth="1"
        x1="60"
        x2="140"
        y1="60"
        y2="60"
      >
        <animate
          attributeName="y1"
          dur="3s"
          repeatCount="indefinite"
          values="40;120;40"
        />
        <animate
          attributeName="y2"
          dur="3s"
          repeatCount="indefinite"
          values="40;120;40"
        />
        <animate
          attributeName="opacity"
          dur="3s"
          repeatCount="indefinite"
          values="0;0.5;0"
        />
      </line>
    </svg>
  );
}

function AnimatedVisual({ type }: { type: string }) {
  switch (type) {
    case "deploy":
      return <DeployVisual />;
    case "ai":
      return <AIVisual />;
    case "collab":
      return <CollabVisual />;
    case "security":
      return <SecurityVisual />;
    default:
      return <DeployVisual />;
  }
}

function FeatureCard({
  feature,
  index,
}: {
  feature: (typeof features)[0];
  index: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`group relative transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      ref={cardRef}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col gap-6 border-b border-foreground/10 py-8 sm:gap-8 sm:py-12 lg:flex-row lg:gap-16 lg:py-20">
        <div className="shrink-0">
          <span className="font-mono text-sm text-muted-foreground">
            {feature.number}
          </span>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="mb-3 font-display text-2xl group-hover:translate-x-2 transition-transform duration-500 sm:mb-4 sm:text-3xl lg:text-4xl">
              {feature.title}
            </h3>
            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              {feature.description}
            </p>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="h-36 w-full max-w-[12rem] text-foreground sm:h-40 sm:max-w-[14rem]">
              <AnimatedVisual type={feature.visual} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturesSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <section
      className="relative py-16 sm:py-24 lg:py-32"
      id="features"
      ref={sectionRef}
    >
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12">
        {/* Header */}
        <div className="mb-12 max-w-3xl sm:mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Capabilities
          </span>
          <h2
            className={`font-display text-3xl tracking-tight transition-all duration-700 sm:text-4xl lg:text-6xl ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Everything you need.
            <br />
            <span className="text-muted-foreground">
              Nothing you don&apos;t.
            </span>
          </h2>
        </div>

        {/* Features List */}
        <div>
          {features.map((feature, index) => (
            <FeatureCard feature={feature} index={index} key={feature.number} />
          ))}
        </div>
      </div>
    </section>
  );
}
