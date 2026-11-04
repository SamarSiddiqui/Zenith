import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { FocusProvider } from "../context/FocusContext";
import { FloatingFocusWidget } from "../components/focus/FloatingFocusWidget";
import { OfflineBanner } from "../components/visuals/OfflineBanner";

export const metadata: Metadata = {
  title: "Zenith — Circadian Habits & Usable Working Window",
  description: "A mindful habit planner with circadian working windows and automated recovery protocols.",
  icons: {
    icon: "/zenithBot.webp",
    shortcut: "/zenithBot.webp",
    apple: "/zenithBot.webp",
  },
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
          <FocusProvider>
            <OfflineBanner />
            {children}
            <FloatingFocusWidget />
          </FocusProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
