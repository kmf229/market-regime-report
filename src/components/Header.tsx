"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavLink from "./NavLink";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/track-record", label: "Track Record" },
    { href: "/about", label: "About" },
    { href: "https://newsletter.marketregimes.com", label: "Newsletter", external: true },
  ];

  return (
    <header className="bg-white">
      <div className="px-6 py-4">
        {/* Top row: Logo and navigation */}
        <nav className="flex items-center justify-between md:justify-start gap-6">
          {/* Hamburger button - mobile only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -ml-2 text-gray-600 hover:text-gray-900"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

          <Link
            href="/"
            className="hover:opacity-80 transition-opacity"
          >
            <Image
              src="/images/logo.png"
              alt="The Market Regime Report"
              width={40}
              height={40}
              className="rounded"
            />
          </Link>

          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} external={item.external}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile navigation menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-100 pt-4">
            <ul className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    external={item.external}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Second row: Centered title */}
        <div className="text-center mt-4">
          <Link
            href="/"
            className="text-2xl md:text-4xl font-semibold text-gray-900 hover:text-gray-700 transition-colors font-spectral"
          >
            The Market Regime Report
          </Link>
        </div>
      </div>
    </header>
  );
}
