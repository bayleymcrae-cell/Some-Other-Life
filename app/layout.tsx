import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://someotherlife.studio"),
  title: "SOME OTHER LIFE",
  alternates: { canonical: "/" },
  description: "An independent clothing label. Collection 01 — BLACK SWAN.",
  openGraph: {
    url: "https://someotherlife.studio/",
    siteName: "SOME OTHER LIFE",
    title: "SOME OTHER LIFE",
    description: "An independent clothing label. Collection 01 — BLACK SWAN.",
    images: [{ url: "/assets/social.jpg", width: 1200, height: 630, alt: "Some Other Life — BLACK SWAN." }],
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context":"https://schema.org","@graph":[{"@type":"Organization","@id":"https://someotherlife.studio/#organization","name":"SOME OTHER LIFE","url":"https://someotherlife.studio/","logo":"https://someotherlife.studio/assets/official-insignia.png","description":"An independent clothing label. Collection 01 — BLACK SWAN.","email":"someotherlifetm@gmail.com","sameAs":["https://www.instagram.com/someotherlifestudio/"]},{"@type":"WebSite","@id":"https://someotherlife.studio/#website","name":"SOME OTHER LIFE","url":"https://someotherlife.studio/","publisher":{"@id":"https://someotherlife.studio/#organization"}}]}) }} />{children}</body>
    </html>
  );
}
