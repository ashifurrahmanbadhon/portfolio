export const metadata = {
  title: "Ashifur Rahman • Education & Training",
  description:
    "EEE degree from IUBAT, on-site utility training at DESCO, and AutoCAD Electrical and GIS training — the education and professional development of Ashifur Rahman.",
  alternates: { canonical: "/education" },
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
    title: "Ashifur Rahman • Education & Training",
    description:
      "EEE degree from IUBAT, on-site utility training at DESCO, and AutoCAD Electrical and GIS training — the education and professional development of Ashifur Rahman.",
    url: "/education",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
    title: "Ashifur Rahman • Education & Training",
    description:
      "EEE degree from IUBAT, on-site utility training at DESCO, and AutoCAD Electrical and GIS training — the education and professional development of Ashifur Rahman.",
  },
};

export default function EducationLayout({ children }) {
  return children;
}
