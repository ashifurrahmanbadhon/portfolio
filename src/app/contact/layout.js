import { getPortfolioContent } from "@/lib/db";

export async function generateMetadata() {
  const content = await getPortfolioContent().catch(() => null);
  const header = content?.page_headers?.contact;
  const siteSettings = content?.site_settings;
  const title = header?.seo_title || "Ashifur Rahman • Contact";
  const description =
    header?.seo_description ||
    "Contact Ashifur Rahman for engineering, technology, and AI opportunities — email, WhatsApp, LinkedIn, and GitHub.";
  const ogImage = siteSettings?.og_image_url || "/ashifur.jpeg";

  return {
    title,
    description,
    alternates: { canonical: "/contact" },
    openGraph: {
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
      title,
      description,
      url: "/contact",
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
      title,
      description,
    },
  };
}

export default function ContactLayout({ children }) {
  return children;
}
