"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocNavItem } from "@/lib/docs/loader";
import { cn } from "@/lib/utils";

export function DocsSidebar({
  items,
  onNavigate,
}: {
  items: DocNavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <p className="mb-3 font-mono text-muted-foreground text-xs uppercase tracking-wider">
        Documentation
      </p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/docs" && pathname?.startsWith(`${item.href}/`));
          return (
            <Link
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
              href={item.href}
              key={item.href}
              onClick={onNavigate}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
