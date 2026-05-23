---
title: API keys
description: One token, on the result page. No third-party keys needed.
---

# API keys

doc2mcp is hosted. You do not paste any third-party API keys (Stripe, Agentverse, LangChain, etc.) into Cursor — the docs are served from doc2mcp's servers.

## What Cursor needs

Just the JSON block from the convert page:

```json
{
  "mcpServers": {
    "langchain": {
      "url": "https://doc2mcp.dev/api/mcp/<projectId>/mcp",
      "headers": {
        "Authorization": "Bearer <project-token>"
      }
    }
  }
}
```

| Field | Where to get it |
|-------|-----------------|
| `url` | Shown on the convert result page (auto-filled in the copy block). |
| `Authorization` Bearer token | Shown once on the convert result page — copy it then. |

The token only authorizes reading that specific project's crawled docs. It cannot create, modify, or read other projects.

## What you do not need

- ❌ No Stripe / OpenAI / Agentverse API key in `mcp.json`
- ❌ No Node, npm, or `npx` on the Cursor machine
- ❌ No local clone of doc2mcp
- ❌ No database, no env files
