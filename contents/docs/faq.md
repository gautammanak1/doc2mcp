---
title: FAQ
description: Common questions about doc2mcp and MCP.
category: Reference
order: 9
---

## What is MCP?

The **Model Context Protocol** is an open standard that lets AI clients (Cursor,
Claude, VS Code, Windsurf, OpenAI Agents) call external tools and data sources
over a uniform JSON-RPC interface. A doc2mcp server is an MCP server whose tools
read your documentation.

## Why not build an MCP server manually?

You can — but crawling many doc formats, chunking for good retrieval, hosting,
securing tokens, and keeping the index fresh is a real, repeated engineering
effort. doc2mcp does it as managed infrastructure. See
[Why doc2mcp?](/docs/why-doc2mcp).

## How often is documentation updated?

The index reflects the docs at crawl time. Re-run a conversion (or sync) when the
source changes to refresh it. There is no automatic drift — a converted project
is a snapshot until you re-crawl.

## Which AI tools are supported?

Any MCP-compatible client: Cursor, Claude Desktop, VS Code, Windsurf, and the
OpenAI Agents SDK. The same endpoint and token work everywhere. See
[Agent compatibility](/docs/agent-compatibility).

## How does retrieval work?

doc2mcp splits pages into heading-aware sections, then ranks them per query and
returns the best sections with breadcrumbs and source URLs. `ask_documentation`
synthesizes a cited answer from the top sections. See
[Retrieval layer](/docs/retrieval).

## Do I need API keys for the source docs?

No. doc2mcp reads public documentation directly. The only credential you handle
is the per-project Bearer token doc2mcp issues. See [Authentication](/docs/api-authentication).

## Is my token secret?

Yes — treat it like a read-only API key. Anyone with the URL + token can read
that project's crawled docs. Rotate by re-running the conversion.

## Can I convert private/internal docs?

Yes, as long as the docs URL is reachable when the crawl runs. See
[Convert private documentation](/docs/private-docs).
