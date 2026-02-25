import type { Metadata } from "next";
import { Inter, Spectral } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

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
  title: "The Market Regime Report",
  description:
    "A rules-based approach to navigating markets — without prediction, stress, or noise. Systematic investing with full transparency.",
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
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-5xl mx-auto px-6 py-8">
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} The Market Regime Report. All rights reserved.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
