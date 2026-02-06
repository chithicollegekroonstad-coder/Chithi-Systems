// scripts/create-super-admin-simple.ts - Alternative version
// Run with: npx tsx scripts/create-super-admin-simple.ts

import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  console.log("🔐 Creating Super Admin...\n");

  // Dynamic import to avoid config issues
  const { PrismaClient } = await import("@prisma/client");
  const bcrypt = await import("bcryptjs");

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const dbUrl = process.env.DATABASE_URL;

  if (!email || !password) {
    console.error("❌ Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env\n");
    process.exit(1);
  }

  if (!dbUrl) {
    console.error("❌ Missing DATABASE_URL in .env\n");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasourceUrl: dbUrl,
  });

  try {
    await prisma.$connect();
    console.log("✅ Database connected\n");

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing) {
      console.log("⚠️  User exists, updating...\n");

      const updated = await prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: {
          role: "SUPERADMIN",
          passwordHash,
          isLocked: false,
          status: "ACTIVE",
        },
      });

      console.log("✅ Updated!\n");
      console.log(`Email: ${updated.email}`);
      console.log(`Role: ${updated.role}\n`);
    } else {
      console.log("Creating new super admin...\n");

      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase().trim(),
          firstName: "Super",
          lastName: "Admin",
          passwordHash,
          role: "SUPERADMIN",
          status: "ACTIVE",
          isLocked: false,
        },
      });

      console.log("✅ Created!\n");
      console.log(`Email: ${user.email}`);
      console.log(`Role: ${user.role}`);
      console.log(`ID: ${user.id}\n`);
    }

    console.log("🎉 Login at /super-admin/login with:");
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}\n`);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
