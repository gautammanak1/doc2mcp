import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { cacheLife } from "next/cache";

const DOCS_ROOT = path.join(process.cwd(), "contents", "docs");

export type DocPage = {
  slug: string[];
  title: string;
  description: string;
  content: string;
};

export type DocNavItem = {
  slug: string[];
  title: string;
  href: string;
};

function parseFrontmatter(raw: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: raw };
  }

  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      meta[key] = value;
    }
  }

  return { meta, body: match[2].trim() };
}

function slugFromFilename(filename: string): string[] {
  const base = filename.replace(/\.md$/, "");
  if (base === "index") {
    return [];
  }
  return base.split("/");
}

export async function getDocNav(): Promise<DocNavItem[]> {
  "use cache";
  cacheLife("max");

  const entries = await readdir(DOCS_ROOT, { withFileTypes: true });
  const items: DocNavItem[] = [];

  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    const raw = await readFile(path.join(DOCS_ROOT, entry.name), "utf8");
    const { meta } = parseFrontmatter(raw);
    const slug = slugFromFilename(entry.name);
    const href = slug.length === 0 ? "/docs" : `/docs/${slug.join("/")}`;

    items.push({
      slug,
      title: meta.title ?? slug.at(-1) ?? "Overview",
      href,
    });
  }

  const order = [
    "index",
    "getting-started",
    "api-keys",
    "mcp-setup",
    "convert-flow",
    "workflow",
    "security",
    "acceptable-use",
    "terms",
    "privacy",
  ];

  return items.sort((a, b) => {
    const aKey = a.slug.at(-1) ?? "index";
    const bKey = b.slug.at(-1) ?? "index";
    return order.indexOf(aKey) - order.indexOf(bKey);
  });
}

export async function getDocPage(slug: string[]): Promise<DocPage | null> {
  "use cache";
  cacheLife("max");

  const filename =
    slug.length === 0 ? "index.md" : `${slug.join("/")}.md`;
  const filePath = path.join(DOCS_ROOT, filename);

  try {
    const raw = await readFile(filePath, "utf8");
    const { meta, body } = parseFrontmatter(raw);

    return {
      slug,
      title: meta.title ?? "Documentation",
      description: meta.description ?? "",
      content: body,
    };
  } catch {
    return null;
  }
}
