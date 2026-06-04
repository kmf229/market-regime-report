"use client";

import { useEffect, useRef } from "react";
import { MonthlyReturns } from "@/types/track-record";
import { FundingLevel, generateEquityCurve, getStartingEquity } from "@/lib/funding-calculations";

interface EquityCurveProps {
  imageUrl?: string | null;
  monthlyReturns: MonthlyReturns;
  fundingLevel: FundingLevel;
}

export default function EquityCurve({ imageUrl, monthlyReturns, fundingLevel }: EquityCurveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size (2x for retina)
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    const width = rect.width;
    const height = rect.height;

    // Generate equity curve data
    const equityCurve = generateEquityCurve(monthlyReturns, fundingLevel);
    const startingEquity = getStartingEquity(fundingLevel);

    // Find min and max for scaling
    const minEquity = Math.min(...equityCurve);
    const maxEquity = Math.max(...equityCurve);
    const range = maxEquity - minEquity;
    const padding = range * 0.1; // 10% padding

    // Clear canvas
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, width, height);

    // Draw grid lines
    const gridLines = 5;
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;

    for (let i = 0; i <= gridLines; i++) {
      const y = (height / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw equity curve
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 2;
    ctx.beginPath();

    equityCurve.forEach((equity, index) => {
      const x = (width / (equityCurve.length - 1)) * index;
      const y = height - ((equity - minEquity + padding) / (range + 2 * padding)) * height;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw Y-axis labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "11px Inter, sans-serif";
    ctx.textAlign = "left";

    for (let i = 0; i <= gridLines; i++) {
      const value = maxEquity + padding - ((range + 2 * padding) / gridLines) * i;
      const y = (height / gridLines) * i;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

      ctx.fillText(formatted, 5, y + 4);
    }

  }, [monthlyReturns, fundingLevel]);

  const startingEquity = getStartingEquity(fundingLevel);
  const formattedStartingEquity = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(startingEquity);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Equity Curve</h2>
      </div>
      <div className="p-6">
        <div className="relative w-full aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: "block" }}
          />
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          TWR-based equity curve, {formattedStartingEquity} starting equity at {fundingLevel}% funding
        </p>
      </div>
    </div>
  );
}
