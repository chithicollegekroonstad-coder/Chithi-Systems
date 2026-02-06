// app/super-admin/page.tsx
import { db } from "@/db";
import { users } from "@/db/schema";
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
import {
  Plus,
  Lock,
  Unlock,
  Trash2,
  LayoutDashboard,
  LogOut,
} from "lucide-react";
import {
  lockAdmin,
  unlockAdmin,
  deleteAdmin,
  createAdmin,
  logoutSuper,
} from "@/app/actions/admin-management";

export default async function SuperAdminDashboard() {
  const cookieStore = await cookies(); // ← fixed line
  const access = cookieStore.get("super_access")?.value;

  if (access !== "granted") {
    redirect("/super-login");
  }

  const admins = await db.select().from(users).where(eq(users.role, "ADMIN"));

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">
          Super Admin Control Center
        </h1>

        {/* Quick link */}
        <div className="mb-8">
          <Button asChild className="bg-blue-700 hover:bg-blue-600">
            <a href="/admin/dashboard">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Go to Regular Admin Dashboard
            </a>
          </Button>
        </div>

        {/* Create Admin */}
        <Card className="bg-gray-900 border-red-800 mb-8 text-white">
          <CardHeader>
            <CardTitle>Create New Staff Member</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createAdmin} className="space-y-4 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input name="firstName" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input name="lastName" required />
                </div>
              </div>
              <Button type="submit" className="bg-green-700 hover:bg-green-600">
                Create Staff Account
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin List */}
        <Card className="bg-gray-900 border-red-800 text-white">
          <CardHeader>
            <CardTitle>Manage Admins</CardTitle>
          </CardHeader>
          <CardContent>
            {admins.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No admins yet.</p>
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
                          <input
                            type="hidden"
                            name="adminId"
                            value={admin.id}
                          />
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
                          <input
                            type="hidden"
                            name="adminId"
                            value={admin.id}
                          />
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
