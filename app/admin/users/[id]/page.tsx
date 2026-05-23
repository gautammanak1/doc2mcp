"use server";

import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getUser, getUserProjects } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  // This is a simplified version - in real app you'd query by ID
  // For now, we'll show a placeholder
  const projects = await getUserProjects(id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <Button variant="outline">← Back</Button>
        </Link>
        <h1 className="text-3xl font-bold">User Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-muted-foreground">No projects yet</p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-3 border border-border rounded flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.sourceType}
                    </p>
                  </div>
                  <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
