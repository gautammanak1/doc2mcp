'use client'

import { startTransition, useEffect, useState } from 'react'
import Link from 'next/link'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { AnimatedSphere } from './animated-sphere'

const words = ['crawl', 'compress', 'generate', 'ship']

const marqueeStats = [
  { value: '<60s', label: 'docs to MCP', company: 'PIPELINE' },
  { value: '1 URL', label: 'paste & go', company: 'INPUT' },
  { value: 'No install', label: 'remote MCP', company: 'HOSTED' },
  { value: 'Cursor', label: 'ready config', company: 'EXPORT' }
]

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [wordIndex, setWordIndex] = useState(0)

  useEffect(() => {
    startTransition(() => setIsVisible(true))
    const interval = setInterval(
      () => setWordIndex(prev => (prev + 1) % words.length),
      2500
    )
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative overflow-hidden pt-24 sm:pt-28 lg:pt-32">
      <div className="pointer-events-none absolute right-[-25%] top-1/2 hidden size-[480px] -translate-y-1/2 opacity-25 md:block lg:right-[-10%] lg:size-[640px] lg:opacity-35">
        <AnimatedSphere />
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.07]">
        {[...Array(8)].map((_, i) => (
          <div
            className="absolute right-0 left-0 h-px bg-foreground"
            key={`h-${i}`}
            style={{ top: `${12.5 * (i + 1)}%` }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto w-full max-w-[1280px] px-6 pb-20 lg:px-12 lg:pb-28">
        <div
          className={`mb-8 transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <span className="inline-flex items-center gap-3 rounded-full border border-border/50 bg-card/40 px-4 py-1.5 font-mono text-[11px] text-muted-foreground backdrop-blur-xl sm:text-xs">
            <span className="size-1.5 rounded-full bg-violet-400" />
            docs URL → MCP server · powered by ASI1
          </span>
        </div>

        <h1
          className={`max-w-[12ch] font-display text-[clamp(2.75rem,9vw,8.5rem)] leading-[0.95] tracking-tight transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}
        >
          <span className="block">Paste docs.</span>
          <span className="block">
            Get{' '}
            <span className="relative inline-block">
              <span className="inline-flex" key={wordIndex}>
                {words[wordIndex].split('').map((char, i) => (
                  <span
                    className="animate-char-in inline-block"
                    key={`${wordIndex}-${i}`}
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    {char}
                  </span>
                ))}
              </span>
              <span className="absolute -bottom-1 right-0 left-0 h-2 bg-violet-500/30 sm:-bottom-2 sm:h-3" />
            </span>
          </span>
        </h1>

        <p
          className={`mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground transition-all delay-200 duration-700 sm:text-lg lg:text-xl ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          Paste any docs URL — LangChain, Stripe, your own — and get a hosted
          MCP server Cursor can read in seconds. No install, no API keys to
          share.
        </p>

        <div
          className={`mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 transition-all delay-300 duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
        >
          <Button
            asChild
            className="group h-12 rounded-full bg-foreground px-7 text-background hover:bg-foreground/90"
            size="lg"
          >
            <Link href="/chat">
              Open chat
              <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
          <Button
            asChild
            className="h-12 rounded-full border-foreground/20 px-7 hover:bg-foreground/5"
            size="lg"
            variant="outline"
          >
            <Link href="/pricing">See pricing</Link>
          </Button>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {marqueeStats.map(stat => (
            <div
              className="rounded-xl border border-border/40 bg-card/30 px-4 py-4 backdrop-blur-xl"
              key={stat.company}
            >
              <p className="font-display font-semibold text-2xl tracking-tight sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">{stat.label}</p>
              <p className="mt-3 font-mono text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                {stat.company}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
