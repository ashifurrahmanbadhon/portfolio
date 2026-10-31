import { getPortfolioContent } from "@/lib/db";

export async function generateMetadata() {
  const content = await getPortfolioContent().catch(() => null);
  const header = content?.page_headers?.experience;
  const siteSettings = content?.site_settings;
  const title = header?.seo_title || "Ashifur Rahman • Experience";
  const description =
    header?.seo_description ||
    "Professional experience of Ashifur Rahman — substation operations, technical design, AutoCAD Electrical, GIS, and data analytics in engineering environments.";
  const ogImage = siteSettings?.og_image_url || "/ashifur.jpeg";

  return {
    title,
    description,
    alternates: { canonical: "/experience" },
    openGraph: {
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
      title,
      description,
      url: "/experience",
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      title,
      description,
    },
  };
}

export default function ExperienceLayout({ children }) {
  return children;
}
