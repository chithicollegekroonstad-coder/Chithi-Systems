// app/admin/dashboard/components/StaffManagement.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
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
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { createStaff, deleteStaff, getStaffMembers } from "@/app/actions/admin-management";

type Staff = {
  id: number | string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  surname?: string;
  role: string;
  isLocked: boolean;
  createdAt?: string;
};

interface StaffManagementProps {
  // No longer need to pass staff/setStaff from parent — we manage it here
}

export default function StaffManagement({}: StaffManagementProps) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  const [isPendingCreate, startCreateTransition] = useTransition();
  const [isPendingDelete, startDeleteTransition] = useTransition();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Fetch real staff on mount
  useEffect(() => {
    const fetchStaff = async () => {
      setLoading(true);
      try {
        const data = await getStaffMembers();
        setStaff(data);
      } catch (err: any) {
        toast.error("Failed to load staff list", {
          description: err.message || "Please try again",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();

    startCreateTransition(async () => {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);

      try {
        await createStaff(formData);

        // Optimistic add (use real data structure)
        const tempId = `temp-${Date.now()}`;
        const newStaffMember: Staff = {
          id: tempId,
          email,
          firstName,
          lastName,
          role: "STAFF",
          isLocked: false,
        };

        setStaff((prev) => [...prev, newStaffMember]);

        toast.success("Staff member created successfully");

        setEmail("");
        setFirstName("");
        setLastName("");

        // Refresh from DB after short delay (to get real ID)
        setTimeout(async () => {
          const fresh = await getStaffMembers();
          setStaff(fresh);
        }, 1500);
      } catch (err: any) {
        toast.error("Failed to create staff", {
          description: err.message || "Please try again",
        });
      }
    });
  };

  const handleDelete = (staffId: string | number) => {
    startDeleteTransition(async () => {
      const formData = new FormData();
      formData.append("staffId", staffId.toString());

      try {
        await deleteStaff(formData);

        setStaff((prev) => prev.filter((s) => s.id !== staffId));

        toast.success("Staff member deleted");

        // Refresh from DB
        const fresh = await getStaffMembers();
        setStaff(fresh);
      } catch (err: any) {
        toast.error("Failed to delete staff", {
          description: err.message || "Try again",
        });
      }
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manage Staff Members</CardTitle>
        </CardHeader>
        <CardContent className="py-10 text-center">Loading staff list...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-red-100 mt-12">
      <CardHeader>
        <CardTitle>Manage Staff Members</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreate} className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPendingCreate}
              />
            </div>
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={isPendingCreate}
              />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={isPendingCreate}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isPendingCreate}
            className="bg-green-700 hover:bg-green-600"
          >
            {isPendingCreate ? "Creating..." : "Create Staff Account"}
          </Button>
        </form>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No staff members yet.
                </TableCell>
              </TableRow>
            ) : (
              staff.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {member.firstName || member.name || ""}{" "}
                    {member.lastName || member.surname || ""}
                  </TableCell>
                  <TableCell>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleDelete(member.id);
                      }}
                    >
                      <Button
                        type="submit"
                        variant="destructive"
                        size="sm"
                        disabled={isPendingDelete}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}