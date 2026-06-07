---
title: Playground
nav_title: Playground
description: Generate an MCP from any docs URL in the browser, then grab the CLI or editor config in one click.
category: Getting Started
order: 6
---

## Overview

The [Playground](/playground) is the fastest visual way to try doc2mcp. Paste a
documentation URL, press **Send**, and the agent runs the full pipeline
(`crawl → analyze → generate`) into a hosted, token-secured MCP server your
editor can call.

It mirrors the [CLI](/docs/quickstart) and the in-app chat — same pipeline, same
plan limits, same marketplace listing when the project is `ready`.

## Using the playground

1. Open [doc2mcp.site/playground](/playground).
2. Type or paste a documentation URL into the prompt box:

```text
https://docs.stripe.com
https://docs.anthropic.com
https://platform.openai.com/docs
```

3. Press **Send** (or `Enter`). You are redirected to the convert page which
   streams live progress until the project reaches `ready`.
4. Copy the endpoint URL and bearer token from the result page, or connect a
   client directly.

> **Note** A documentation URL is required for **Send**. Free-form prompts
> without a URL prompt you for one.

## Get Code Snippet

The **Get Code Snippet** button opens the same conversion as copy-paste code,
without leaving the page:

- **CLI** — install and run the terminal client:

```bash
npm install -g doc2mcp
doc2mcp login
doc2mcp https://docs.example.com
```

- **Editor config** — the `mcp.json` shape for Cursor, VS Code, and Windsurf:

```json
{
  "mcpServers": {
    "doc2mcp": {
      "url": "https://doc2mcp.site/api/mcp/<projectId>/mcp",
      "headers": { "Authorization": "Bearer <project-token>" }
    }
  }
}
```

## Authentication and limits

- Generating an MCP requires a signed-in (non-guest) account. The playground
  redirects to sign-in when needed and returns you afterwards.
- Conversions count against your plan's monthly limit (free includes 5/month),
  shared across the playground, CLI, and chat.

## Next

- [Quick start](/docs/quickstart)
- [Connect to Cursor](/docs/connect-cursor)
- [Connect to Claude Desktop](/docs/connect-claude)
