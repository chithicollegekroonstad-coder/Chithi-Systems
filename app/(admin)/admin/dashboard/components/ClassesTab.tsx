// app/admin/dashboard/components/ClassesTab.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Application, 
  Class, 
  AttendanceRecord, 
  Student, 
  Staff, 
  StaffAttendanceRecord 
} from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import { Plus, Trash2, Download } from "lucide-react";
import jsPDF from "jspdf";

import { TabsContent } from "@/components/ui/tabs";

interface ClassesTabProps {
  classes: Class[];
  setClasses: React.Dispatch<React.SetStateAction<Class[]>>;
}

export function ClassesTab({ classes, setClasses }: ClassesTabProps) {
  const [newClassModule, setNewClassModule] = useState("N4");
  const [newClassName, setNewClassName] = useState("");

  const createClass = () => {
    if (!newClassName.trim()) {
      toast.error("Class name required");
      return;
    }

    const qrValue = `cfc-attendance-${Date.now()}-${newClassName.trim()}`;

    const newClass: Class = {
      id: Date.now().toString(),
      module: newClassModule,
      name: newClassName.trim(),
      createdAt: new Date().toISOString(),
      qrCodeValue: qrValue,
    };

    setClasses((prev) => [...prev, newClass]);
    setNewClassName("");
    toast.success("Class created with QR code");
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    toast.success("Class deleted");
  };

  const exportQRToPDF = (cls: Class) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    doc.setFontSize(20);
    doc.text(`CHITHI FET COLLEGE - ${cls.module}`, 20, 40);
    doc.setFontSize(16);
    doc.text(cls.name, 20, 55);
    doc.setFontSize(12);
    doc.text("Scan this QR code to mark attendance", 20, 75);

    const qrElement = document.getElementById(`qr-${cls.id}`);
    if (qrElement) {
      const svg = qrElement.querySelector("svg");
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0);
          const qrDataUrl = canvas.toDataURL("image/png");
          doc.addImage(qrDataUrl, "PNG", 20, 90, 170, 170);
          doc.save(`qr_${cls.name.replace(/\s+/g, "_")}.pdf`);
          toast.success("QR exported as PDF");
        };
        img.src = "data:image/svg+xml;base64," + btoa(svgData);
      }
    }
  };

  return (
    <TabsContent value="classes">
      <Card>
        <CardHeader>
          <CardTitle>Classes & QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Module</Label>
                <Select
                  value={newClassModule}
                  onValueChange={setNewClassModule}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select module" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N4">N4</SelectItem>
                    <SelectItem value="N5">N5</SelectItem>
                    <SelectItem value="N6">N6</SelectItem>
                    <SelectItem value="Matric Re-write">
                      Matric Re-write
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label>Class Name</Label>
                <Input
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Mathematics N4 - Group A"
                />
              </div>
            </div>

            <Button
              onClick={createClass}
              className="bg-red-600 hover:bg-red-700"
            >
              <Plus className="mr-2 h-4 w-4" /> Create Class (with QR)
            </Button>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Module</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>QR Code</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.module}</TableCell>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col items-center gap-2">
                        <div
                          id={`qr-${cls.id}`}
                          className="p-2 bg-white border rounded"
                        >
                          <QRCodeSVG
                            value={cls.qrCodeValue}
                            size={128}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="Q"
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => exportQRToPDF(cls)}
                        >
                          <Download className="h-4 w-4 mr-1" /> Export PDF
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteClass(cls.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {classes.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-gray-500"
                    >
                      No classes yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}