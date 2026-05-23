---
title: Workflow
description: End-to-end flow from pasted URL to a live MCP server in Cursor.
---

# Workflow

## High-level flow

```mermaid
flowchart LR
  user[User]
  chat[doc2mcp chat]
  api["POST /api/convert"]
  bg[Background pipeline]
  db[(Supabase Postgres)]
  mcp["GET/POST /api/mcp/projectId/mcp"]
  cursor[Cursor / Claude / Windsurf]

  user -->|paste docs URL| chat
  chat -->|doc2mcp toggle ON| api
  api -->|create project + token| db
  api -.->|after| bg
  bg -->|crawl, chunk, index| db
  user -->|copy URL + Bearer| cursor
  cursor -->|JSON-RPC tools/call| mcp
  mcp -->|read pages + chunks| db
  mcp -->|JSON-RPC reply| cursor
```

## Pipeline stages

```mermaid
flowchart TD
  start([Paste URL])
  norm[Normalize URL: docs.* fallback]
  manifest{llms.txt available?}
  llms[Read llms.txt manifest]
  websearch[Tavily / Brave web search]
  fetch[Fetch each page: .md, .mdx, then HTML, then Jina Reader]
  block{Marketing path?}
  drop[Drop page]
  chunk[Heading-aware chunking]
  ai[ASI1 analyze + compress]
  build[Mint project token + write artifacts]
  ready([Ready in Cursor])

  start --> norm --> manifest
  manifest -- yes --> llms --> fetch
  manifest -- no --> websearch --> fetch
  fetch --> block
  block -- yes --> drop
  block -- no --> chunk --> ai --> build --> ready
```

## CI / CD

```mermaid
flowchart LR
  push[git push]
  lint["Lint workflow (.github/workflows/lint.yml)"]
  e2e["Playwright workflow (.github/workflows/playwright.yml)"]
  vercel[Vercel preview]
  promo[Promote to production]

  push --> lint
  push --> e2e
  push --> vercel
  lint -->|all green| promo
  e2e -->|all green| promo
  vercel -->|approved| promo
```

| Job | What runs | Failures block merge? |
|-----|-----------|-----------------------|
| `lint` | `tsc --noEmit` + `pnpm check` (Biome/Ultracite) | Yes |
| `e2e` | Playwright against built app | Yes |
| Vercel preview | `next build` + deploy | Yes |

## Conversion phases (status field)

```mermaid
stateDiagram-v2
  [*] --> pending
  pending --> crawling: start
  crawling --> analyzing: pages fetched
  analyzing --> generating: ASI1 returns
  generating --> ready: artifacts written
  generating --> error: ASI1 or crawler error
  crawling --> error: 0 pages
  ready --> [*]
  error --> [*]
```

The status drives the convert page UI (`/convert/<id>`). Each transition is written to Postgres so resuming or polling just reads the row.
