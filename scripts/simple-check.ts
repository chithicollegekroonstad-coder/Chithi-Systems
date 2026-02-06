// scripts/simple-check.ts
// Run: npx tsx scripts/simple-check.ts

import { PrismaClient } from "@prisma/client";

async function check() {
  const prisma = new PrismaClient();

  try {
    console.log("\n🔍 Checking database...\n");

    // Try to connect
    await prisma.$connect();
    console.log("✅ Database connected\n");

    // Count users
    const totalUsers = await prisma.user.count();
    console.log(`Total users in database: ${totalUsers}\n`);

    // Find super admins
    const superAdmins = await prisma.user.findMany({
      where: { role: "SUPERADMIN" },
    });

    if (superAdmins.length === 0) {
      console.log("❌ NO SUPER ADMIN FOUND!\n");
      console.log("Run: npx tsx scripts/create-super-admin.ts\n");
    } else {
      console.log("✅ Super admins found:\n");
      superAdmins.forEach((admin) => {
        console.log(`  Email: ${admin.email}`);
        console.log(`  Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`  Has password: ${admin.passwordHash ? "Yes" : "NO!"}`);
        console.log(`  Locked: ${admin.isLocked}\n`);
      });
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
