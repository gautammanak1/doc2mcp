import Link from "next/link";
import type { DocNavItem } from "@/lib/docs/loader";

export function DocsSidebar({ items }: { items: DocNavItem[] }) {
  return (
    <aside className="w-full shrink-0 lg:w-56">
      <p className="mb-3 font-mono text-muted-foreground text-xs uppercase tracking-wider">
        Documentation
      </p>
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            className="rounded-lg px-3 py-2 text-muted-foreground text-sm transition-colors hover:bg-white/5 hover:text-foreground"
            href={item.href}
            key={item.href}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
