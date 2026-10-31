import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://ashifurrahman.vercel.app"),
  title: "Ashifur Rahman • Portfolio",
  description: "Ashifur Rahman — Electrical & Electronic Engineer: portfolio, projects, and engineering services.",
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
  },
  // Google Search Console ownership verification — NEVER remove, or GSC access is lost.
  verification: {
    google: "HA3zZE7sqmr2f-OW02PChHvJ-DAEa2QGWe1TIJK1rPA",
  },
};

import DashboardShell from "@/components/DashboardShell";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${interTight.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#06070B] text-[#F5F2EA] selection:bg-[#F59E0B] selection:text-[#1A1202]"
      >
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
