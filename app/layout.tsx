import { Navbar } from "./components/navbar";
import "./app.css";
import AuthWrapper from "./components/AuthWrapper";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
          <Navbar />
          <main className="container mx-auto px-4 py-6">
            {children}
          </main>
        </AuthWrapper>
      </body>
    </html>
  );
}
