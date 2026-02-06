// middleware.ts// middleware.ts
export const runtime = "nodejs"; // ← this forces Node.js runtime

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "./db";
import { sessions, users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for public routes
  const publicRoutes = [
    "/",
    "/register",
    "/login",
    "/admin/login",
    "/super-admin/login",
    "/api",
    "/_next",
    "/favicon.ico",
  ];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session token from cookie
  const token = request.cookies.get("session_token")?.value;

  if (!token) {
    // Redirect to appropriate login page
    if (pathname.startsWith("/super-admin")) {
      return NextResponse.redirect(new URL("/super-admin/login", request.url));
    }
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verify session with Drizzle
  try {
    const session = await db.query.sessions.findFirst({
      where: eq(sessions.token, token),
      with: {
        user: {
          columns: {
            role: true,
            isLocked: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      // Session expired or invalid → clean up
      await db.delete(sessions).where(eq(sessions.token, token));

      if (pathname.startsWith("/super-admin")) {
        return NextResponse.redirect(
          new URL("/super-admin/login", request.url),
        );
      }
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check if user is locked
    if (session.user.isLocked) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Check role permissions
    if (pathname.startsWith("/super-admin")) {
      if (session.user.role !== "SUPERADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    if (pathname.startsWith("/admin")) {
      if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
        return NextResponse.redirect(new URL("/attendance", request.url));
      }
    }

    // All checks passed
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - API routes
     * - Static files
     * - Images
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
