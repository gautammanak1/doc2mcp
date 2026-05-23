<div align="center">

# doc2mcp

**Paste any docs URL. Get a Cursor-ready MCP server in seconds.**

No install, no API keys to share, no local clone. Powered by ASI1.

[Live](https://doc2mcp.dev) · [Docs](https://doc2mcp.dev/docs) · [Pricing](https://doc2mcp.dev/pricing)

</div>

---

## What it does

doc2mcp turns any documentation site into a hosted **Model Context Protocol (MCP)** server that AI clients like Cursor, Claude Desktop, and Windsurf can read in real time.

1. Paste a docs URL — LangChain, Stripe, your own — in the chat with the **doc2mcp** toggle on.
2. The server crawls the site (Mintlify, Docusaurus, OpenAPI JSON/YAML, GitHub repos, plain HTML), preserving code blocks and chunking by heading.
3. You get a remote MCP URL + Bearer token. Paste it into Cursor's `mcp.json` and reload.
4. Ask Cursor anything about those docs.

```json
{
  "mcpServers": {
    "stripe": {
      "url": "https://doc2mcp.dev/api/mcp/<projectId>/mcp",
      "headers": {
        "Authorization": "Bearer <project-token>"
      }
    }
  }
}
```

## MCP tools

| Tool | What it does |
|------|--------------|
| `list_documentation_pages` | Every crawled page (title, url, id) |
| `get_documentation_page` | Full markdown of one page |
| `search_documentation` | Heading-aware section search (BM25-ish scoring) |
| `get_documentation_overview` | Summary + `llms.txt` index |
| `read_full_documentation` | All pages combined as one big markdown |
| `ask_documentation` | Natural-language Q&A using ASI1 with citations |

## Supported source formats

- **Mintlify** docs (LangChain, Anthropic, Stripe, etc.) — uses `llms.txt` + `.md` source
- **Docusaurus / GitBook / Nextra** — HTML crawl with code-preserving extraction
- **OpenAPI JSON + YAML** — expanded into one page per endpoint (request, params, responses)
- **Postman collections**
- **GitHub repositories** — full repo tree, `README.md`, `/docs`, `/examples`, `/guides`
- **Raw `.md` / `.mdx`** URLs
- **Plain HTML** — with Jina Reader fallback for SPA-rendered docs

## Architecture

- **Next.js 16** App Router + Cache Components + Turbopack
- **ASI1** for crawling analysis, tool compression, and `ask_documentation`
- **Supabase Postgres** for project storage, sessions, chunks
- **Streamable HTTP MCP** (JSON-RPC 2.0) at `/api/mcp/<projectId>/mcp` — no stdio
- **Heading-aware chunker** + BM25-like search
- **Web search providers** (optional) — Tavily / Brave / Exa to enrich thin SPA pages
- **Jina Reader** (free) — fallback for JavaScript-rendered docs

## Local development

```bash
git clone https://github.com/gautammanak1/doc2mcp.git
cd doc2mcp
pnpm install
cp .env.example .env.local
# fill ASI_ONE_API_KEY, AUTH_SECRET, POSTGRES_URL, Supabase keys
pnpm db:migrate
pnpm dev
```

Open <http://localhost:3000>.

### Required env vars

```env
AUTH_SECRET=...                 # openssl rand -base64 32
ASI_ONE_API_KEY=...             # https://api.asi1.ai

# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
POSTGRES_URL=...                # Supabase pooler URI

# Optional — improves crawl quality for SPA / sparse docs
TAVILY_API_KEY=
BRAVE_SEARCH_API_KEY=
EXA_API_KEY=
JINA_API_KEY=
FIRECRAWL_API_KEY=
```

## Deploy to Vercel

1. Fork / clone this repo, push to your GitHub.
2. Import the repo at <https://vercel.com/new>.
3. Add the env vars above in **Settings → Environment Variables**.
4. Deploy. doc2mcp runs on Vercel Functions out of the box.

Set `NEXT_PUBLIC_APP_URL` to your deployed domain so generated MCP configs point at the right host.

## Stack

| | |
|---|---|
| Framework | Next.js 16, React 19, Turbopack |
| AI | ASI1 (`asi1-mini` by default) |
| Database | Supabase Postgres |
| Auth | NextAuth 5 (credentials + guest) |
| UI | Tailwind v4, shadcn/ui, Framer Motion, Streamdown |
| Lint | Ultracite (Biome) |
| MCP SDK | `@modelcontextprotocol/sdk` |

## CI

Single GitHub Actions workflow ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs on every push and PR:

- TypeScript type-check (`tsc --noEmit --skipLibCheck`)
- Ultracite / Biome lint (`pnpm check`)
- Next.js production build (`pnpm exec next build`)

Hosting is on Vercel — preview deploys per branch, production on `main`.

## License

Apache 2.0
