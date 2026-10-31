import { getPortfolioContent } from "@/lib/db";

export async function generateMetadata() {
  const content = await getPortfolioContent().catch(() => null);
  const header = content?.page_headers?.skills;
  const siteSettings = content?.site_settings;
  const title = header?.seo_title || "Ashifur Rahman • Skills";
  const description =
    header?.seo_description ||
    "Technical skills of Ashifur Rahman: substation operations, AutoCAD Electrical, GIS & asset mapping, power system analysis, programming, and engineering tools.";
  const ogImage = siteSettings?.og_image_url || "/ashifur.jpeg";

  return {
    title,
    description,
    alternates: { canonical: "/skills" },
    openGraph: {
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
      title,
      description,
      url: "/skills",
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      title,
      description,
    },
  };
}

export default function SkillsLayout({ children }) {
  return children;
}
