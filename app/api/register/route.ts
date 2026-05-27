// app/api/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, applications, otpCodes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { put } from "@vercel/blob";
import { sql } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Extract all form fields (same as before)
    const data = {
      // Personal Details
      title: formData.get("title") as string,
      initials: formData.get("initials") as string,
      surname: formData.get("surname") as string,
      fullNames: formData.get("fullNames") as string,
      maidenSurname: formData.get("maidenSurname") as string,
      dob: formData.get("dob") as string,
      gender: formData.get("gender") as string,
      homeAddress: formData.get("homeAddress") as string,
      currentAddress: formData.get("currentAddress") as string,
      cellNumber: formData.get("cellNumber") as string,
      homeTel: formData.get("homeTel") as string,
      workTel: formData.get("workTel") as string,
      email: (formData.get("email") as string)?.toLowerCase().trim(),
      idNumber: formData.get("idNumber") as string,

      // Biographical
      nationality: formData.get("nationality") as string,
      ethnicity: formData.get("ethnicity") as string,
      homeLanguage: formData.get("homeLanguage") as string,
      preferredLanguage: formData.get("preferredLanguage") as string,
      citizenship: formData.get("citizenship") as string,
      passportNumber: formData.get("passportNumber") as string,

      // Emergency Contact
      emergencyName: formData.get("emergencyName") as string,
      emergencyRelation: formData.get("emergencyRelation") as string,
      emergencyCell: formData.get("emergencyCell") as string,
      emergencyAddress: formData.get("emergencyAddress") as string,

      // Disabilities
      disability: formData.get("disability") === "true",
      disabilityType: formData.get("disabilityType") as string,
      disabilityNotes: formData.get("disabilityNotes") as string,

      // School Details
      lastSchool: formData.get("lastSchool") as string,
      highestGrade: formData.get("highestGrade") as string,
      yearPassed: formData.get("yearPassed") as string,
      previousSchool: formData.get("previousSchool") as string,
    };

    if (!data.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Verify OTP was confirmed (last verified code)
    const otpVerified = await db.query.otpCodes.findFirst({
      where: and(eq(otpCodes.email, data.email), eq(otpCodes.verified, true)),
      orderBy: [sql`${otpCodes.createdAt} desc`],
    });

    if (!otpVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 },
      );
    }

    // Check if email already registered
    const existingUser = await db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Check if ID number already registered
    if (data.idNumber) {
      const existingId = await db.query.users.findFirst({
        columns: { id: true },
        where: eq(users.idNumber, data.idNumber),
      });

      if (existingId) {
        return NextResponse.json(
          { error: "ID number already registered" },
          { status: 409 },
        );
      }
    }

    // Upload files to Vercel Blob
    const idCopyFile = formData.get("idCopy") as File;
    const matricCertFile = formData.get("matricCertificate") as File;

    if (!idCopyFile || !matricCertFile) {
      return NextResponse.json(
        { error: "ID copy and matric certificate are required" },
        { status: 400 },
      );
    }

    const idCopyBlob = await put(
      `applications/${data.idNumber}/id-copy-${Date.now()}.${idCopyFile.name.split(".").pop()}`,
      idCopyFile,
      { access: "public" },
    );

    const matricCertBlob = await put(
      `applications/${data.idNumber}/matric-cert-${Date.now()}.${matricCertFile.name.split(".").pop()}`,
      matricCertFile,
      { access: "public" },
    );

    // Create user (STUDENT)
    const [newUser] = await db
      .insert(users)
      .values({
        email: data.email,
        firstName: data.fullNames.split(" ")[0],
        lastName: data.surname,
        idNumber: data.idNumber,
        cellNumber: data.cellNumber,
        role: "STUDENT",
        status: "ACTIVE",
      })
      .returning({ id: users.id });

    // Create application record
    await db.insert(applications).values({
      userId: newUser.id,
      title: data.title,
      initials: data.initials,
      surname: data.surname,
      fullNames: data.fullNames,
      maidenSurname: data.maidenSurname,
      dob: data.dob,
      gender: data.gender,
      homeAddress: data.homeAddress,
      currentAddress: data.currentAddress,
      cellNumber: data.cellNumber,
      homeTel: data.homeTel,
      workTel: data.workTel,
      email: data.email,
      idNumber: data.idNumber,
      nationality: data.nationality,
      ethnicity: data.ethnicity,
      homeLanguage: data.homeLanguage,
      preferredLanguage: data.preferredLanguage,
      citizenship: data.citizenship,
      passportNumber: data.passportNumber,
      emergencyName: data.emergencyName,
      emergencyRelation: data.emergencyRelation,
      emergencyCell: data.emergencyCell,
      emergencyAddress: data.emergencyAddress,
      disability: data.disability,
      disabilityType: data.disabilityType,
      disabilityNotes: data.disabilityNotes,
      lastSchool: data.lastSchool,
      highestGrade: data.highestGrade,
      yearPassed: data.yearPassed,
      previousSchool: data.previousSchool,
      idCopyUrl: idCopyBlob.url,
      matricCertUrl: matricCertBlob.url,
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      userId: newUser.id,
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Registration failed", message: error.message },
      { status: 500 },
    );
  }
}
