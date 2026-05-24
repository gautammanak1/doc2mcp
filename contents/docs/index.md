---
title: doc2mcp
description: Paste any docs URL. Get a Cursor-ready MCP server. No install, no clone, no third-party API keys.
---

# doc2mcp

![doc2mcp social preview](/og-image.png)

doc2mcp turns any documentation site into a hosted MCP (Model Context Protocol) server that Cursor, Claude Desktop, Windsurf, and other AI clients can read.

## How it works

1. Open the **chat**, flip the **doc2mcp** toggle, paste a docs URL.
2. doc2mcp crawls the site (Mintlify, Docusaurus, GitBook, OpenAPI, GitHub raw markdown — all supported), preserves code blocks, and indexes everything.
3. You get a **remote URL + Bearer token**. Paste the JSON into Cursor and reload. Done.

No local install, no `npx`, no API keys for the original docs vendor.

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

## What your AI can do

The generated MCP exposes these tools to Cursor:

- `list_documentation_pages` — every crawled page
- `get_documentation_page` — full text of a page
- `search_documentation` — keyword search
- `read_full_documentation` — all pages in one markdown blob
- `ask_documentation` — natural-language Q&A with citations

## Next

- [Getting started](/docs/getting-started)
- [API keys explained](/docs/api-keys)
- [MCP setup in Cursor](/docs/mcp-setup)
- [Pipeline details](/docs/convert-flow)
