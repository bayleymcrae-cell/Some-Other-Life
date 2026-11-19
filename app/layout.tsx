import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://some-other-life.lineddisc3.chatgpt.site"),
  title: "SOME OTHER LIFE — Collection 01",
  description: "Some Other Life. Collection 01. Discover the first details and receive release updates.",
  openGraph: {
    title: "SOME OTHER LIFE — Collection 01",
    description: "Collection 01. Coming soon.",
    images: [{ url: "/assets/social.jpg", width: 1200, height: 630, alt: "Some Other Life — Collection 01." }],
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
      <body className="antialiased">{children}</body>
    </html>
  );
}
