import { DocsMobileNav } from "@/components/docs/docs-mobile-nav";
import { getDocNav } from "@/lib/docs/loader";

export async function DocsMobileNavLoader() {
  const nav = await getDocNav();
  return <DocsMobileNav items={nav} />;
}
