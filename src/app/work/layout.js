export const metadata = {
  title: "Work — Service Packages | Ashifur Rahman",
  description:
    "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start.",
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    siteName: "Ashifur Rahman • Portfolio",
    locale: "en_US",
    images: [{ url: "/ashifur.jpeg", width: 1200, height: 630, alt: "Ashifur Rahman" }],
    title: "Work — Service Packages | Ashifur Rahman",
    description:
      "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start.",
    url: "/work",
  },
  twitter: {
    card: "summary_large_image",
    images: ["/ashifur.jpeg"],
    title: "Work — Service Packages | Ashifur Rahman",
    description:
      "Fixed-scope packages for businesses that want results without agency drama. Pick the one you need — every package clearly lists what is included before we start.",
  },
};

export default function WorkLayout({ children }) {
  return children;
}
