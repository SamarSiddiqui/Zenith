import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";

export const metadata: Metadata = {
  title: "Zenith — Circadian Habits & Usable Working Window",
  description: "A mindful habit planner with circadian working windows and automated recovery protocols.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-canvas text-ink selection:bg-sage/20 selection:text-ink">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
