import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SocTrackr - Cambridge Events",
  description: "Never miss a Cambridge event. Track events from over 150 Cambridge societies, all in one unified platform.",
  openGraph: {
    title: "SocTrackr - Cambridge Events",
    description: "Never miss a Cambridge event. Track events from over 150 Cambridge societies, all in one unified platform.",
    type: "website",
    images: [
      {
        url: "/cambridgeLogo.png",
        width: 1200,
        height: 630,
        alt: "SocTrackr - Cambridge Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocTrackr - Cambridge Events",
    description: "Never miss a Cambridge event. Track events from over 150 Cambridge societies, all in one unified platform.",
    images: ["/cambridgeLogo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content="Never miss a Cambridge event. Track events from over 150 Cambridge societies, all in one unified platform." />
        <meta property="og:title" content="SocTrackr - Cambridge Events" />
        <meta property="og:description" content="Never miss a Cambridge event. Track events from over 150 Cambridge societies, all in one unified platform." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/cambridgeLogo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SocTrackr - Cambridge Events" />
        <meta name="twitter:description" content="Never miss a Cambridge event. Track events from over 150 Cambridge societies, all in one unified platform." />
        <meta name="twitter:image" content="/cambridgeLogo.png" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0a0a0f]`}>
        <header className="sticky top-0 z-50 bg-[#18181b]/80 backdrop-blur border-b border-[#2d2d31]">
          <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a href="/"><span className="text-[#e4e4e7] font-semibold">SocTrackr</span></a> 
            </div>
            <div className="flex items-center gap-4">
              <a href="/events" className="text-[#a1a1aa] hover:text-[#42f5b9] text-sm transition-colors">Events</a>
              <a href="/sources" className="text-[#a1a1aa] hover:text-[#42f5b9] text-sm transition-colors">Sources</a>
            </div>
          </nav>
        </header>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
