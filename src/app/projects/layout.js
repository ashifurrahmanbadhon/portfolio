export const metadata = {
  title: "Ashifur Rahman • Projects",
  description:
    "Engineering projects by Ashifur Rahman: substation SLD & protection design, GIS power distribution mapping, solar PV sizing, motor control schematics, and more.",
  alternates: { canonical: "/projects" },
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
    title: "Ashifur Rahman • Projects",
    description:
      "Engineering projects by Ashifur Rahman: substation SLD & protection design, GIS power distribution mapping, solar PV sizing, motor control schematics, and more.",
    url: "/projects",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
    title: "Ashifur Rahman • Projects",
    description:
      "Engineering projects by Ashifur Rahman: substation SLD & protection design, GIS power distribution mapping, solar PV sizing, motor control schematics, and more.",
  },
};

export default function ProjectsLayout({ children }) {
  return children;
}
