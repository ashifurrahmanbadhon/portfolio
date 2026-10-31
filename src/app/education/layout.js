import { getPortfolioContent } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata() {
  const content = await getPortfolioContent().catch(() => null);
  const header = content?.page_headers?.education;
  const siteSettings = content?.site_settings;
  const title = header?.seo_title || "Ashifur Rahman • Education & Training";
  const description =
    header?.seo_description ||
    "EEE degree from IUBAT, on-site utility training at DESCO, and AutoCAD Electrical and GIS training — the academic and professional credentials of Ashifur Rahman.";
  const ogImage = siteSettings?.og_image_url || "/ashifur.jpeg";

  return {
    title,
    description,
    alternates: { canonical: "/education" },
    openGraph: {
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
      title,
      description,
      url: "/education",
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      title,
      description,
    },
  };
}

export default function EducationLayout({ children }) {
  return children;
}
