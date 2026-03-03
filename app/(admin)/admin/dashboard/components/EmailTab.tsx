// app/admin/dashboard/components/EmailTab.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmailForm } from "./EmailForm";
import { toast } from "sonner";
import { Student } from "../types";

interface EmailTabProps {
  students: Student[];
}

export function EmailTab({ students }: EmailTabProps) {
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [individualEmailStudent, setIndividualEmailStudent] =
    useState<Student | null>(null);
  const [individualSubject, setIndividualSubject] = useState("");
  const [individualMessage, setIndividualMessage] = useState("");

  const sendEmailBroadcast = () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error("Subject and message required");
      return;
    }
    toast.success("Broadcast sent!", {
      description: "Simulation: Sent to all students",
    });
    setEmailSubject("");
    setEmailMessage("");
  };

  const sendIndividualEmail = () => {
    if (
      !individualEmailStudent ||
      !individualSubject.trim() ||
      !individualMessage.trim()
    ) {
      toast.error("Select student and fill fields");
      return;
    }
    toast.success(`Email sent to ${individualEmailStudent.email}`, {
      description: "Simulation",
    });
    setIndividualEmailStudent(null);
    setIndividualSubject("");
    setIndividualMessage("");
  };

  return (
    <TabsContent value="email">
      <Card>
        <CardHeader>
          <CardTitle>Email Students</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="broadcast">
            <TabsList className="mb-6">
              <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              <TabsTrigger value="individual">Individual</TabsTrigger>
            </TabsList>

            <TabsContent value="broadcast">
              <EmailForm
                subject={emailSubject}
                setSubject={setEmailSubject}
                message={emailMessage}
                setMessage={setEmailMessage}
                onSend={sendEmailBroadcast}
                label="Send Broadcast"
                students={students}
                isBroadcast
              />
            </TabsContent>

            <TabsContent value="individual">
              <EmailForm
                subject={individualSubject}
                setSubject={setIndividualSubject}
                message={individualMessage}
                setMessage={setIndividualMessage}
                onSend={sendIndividualEmail}
                label="Send Email"
                students={students}
                selectedStudent={individualEmailStudent}
                setSelectedStudent={setIndividualEmailStudent}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
