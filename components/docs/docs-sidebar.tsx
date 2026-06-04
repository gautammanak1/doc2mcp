"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { DocNavGroup } from "@/lib/docs/loader";
import { cn } from "@/lib/utils";

export function DocsSidebar({
  groups,
  onNavigate,
}: {
  groups: DocNavGroup[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="w-full">
      <nav className="flex flex-col gap-6">
        {groups.map((group) => (
          <div key={group.category}>
            <p className="mb-2 px-3 font-mono text-[11px] text-muted-foreground/70 uppercase tracking-wider">
              {group.category}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/docs" &&
                    pathname?.startsWith(`${item.href}/`));
                return (
                  <Link
                    className={cn(
                      "relative rounded-lg px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={onNavigate}
                  >
                    {isActive ? (
                      <span className="absolute top-1.5 bottom-1.5 left-0 w-0.5 rounded-full bg-primary" />
                    ) : null}
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
