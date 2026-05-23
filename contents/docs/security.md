---
title: Security
description: Authentication, token handling, and data isolation in doc2mcp.
---

# Security

## Identity and access

```mermaid
flowchart LR
  visitor[Visitor]
  guest["Guest session (NextAuth)"]
  user[Registered user]
  convert["/api/convert"]
  chat[Chat /chat]
  mcp["/api/mcp/projectId/mcp"]

  visitor -->|/| guest
  guest -->|sign in| user
  guest --x convert
  guest -->|read-only| chat
  user --> convert
  user --> chat
  user -->|copy token| mcp
```

| Role | Read public docs | Use chat | Generate MCP | Hit MCP endpoint |
|------|------------------|----------|--------------|------------------|
| Guest | yes | yes | no (401) | no (token required) |
| Authenticated | yes | yes | yes | yes |

Guest creation flow uses `/api/auth/guest?redirectUrl=...` to avoid client-side `signIn()` CSRF.

## MCP token isolation

```mermaid
flowchart TD
  convert[POST /api/convert]
  token["Mint random 24-byte URL-safe token (d2mcp_...)"]
  hash["SHA-256 stored in PlatformProject.artifacts.mcpTokenHash"]
  cursor[Cursor MCP config]
  request[Bearer request]
  verify["constant-time compare"]

  convert --> token
  token --> hash
  token -->|shown ONCE on result page| cursor
  cursor --> request
  request --> verify
  verify -->|match| serve[Serve only this project's pages]
  verify -->|mismatch| deny[401 unauthorized]
```

Properties:

- Tokens are minted with `randomBytes(24).toString("base64url")`.
- Only the SHA-256 hash is stored — the raw token is shown once on the convert result page.
- A token is scoped to a single project; it cannot read any other project, even on the same account.
- Anyone with the URL + token can read that project's crawled docs. Treat the token like a read-only API key.
- Tokens can be rotated by deleting the project and re-running the conversion.

## What leaves your machine

```mermaid
flowchart LR
  browser[Browser]
  api[doc2mcp API on Vercel]
  asi1[ASI1 / api.asi1.ai]
  jina[Jina Reader]
  tavily[Tavily / Brave / Exa]
  source[Source docs site]
  db[(Supabase Postgres)]

  browser -->|HTTPS| api
  api -->|crawl pages| source
  api -->|enrich via web search if configured| tavily
  api -->|render JS docs if configured| jina
  api -->|generate tools + ask answers| asi1
  api -->|read + write project data| db
```

| Outbound destination | When | Data sent |
|----------------------|------|-----------|
| Source docs origin | On convert + re-crawl | Plain GET requests |
| Jina Reader | When HTML is thin | The page URL only |
| Tavily / Brave / Exa | When llms.txt absent or chunks are thin | Search query + site filter |
| ASI1 | During analyze + ask_documentation | Doc excerpts and user question |
| Supabase | Always | Project metadata, artifacts, chunks |

Web search and Jina are **optional**. With no keys set, only Source docs, ASI1, and Supabase are contacted.

## Headers and proxy

- `proxy.ts` gates everything except the public-by-design routes: `/`, `/login`, `/register`, `/api/auth`, `/ping`, `/chat`, `/docs`, `/api/mcp`.
- `/api/mcp/[projectId]/mcp` accepts the Bearer token via `Authorization`, falls back to `X-Doc2MCP-Token`, then to a `?token=` query param for clients that cannot set headers.
- Guest sessions are cookie-only, signed with `AUTH_SECRET`.

## Reporting

Found a security issue? Email security@doc2mcp.dev. Please do not file a public GitHub issue.
