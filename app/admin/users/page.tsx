"use server";

import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getAllUsers, getUserProjects } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function AdminUsersPage() {
  await requireAdmin();
  const users = await getAllUsers(100, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">All Users</h1>
        <p className="text-muted-foreground mt-2">Total: {users.length} users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium">Email</th>
                  <th className="text-left py-3 px-4 font-medium">Name</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Joined</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border">
                    <td className="py-3 px-4 font-mono text-xs">{u.email}</td>
                    <td className="py-3 px-4">{u.name || "—"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                          u.emailVerified
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        }`}
                      >
                        {u.emailVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {u.createdAt.toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <Link href={`/admin/users/${u.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
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
