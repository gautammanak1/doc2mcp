import { auth } from "@/app/(auth)/auth";
import { CONTACT_EMAIL } from "@/lib/config/site";
import { getAdminStats, getAllProjects } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export async function AdminDashboard() {
  const session = await auth();
  const adminEmail = process.env.ADMIN_EMAIL ?? CONTACT_EMAIL;

  if (!session?.user?.email || session.user.email !== adminEmail) {
    redirect("/login");
  }

  const [stats, projects] = await Promise.all([
    getAdminStats(),
    getAllProjects(20),
  ]);

  return (
    <main className="min-h-dvh bg-background px-4 py-10 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-display font-semibold text-3xl tracking-tight">
          Admin dashboard
        </h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Signed in as {session.user.email}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/40 bg-card/40 p-5">
            <p className="font-mono text-muted-foreground text-xs uppercase">
              Users
            </p>
            <p className="mt-2 font-display font-semibold text-3xl">
              {stats.totalUsers}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/40 p-5">
            <p className="font-mono text-muted-foreground text-xs uppercase">
              Projects
            </p>
            <p className="mt-2 font-display font-semibold text-3xl">
              {stats.totalProjects}
            </p>
          </div>
          <div className="rounded-xl border border-border/40 bg-card/40 p-5">
            <p className="font-mono text-muted-foreground text-xs uppercase">
              MCP servers
            </p>
            <p className="mt-2 font-display font-semibold text-3xl">
              {stats.totalMCPs}
            </p>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="font-display font-semibold text-xl">
            Recent projects
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-border/40">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-border/40 border-b bg-card/30">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr
                    className="border-border/20 border-b last:border-0"
                    key={project.id}
                  >
                    <td className="px-4 py-3">{project.name}</td>
                    <td className="px-4 py-3 capitalize">{project.status}</td>
                    <td className="max-w-[240px] truncate px-4 py-3 text-muted-foreground">
                      {project.sourceUrl ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-8 text-muted-foreground text-xs">
          Support:{" "}
          <a className="underline" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </main>
  );
}
