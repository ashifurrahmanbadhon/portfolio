export const metadata = {
  title: "Ashifur Rahman • About",
  description:
    "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
    title: "Ashifur Rahman • About",
    description:
      "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
    title: "Ashifur Rahman • About",
    description:
      "Electrical & Electronic Engineer passionate about technical solutions, substation design, spatial utility systems, and the transformative potential of Artificial Intelligence.",
  },
};

export default function AboutLayout({ children }) {
  return children;
}
