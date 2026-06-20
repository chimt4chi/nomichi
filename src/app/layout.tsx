import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nomichi | Travel that finds you",
  description: "We design slow, offbeat, small-group journeys for people who want a trip to feel personal. Curated and led end-to-end by our own team.",
  icons: {
    icon: "/favicon.ico",
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
