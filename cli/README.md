# doc2mcp CLI

Generate documentation MCP servers from your terminal.

## Install

```bash
npm install -g doc2mcp
```

## Quick start

```bash
# 1. Authorize (opens browser)
doc2mcp login

# 2. Convert docs → MCP (same pipeline as the website)
doc2mcp https://docs.example.com

# 3. Follow the install prompt for Cursor, VS Code, Claude, or Windsurf
```

## Commands

| Command | Description |
| --- | --- |
| `doc2mcp login` | Browser device authorization |
| `doc2mcp logout` | Remove stored credentials |
| `doc2mcp whoami` | Show logged-in user |
| `doc2mcp list` | List your MCP projects |
| `doc2mcp install <id>` | Install a ready MCP into editors |
| `doc2mcp <docs-url>` | Create MCP from documentation URL |

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `DOC2MCP_API_URL` | `https://doc2mcp.com` | API base URL (use for local dev) |

Config is stored at `~/.doc2mcp/config.json`.

## Local development

```bash
cd cli
pnpm install
pnpm build
node dist/index.js --help

# Point at local Next app
DOC2MCP_API_URL=http://localhost:3000 node dist/index.js login
```

## Publish

```bash
cd cli
pnpm build
npm publish --access public
```

Ensure the npm package name `doc2mcp` is available before publishing.
