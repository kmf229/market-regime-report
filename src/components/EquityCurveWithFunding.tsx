"use client";

import Image from "next/image";
import { FundingLevel } from "@/lib/funding-calculations";

interface EquityCurveWithFundingProps {
  equityCurveUrl: string | null;
  equityCurveUrl50: string | null;
  equityCurveUrl75: string | null;
  equityCurveUrl100: string | null;
  fundingLevel: FundingLevel;
}

export default function EquityCurveWithFunding({
  equityCurveUrl,
  equityCurveUrl50,
  equityCurveUrl75,
  equityCurveUrl100,
  fundingLevel
}: EquityCurveWithFundingProps) {
  // Select the correct image URL based on funding level
  const getImageUrl = () => {
    switch (fundingLevel) {
      case 33:
        return equityCurveUrl || "/track_record/equity_curve.png";
      case 50:
        return equityCurveUrl50 || equityCurveUrl || "/track_record/equity_curve.png";
      case 75:
        return equityCurveUrl75 || equityCurveUrl || "/track_record/equity_curve.png";
      case 100:
        return equityCurveUrl100 || equityCurveUrl || "/track_record/equity_curve.png";
      default:
        return equityCurveUrl || "/track_record/equity_curve.png";
    }
  };

  const imageSrc = getImageUrl();

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Equity Curve</h2>
      </div>
      <div className="p-6">
        <div className="relative w-full aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={imageSrc}
            alt="Time-weighted return equity curve showing portfolio performance"
            fill
            className="object-contain"
            priority
            unoptimized={true}
          />
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          TWR-based equity curve, $100,000 baseline • Adjusted for {fundingLevel}% funding
        </p>
      </div>
    </div>
  );
}
