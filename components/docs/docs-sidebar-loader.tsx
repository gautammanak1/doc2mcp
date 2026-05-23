import { DocsSidebar } from "@/components/docs/docs-sidebar";
import { getDocNav } from "@/lib/docs/loader";

export async function DocsSidebarLoader() {
  const nav = await getDocNav();
  return <DocsSidebar items={nav} />;
}
