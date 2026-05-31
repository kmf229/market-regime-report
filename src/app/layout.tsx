import type { Metadata } from "next";
import { Inter, Spectral } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/server";
import { Analytics } from "@vercel/analytics/react";

// Prevent Vercel from caching auth state
export const dynamic = "force-dynamic";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const spectral = Spectral({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-spectral",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://marketregimes.com"),
  title: {
    default: "Market Regime Capital",
    template: "%s | Market Regime Capital",
  },
  description:
    "A rules-based futures trading CTA. Systematic regime-based approach to futures markets with full transparency.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Market Regime Capital",
    title: "Market Regime Capital",
    description:
      "A rules-based futures trading CTA. Systematic regime-based approach to futures markets with full transparency.",
    images: [
      {
        url: "/images/hero.jpg",
        width: 1200,
        height: 630,
        alt: "Market Regime Capital",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Market Regime Capital",
    description:
      "A rules-based futures trading CTA. Systematic regime-based approach to futures markets with full transparency.",
    images: ["/images/hero.jpg"],
  },
  alternates: {
    types: {
      "application/rss+xml": "https://marketregimes.com/rss.xml",
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${inter.variable} ${spectral.variable}`}>
      <body className="min-h-screen bg-white text-gray-900 font-sans">
        <Header user={user ? { email: user.email } : null} />
        <main>{children}</main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} Market Regime Capital. All rights reserved.
            </p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
