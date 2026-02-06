// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner"; // ← this is the missing piece

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "College Registration & Attendance System",
  description:
    "Modern online registration and classroom attendance for local college students",
  icons: {
    icon: "/favicon.ico", // add your logo later
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          inter.className,
          "min-h-screen bg-gradient-to-br from-white to-red-50/30 antialiased",
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}

          {/* Sonner Toaster – makes all toast() calls visible */}
          <Toaster
            richColors
            position="top-right"
            closeButton
            duration={5000} // how long toasts stay visible
            toastOptions={{
              className: "border border-red-200",
              style: {
                background: "hsl(var(--background))",
                color: "hsl(var(--foreground))",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
