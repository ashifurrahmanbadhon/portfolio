import HomePageClient from "@/components/portfolio/HomePageClient";
import { getPortfolioContent } from "@/lib/db";

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
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
      type: "website",
      siteName: siteSettings?.site_title || "Ashifur Rahman • Portfolio",
      locale: "en_US",
      images: [{ url: ogImage, width: 1200, height: 630, alt: "Ashifur Rahman" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Ashifur Rahman",
  alternateName: ["Ashifur Rahman Badhon", "Badhon"],
  jobTitle: "Electrical & Electronic Engineer",
  url: "https://ashifurrahman.vercel.app",
  sameAs: [
    "https://www.linkedin.com/in/ashifurrahmanbadhon",
    "https://github.com/ashifurrahmanbadhon",
  ],
  alumniOf: "IUBAT",
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <HomePageClient />
    </>
  );
}
