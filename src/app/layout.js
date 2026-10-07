import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Ashifur Rahman • Central CMS",
  description: "One Login. Every Website. One Control Center.",
};

import DashboardShell from "@/components/DashboardShell";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#080C14] text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300"
      >
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
