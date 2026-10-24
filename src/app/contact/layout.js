export const metadata = {
  title: "Ashifur Rahman • Contact",
  description:
    "Contact Ashifur Rahman for engineering, technology, and AI opportunities — email, WhatsApp, LinkedIn, and GitHub.",
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
    title: "Ashifur Rahman • Contact",
    description:
      "Contact Ashifur Rahman for engineering, technology, and AI opportunities — email, WhatsApp, LinkedIn, and GitHub.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
    title: "Ashifur Rahman • Contact",
    description:
      "Contact Ashifur Rahman for engineering, technology, and AI opportunities — email, WhatsApp, LinkedIn, and GitHub.",
  },
};

export default function ContactLayout({ children }) {
  return children;
}
