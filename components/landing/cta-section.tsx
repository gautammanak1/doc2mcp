'use client'

import Link from 'next/link'

import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function CtaSection() {
  return (
    <section className="border-t border-border/40 py-16 sm:py-24">
      <div className="mx-auto max-w-[800px] px-4 text-center sm:px-6 lg:px-12">
        <h2 className="font-display text-3xl tracking-tight md:text-4xl">
          Stop hand-feeding your AI.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Paste a docs URL. Get a Cursor-ready MCP server. Free to try.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="rounded-full gap-2">
            <Link href="/chat">
              Open app
              <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full">
            <Link href="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
