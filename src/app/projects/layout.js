import { getPortfolioContent } from "@/lib/db";

export async function generateMetadata() {
  const content = await getPortfolioContent().catch(() => null);
  const header = content?.page_headers?.projects;
  const siteSettings = content?.site_settings;
  const title = header?.seo_title || "Ashifur Rahman • Projects";
  const description =
    header?.seo_description ||
    "Engineering projects by Ashifur Rahman: substation SLD & protection design, GIS power distribution mapping, solar PV simulations, and AI automations.";
  const ogImage = siteSettings?.og_image_url || "/ashifur.jpeg";

  return {
    title,
    description,
    alternates: { canonical: "/projects" },
    openGraph: {
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
      title,
      description,
      url: "/projects",
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      title,
      description,
    },
  };
}

export default function ProjectsLayout({ children }) {
  return children;
}
