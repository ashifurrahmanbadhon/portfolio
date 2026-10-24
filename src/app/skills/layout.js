export const metadata = {
  title: "Ashifur Rahman • Skills",
  description:
    "Technical skills of Ashifur Rahman: substation operations, AutoCAD Electrical, GIS & asset mapping, power system analysis, and AI technologies.",
  alternates: { canonical: "/skills" },
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
    title: "Ashifur Rahman • Skills",
    description:
      "Technical skills of Ashifur Rahman: substation operations, AutoCAD Electrical, GIS & asset mapping, power system analysis, and AI technologies.",
    url: "/skills",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
    title: "Ashifur Rahman • Skills",
    description:
      "Technical skills of Ashifur Rahman: substation operations, AutoCAD Electrical, GIS & asset mapping, power system analysis, and AI technologies.",
  },
};

export default function SkillsLayout({ children }) {
  return children;
}
