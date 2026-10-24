import HomePageClient from "@/components/portfolio/HomePageClient";

export const metadata = {
  title: "Ashifur Rahman • Portfolio",
  description: "Ashifur Rahman — Electrical & Electronic Engineer: portfolio, projects, and engineering services.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Ashifur Rahman • Portfolio",
    description: "Ashifur Rahman — Electrical & Electronic Engineer: portfolio, projects, and engineering services.",
    url: "/",
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ashifur Rahman • Portfolio",
    description: "Ashifur Rahman — Electrical & Electronic Engineer: portfolio, projects, and engineering services.",
    images: ["/ashifur.jpeg"],
  },
};

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
