import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./app.css";
import AuthWrapper from "./components/AuthWrapper";
import "@/lib/amplifyServerConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cancel My Stuff",
  description: "Manage your subscriptions and cancellations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
      >
        <AuthWrapper>
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </AuthWrapper>
      </body>
    </html>
  );
}
