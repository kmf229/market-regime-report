"use client";

import { useEffect, useState } from "react";
import AlertPreferences from "@/components/AlertPreferences";

interface RegimeSidebarProps {
  regime: "bullish" | "bearish";
  userId: string;
  alertPreferences: {
    regime_change_alerts: boolean;
    weekly_digest: boolean;
  };
}

const sections = [
  { id: "overview", label: "Overview", icon: "gauge" },
  { id: "updates", label: "Daily Updates", icon: "calendar" },
];

export default function RegimeSidebar({ regime, userId, alertPreferences }: RegimeSidebarProps) {
  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  const isBullish = regime === "bullish";

  return (
    <nav className="sticky top-24 space-y-1">
      {/* Regime indicator */}
      <div
        className={`px-3 py-2 rounded-lg mb-4 ${
          isBullish ? "bg-emerald-100" : "bg-red-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isBullish ? "bg-emerald-500" : "bg-red-500"
            }`}
          ></div>
          <span
            className={`text-sm font-semibold capitalize ${
              isBullish ? "text-emerald-800" : "text-red-800"
            }`}
          >
            {regime}
          </span>
        </div>
      </div>

      {/* Section links */}
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeSection === section.id
              ? "bg-gray-900 text-white"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          {section.icon === "gauge" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          )}
          {section.icon === "calendar" && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
          {section.label}
        </button>
      ))}

      {/* Email Alerts */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 px-3">
          Email Alerts
        </div>
        <AlertPreferences userId={userId} initialPreferences={alertPreferences} />
      </div>
    </nav>
  );
}
