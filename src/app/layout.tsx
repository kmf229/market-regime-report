import type { Metadata } from "next";
import { Inter, Spectral } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import Link from "next/link";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spectral.variable}`}>
      <body className="min-h-screen bg-white text-gray-900 font-sans">
        <Header />
        <main>{children}</main>
        <footer className="bg-gray-900 text-gray-400 mt-20">
          <div className="max-w-6xl mx-auto px-6 py-12">
            {/* 4-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              {/* Column 1: Firm Info */}
              <div>
                <h3 className="text-white font-semibold mb-3 font-spectral">
                  Market Regime Capital
                </h3>
                <p className="text-sm">
                  Systematic futures management for qualified investors.
                </p>
              </div>

              {/* Column 2: Navigation */}
              <div>
                <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">
                  Navigation
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                  <li><Link href="/approach" className="hover:text-white transition-colors">Approach</Link></li>
                  <li><Link href="/track-record" className="hover:text-white transition-colors">Track Record</Link></li>
                </ul>
              </div>

              {/* Column 3: Resources */}
              <div>
                <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">
                  Resources
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/insights" className="hover:text-white transition-colors">Insights</Link></li>
                  <li><a href="https://newsletter.marketregimes.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Newsletter</a></li>
                </ul>
              </div>

              {/* Column 4: Legal */}
              <div>
                <h4 className="text-white font-medium mb-3 text-sm uppercase tracking-wide">
                  Legal
                </h4>
                <ul className="space-y-2 text-sm">
                  <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                </ul>
              </div>
            </div>

            {/* Regulatory Disclosures */}
            <div className="border-t border-gray-800 pt-8 space-y-4">
              <div className="text-xs leading-relaxed space-y-3">
                <p className="font-semibold text-gray-300">
                  IMPORTANT DISCLOSURES
                </p>

                <p>
                  <strong>Registration Status:</strong> Market Regime Capital is not currently registered as a Commodity Trading Advisor (CTA) with the Commodity Futures Trading Commission (CFTC) or the National Futures Association (NFA). This website is for informational and educational purposes only.
                </p>

                <p>
                  <strong>Past Performance:</strong> Past performance is not necessarily indicative of future results. There is a substantial risk of loss in futures trading. The track record presented represents actual executed trades under specific market conditions, which may not repeat.
                </p>

                <p>
                  <strong>No Investment Advice:</strong> The content on this website does not constitute investment advice, a recommendation, or an offer to buy or sell any securities or futures contracts. Any investment decisions should be made only after consulting with qualified financial professionals who are aware of your individual circumstances.
                </p>

                <p>
                  <strong>Risk Disclosure:</strong> Trading futures and derivatives involves substantial risk of loss and is not suitable for all investors. You should carefully consider whether trading is appropriate for you in light of your experience, objectives, financial resources, and other relevant circumstances.
                </p>
              </div>

              <p className="text-xs text-center pt-6 border-t border-gray-800">
                &copy; {new Date().getFullYear()} Market Regime Capital. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
