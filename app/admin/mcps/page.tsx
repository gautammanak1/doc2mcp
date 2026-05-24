import { McpsTable } from "@/components/admin/mcps-table";
import { getAllProjectsWithUser } from "@/lib/db/queries";

export default async function AdminMcpsPage() {
  const rows = await getAllProjectsWithUser(200);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl">MCP projects</h2>
        <p className="text-muted-foreground text-sm">
          All conversions · hard delete removes project and MCP servers
        </p>
      </div>
      <McpsTable
        rows={rows.map((r) => ({
          id: r.project.id,
          name: r.project.name,
          status: r.project.status,
          sourceUrl: r.project.sourceUrl,
          sourceType: r.project.sourceType,
          userEmail: r.userEmail,
          createdAt: r.project.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
