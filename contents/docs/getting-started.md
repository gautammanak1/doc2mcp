---
title: Getting started
description: Build your first MCP from any docs URL in under a minute.
---

# Getting started

doc2mcp is a hosted product. You do not run servers, clone repos, or manage databases.

## Sign in

Open **doc2mcp.dev**, sign in (Google / email).

## Convert documentation

1. Open the chat.
2. Click the **doc2mcp** toggle in the input.
3. Paste a documentation URL, for example:

```
https://docs.langchain.com
https://docs.stripe.com
https://platform.openai.com/docs
https://docs.anthropic.com
```

4. Hit enter. The conversion runs in the background — crawl → analyze → MCP server.
5. When ready, the result page shows your **Cursor MCP** JSON and a **project token**.

## Connect Cursor

Open **Cursor → Settings → MCP**, paste the JSON, reload MCP. Now ask Cursor anything about those docs:

- "List all documentation pages"
- "Find an example of authentication"
- "How do I stream responses?"
- "Read the page about webhooks"

Cursor will use doc2mcp's tools to read the full crawled markdown — code blocks intact.

## Server naming

The MCP server id is derived from the docs hostname:

| Docs URL | Server id |
|----------|-----------|
| `docs.langchain.com` | `langchain` |
| `docs.stripe.com` | `stripe` |
| `platform.openai.com/docs` | `openai` |
| `github.com/org/repo` | `repo` |

Each conversion gets its own URL and token — projects are isolated.

## What's next

- [API keys](/docs/api-keys) — what credentials are needed (spoiler: almost none)
- [MCP setup](/docs/mcp-setup) — full Cursor configuration walkthrough
- [Pricing](/pricing) — plans
