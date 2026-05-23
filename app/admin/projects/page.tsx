"use server";

import { requireAdmin } from "@/lib/admin/auth";
import { getAllProjects } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminProjectsPage() {
  await requireAdmin();
  const projects = await getAllProjects(100, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Projects</h1>
        <p className="text-muted-foreground mt-2">
          Total: {projects.length} projects
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">URL</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Created</th>
                  <th className="text-left py-3 px-4 font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id} className="border-b border-border">
                    <td className="py-3 px-4 font-medium">{project.name}</td>
                    <td className="py-3 px-4 text-xs text-muted-foreground">
                      {project.sourceUrl ? (
                        <a
                          href={project.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {project.sourceUrl.slice(0, 50)}...
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium">
                        {project.sourceType}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                        {project.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {project.createdAt.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {project.updatedAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
