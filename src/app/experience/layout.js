export const metadata = {
  title: "Ashifur Rahman • Experience",
  description:
    "Professional experience of Ashifur Rahman — substation operations, technical design, AutoCAD Electrical, GIS, and engineering services.",
  alternates: { canonical: "/experience" },
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
    title: "Ashifur Rahman • Experience",
    description:
      "Professional experience of Ashifur Rahman — substation operations, technical design, AutoCAD Electrical, GIS, and engineering services.",
    url: "/experience",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
    title: "Ashifur Rahman • Experience",
    description:
      "Professional experience of Ashifur Rahman — substation operations, technical design, AutoCAD Electrical, GIS, and engineering services.",
  },
};

export default function ExperienceLayout({ children }) {
  return children;
}
