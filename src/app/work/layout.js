import { getPortfolioContent } from "@/lib/db";

export async function generateMetadata() {
  const content = await getPortfolioContent().catch(() => null);
  const header = content?.page_headers?.work;
  const siteSettings = content?.site_settings;
  const title = header?.seo_title || "Work — Service Packages | Ashifur Rahman";
  const description =
    header?.seo_description ||
    "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start.";
  const ogImage = siteSettings?.og_image_url || "/ashifur.jpeg";

  return {
    title,
    description,
    alternates: { canonical: "/work" },
    openGraph: {
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
      title,
      description,
      url: "/work",
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      title,
      description,
    },
  };
}

export default function WorkLayout({ children }) {
  return children;
}
