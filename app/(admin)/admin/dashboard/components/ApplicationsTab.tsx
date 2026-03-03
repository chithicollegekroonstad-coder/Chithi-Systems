"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { TabsContent } from "@/components/ui/tabs";
import { Application } from "../types";

interface ApplicationsTabProps {
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
}

export function ApplicationsTab({
  applications,
  setApplications,
}: ApplicationsTabProps) {
  const handleApplicationAction = (
    id: string,
    action: "approved" | "declined",
  ) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status: action } : app)),
    );
    toast.success(`Application ${action}!`);
  };

  return (
    <TabsContent value="applications">
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Surname</TableHead>
                <TableHead>Student Number</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.name}</TableCell>
                  <TableCell>{app.surname}</TableCell>
                  <TableCell>{app.studentNumber}</TableCell>
                  <TableCell>{app.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        app.status === "approved"
                          ? "default"
                          : app.status === "declined"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {app.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleApplicationAction(app.id, "approved")
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleApplicationAction(app.id, "declined")
                          }
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-gray-500 py-10"
                  >
                    No pending applications
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
