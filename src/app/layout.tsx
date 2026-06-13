import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TrashGame — Gamified Litter Cleanup",
  description: "Earn points, level up, and save the planet by picking up litter. Verified by AI.",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#f0fdf4",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-eco-bg text-[#262626] antialiased">{children}</body>
    </html>
  );
}
