import { Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import DashboardShell from "@/components/DashboardShell";
import { getPortfolioContent } from "@/lib/db";
import { Analytics } from "@vercel/analytics/next";

const interTight = Inter_Tight({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const content = await getPortfolioContent().catch(() => null);
  const homeHeader = content?.page_headers?.home;
  const siteSettings = content?.site_settings;
  const title = homeHeader?.seo_title || siteSettings?.site_title || "Ashifur Rahman • Portfolio";
  const description =
    homeHeader?.seo_description ||
    siteSettings?.meta_description ||
    "Ashifur Rahman — Electrical & Electronic Engineer: portfolio, projects, and engineering services.";
  const ogImage = siteSettings?.og_image_url || "/ashifur.jpeg";

  return {
    metadataBase: new URL("https://ashifurrahman.vercel.app"),
    title,
    description,
    openGraph: {
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
      title,
      description,
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      title,
      description,
    },
    // Google Search Console ownership verification — NEVER remove, or GSC access is lost.
    verification: {
      google: "HA3zZE7sqmr2f-OW02PChHvJ-DAEa2QGWe1TIJK1rPA",
    },
  };
}

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
        <Analytics />
      </body>
    </html>
  );
}
