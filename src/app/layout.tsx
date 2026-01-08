// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";
import UserStatus from "@/components/UserStatus";
import Link from "next/link";

export const metadata: Metadata = {
  title: "PathoBooking",
  description: "Підбір патоморфологів для онкологічних пацієнтів",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body className="bg-slate-50">
        <AuthProvider>
          <header className="border-b bg-white">
            <div className="container mx-auto flex items-center justify-between px-4 py-2">
              <Link href="/" className="text-sm font-semibold">
                PathoBooking
              </Link>
              <UserStatus />
            </div>
          </header>
          <main className="container mx-auto p-4">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
