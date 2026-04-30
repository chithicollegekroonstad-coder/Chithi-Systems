// app/super-admin/page.tsx
import { db } from "@/db";
import { users } from "@/db/schema";
import { usersCoreColumns } from "@/db/user-columns";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LayoutDashboard, LogOut } from "lucide-react";
import {
  lockAdmin,
  unlockAdmin,
  deleteAdmin,
  createAdmin,
  logoutSuper,
} from "@/app/actions/super-admin";

export const dynamic = "force-dynamic";

export default async function SuperAdminDashboard({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const cookieStore = await cookies();
  const access = cookieStore.get("super_access")?.value;

  if (access !== "granted") {
    redirect("/super-login");
  }

  const admins = await db
    .select(usersCoreColumns)
    .from(users)
    .where(eq(users.role, "ADMIN"));

  const message = searchParams.message as string | undefined;
  const error = searchParams.error as string | undefined;

  return (
    <div className="min-h-screen px-4 py-8 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-balance text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
              Super admin{" "}
              <span className="bg-gradient-to-r from-red-600 to-red-500 bg-clip-text text-transparent">
                control center
              </span>
            </h1>
            <p className="mt-2 text-neutral-600">
              Create and manage college administrator accounts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="rounded-xl bg-red-600 font-semibold shadow-md shadow-red-600/20 hover:bg-red-700"
            >
              <a href="/admin/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Admin dashboard
              </a>
            </Button>
            <form action={logoutSuper}>
              <Button
                type="submit"
                variant="outline"
                className="rounded-xl border-red-200 bg-white/80 text-neutral-800 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>

        {message && (
          <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900 ring-1 ring-emerald-100/80">
            {decodeURIComponent(message)}
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-200/90 bg-red-50/90 px-4 py-3 text-sm text-red-900 ring-1 ring-red-100/80">
            {decodeURIComponent(error)}
          </div>
        )}

        <Card className="rounded-2xl border border-red-100/90 bg-white/85 shadow-sm shadow-red-950/5 ring-1 ring-red-50/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-neutral-900">Create new admin</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAdmin} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" type="email" required id="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input name="firstName" required id="firstName" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input name="lastName" required id="lastName" />
                </div>
              </div>
              <Button
                type="submit"
                className="rounded-xl bg-red-600 font-semibold shadow-md shadow-red-600/20 hover:bg-red-700"
              >
                Create admin account
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-red-100/90 bg-white/85 shadow-sm shadow-red-950/5 ring-1 ring-red-50/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-neutral-900">Manage admins</CardTitle>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <p className="py-8 text-center text-neutral-500">No admins yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>
                        {admin.firstName} {admin.lastName}
                      </TableCell>
                      <TableCell>{admin.role}</TableCell>
                      <TableCell>
                        {admin.isLocked ? "Locked" : "Active"}
                      </TableCell>
                      <TableCell className="flex gap-2">
                        <form action={admin.isLocked ? unlockAdmin : lockAdmin}>
                          <input type="hidden" name="adminId" value={admin.id} />
                          <Button
                            type="submit"
                            variant={admin.isLocked ? "default" : "destructive"}
                            size="sm"
                            disabled={admin.role === "SUPERADMIN"}
                          >
                            {admin.isLocked ? "Unlock" : "Lock"}
                          </Button>
                        </form>

                        <form action={deleteAdmin}>
                          <input type="hidden" name="adminId" value={admin.id} />
                          <Button
                            type="submit"
                            variant="destructive"
                            size="sm"
                            disabled={admin.role === "SUPERADMIN"}
                          >
                            Delete
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
