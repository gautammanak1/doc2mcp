# `mcp-registry/` — Staging for `github.com/doc2mcp/doc2mcp`

This folder is **NOT used by the deployed application**. It contains the
exact files that need to live in the separate
[`doc2mcp/doc2mcp`](https://github.com/doc2mcp/doc2mcp) GitHub-organization
repo, which exists only to publish the doc2mcp remote MCP server to the
official [MCP Registry](https://registry.modelcontextprotocol.io).

## Why two repos?

| Repo                     | Purpose                                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------------------ |
| `gautammanak1/doc2mcp`   | The Next.js code base. Vercel deploys this to https://doc2mcp.site.                              |
| `doc2mcp/doc2mcp`        | A tiny repo with just `server.json` + the publish workflow. Owns the `io.github.doc2mcp/*` MCP Registry namespace via GitHub OIDC. |

The split is required by the MCP Registry's GitHub OIDC auth: the OIDC
token issued to a workflow claims the repo owner, and the registry only
allows publishing under `io.github.<owner>/*`. To own the
`io.github.doc2mcp/doc2mcp` name, the publishing workflow MUST run from a
repo inside the `doc2mcp` GitHub org.

## What to do with this folder

1. Create the `doc2mcp` org on GitHub (if it doesn't exist) and add an
   empty `doc2mcp/doc2mcp` repo inside it.

2. Copy the contents of THIS folder (not the folder itself) into the new
   repo:

   ```bash
   git clone git@github.com:doc2mcp/doc2mcp.git ../doc2mcp-registry
   cp -R mcp-registry/. ../doc2mcp-registry/
   cd ../doc2mcp-registry
   rm README.md                  # this file is for the code-base author
   git add server.json .github
   git commit -m "chore: bootstrap MCP Registry publish workflow"
   git push origin main
   ```

3. Cut the first release by pushing a tag:

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

   The workflow runs `mcp-publisher login github-oidc` and
   `mcp-publisher publish`, which registers the server at
   `io.github.doc2mcp/doc2mcp` and points clients at
   `https://doc2mcp.site/api/mcp/{project_id}/mcp`.

## Keeping the two repos in sync

The `server.json` here is the source of truth for whatever the **live
deployment** exposes (URL template, headers, remote type). When the
endpoint contract changes, update `mcp-registry/server.json` in this
code base, then copy the diff over to the registry repo and tag a new
release. Versions in `server.json` are auto-set from the git tag inside
the workflow, so you only need to bump version numbers via tags.
