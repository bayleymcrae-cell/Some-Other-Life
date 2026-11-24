import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://someotherlife.studio"),
  title: "SOME OTHER LIFE — Independent Fashion Label | Collection 01",
  alternates: { canonical: "/" },
  description: "SOME OTHER LIFE is an independent Australian fashion label. Explore Collection 01, the Insignia Long Sleeve and denim design previews, and receive release updates.",
  openGraph: {
    url: "https://someotherlife.studio/",
    siteName: "SOME OTHER LIFE",
    title: "SOME OTHER LIFE — Collection 01",
    description: "Collection 01. Coming soon.",
    images: [{ url: "/assets/social.jpg", width: 1200, height: 630, alt: "Some Other Life — Collection 01." }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.svg?v=insignia-20261124",
    shortcut: "/favicon.svg?v=insignia-20261124",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://someotherlife.studio/#organization","name":"SOME OTHER LIFE","url":"https://someotherlife.studio/","sameAs":["https://www.instagram.com/someotherlifestudio/"]},{"@type":"WebSite","@id":"https://someotherlife.studio/#website","name":"SOME OTHER LIFE","url":"https://someotherlife.studio/","publisher":{"@id":"https://someotherlife.studio/#organization"}}]}) }} />{children}</body>
    </html>
  );
}
