#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import path from "node:path";

function isGlobalInstall() {
  return (
    process.env.npm_config_global === "true" ||
    process.env.npm_config_location === "global"
  );
}

function npmGlobalBin() {
  try {
    const prefix = execFileSync("npm", ["prefix", "-g"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return path.join(prefix, "bin");
  } catch {
    return "";
  }
}

if (isGlobalInstall()) {
  const binDir = npmGlobalBin();
  const pathEntries = (process.env.PATH || "").split(path.delimiter);
  if (binDir && !pathEntries.includes(binDir)) {
    process.stdout.write(`
doc2mcp installed, but npm's global bin is not on your PATH.

Run this once for zsh:
  echo 'export PATH="${binDir}:$PATH"' >> ~/.zshrc
  source ~/.zshrc

Then try:
  doc2mcp login

Quick alternative (no PATH setup):
  npx doc2mcp login

For pnpm global installs, run:
  pnpm setup
  source ~/.zshrc

`);
  }
}
