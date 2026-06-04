"use client";

import { useEffect, useRef } from "react";
import { MonthlyReturns, Summary } from "@/types/track-record";
import { FundingLevel, generateEquityCurve, BASELINE_EQUITY, getChartBaselineEquity } from "@/lib/funding-calculations";

interface EquityCurveCanvasProps {
  monthlyReturns: MonthlyReturns;
  summary: Summary;
  fundingLevel: FundingLevel;
}

export default function EquityCurveCanvas({ monthlyReturns, summary, fundingLevel }: EquityCurveCanvasProps) {
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
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Generate equity curves
    const strategyEquity = generateEquityCurve(monthlyReturns, fundingLevel);

    // Generate S&P 500 equity curve (always from original data at 1x)
    // We need to get the S&P 500 benchmark data
    // For now, we'll use a placeholder - in a real implementation, this would come from the database
    const sp500Equity = generateSP500Curve(monthlyReturns, summary);

    // Find min and max for Y-axis scaling
    const allValues = [...strategyEquity, ...sp500Equity];
    const minEquity = Math.min(...allValues);
    const maxEquity = Math.max(...allValues);
    const range = maxEquity - minEquity;
    const yPadding = range * 0.1;
    const yMin = minEquity - yPadding;
    const yMax = maxEquity + yPadding;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Helper function to convert equity value to Y coordinate
    const yScale = (equity: number) => {
      const normalized = (equity - yMin) / (yMax - yMin);
      return padding.top + chartHeight - (normalized * chartHeight);
    };

    // Helper function to convert index to X coordinate
    const xScale = (index: number, total: number) => {
      return padding.left + (index / (total - 1)) * chartWidth;
    };

    // Draw Y-axis grid
    ctx.strokeStyle = "rgba(0, 0, 0, 0.08)";
    ctx.lineWidth = 0.6;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = padding.top + (chartHeight / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartWidth, y);
      ctx.stroke();
    }

    // Draw drawdown shading for strategy
    const strategyPeaks: number[] = [];
    let currentPeak = strategyEquity[0];
    strategyEquity.forEach(equity => {
      if (equity > currentPeak) currentPeak = equity;
      strategyPeaks.push(currentPeak);
    });

    ctx.fillStyle = "rgba(59, 130, 246, 0.08)"; // #3b82f6 with alpha 0.08
    ctx.beginPath();
    ctx.moveTo(xScale(0, strategyEquity.length), yScale(strategyEquity[0]));

    // Draw the equity line
    for (let i = 1; i < strategyEquity.length; i++) {
      ctx.lineTo(xScale(i, strategyEquity.length), yScale(strategyEquity[i]));
    }

    // Draw back along the peaks
    for (let i = strategyEquity.length - 1; i >= 0; i--) {
      ctx.lineTo(xScale(i, strategyEquity.length), yScale(strategyPeaks[i]));
    }

    ctx.closePath();
    ctx.fill();

    // Draw S&P 500 line (gray, behind strategy)
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(xScale(0, sp500Equity.length), yScale(sp500Equity[0]));
    for (let i = 1; i < sp500Equity.length; i++) {
      ctx.lineTo(xScale(i, sp500Equity.length), yScale(sp500Equity[i]));
    }
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // Draw strategy line (blue, on top)
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(xScale(0, strategyEquity.length), yScale(strategyEquity[0]));
    for (let i = 1; i < strategyEquity.length; i++) {
      ctx.lineTo(xScale(i, strategyEquity.length), yScale(strategyEquity[i]));
    }
    ctx.stroke();

    // Draw Y-axis labels
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";

    for (let i = 0; i <= gridLines; i++) {
      const value = yMax - ((yMax - yMin) / gridLines) * i;
      const y = padding.top + (chartHeight / gridLines) * i;
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);

      ctx.fillText(formatted, padding.left - 10, y);
    }

    // Draw title
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = "14px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("Time-Weighted Returns • $100,000 Baseline", padding.left, 10);

    // Draw legend
    const legendX = padding.left + 10;
    const legendY = padding.top + 10;

    // Strategy legend item
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 30, legendY);
    ctx.stroke();

    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.font = "9px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("Strategy", legendX + 35, legendY);

    // S&P 500 legend item
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 1.8;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.moveTo(legendX, legendY + 15);
    ctx.lineTo(legendX + 30, legendY + 15);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    ctx.fillText("S&P 500", legendX + 35, legendY + 15);

    // Draw footnote
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.font = "8.5px -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillText(
      `Period: ${summary.start_date} to ${summary.data_through} • Source: IBKR Daily P&L`,
      width - padding.right,
      height - 10
    );

    // Draw axes spines
    ctx.strokeStyle = "rgba(0, 0, 0, 0.25)";
    ctx.lineWidth = 1;

    // Bottom spine
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // Left spine
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();

  }, [monthlyReturns, fundingLevel, summary]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="relative w-full" style={{ height: "450px" }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: "block" }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Generate S&P 500 equity curve
 * This stays constant regardless of funding level
 */
function generateSP500Curve(monthlyReturns: MonthlyReturns, summary: Summary): number[] {
  // For now, we'll create a synthetic S&P curve based on the cumulative return
  // In production, this should come from the actual S&P 500 data stored in the database

  const strategyEquity = generateEquityCurve(monthlyReturns, 33); // Default funding
  const numPoints = strategyEquity.length;

  // Use the S&P 500 cumulative return from summary if available
  if (summary.sp500_cumulative_return !== null) {
    const sp500FinalValue = BASELINE_EQUITY * (1 + summary.sp500_cumulative_return);
    const monthlyReturn = Math.pow(1 + summary.sp500_cumulative_return, 1 / (numPoints - 1)) - 1;

    const curve: number[] = [BASELINE_EQUITY];
    let current = BASELINE_EQUITY;
    for (let i = 1; i < numPoints; i++) {
      current *= (1 + monthlyReturn);
      curve.push(current);
    }
    return curve;
  }

  // Fallback: return flat line at baseline
  return new Array(numPoints).fill(BASELINE_EQUITY);
}
