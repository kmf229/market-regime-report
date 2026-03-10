import Image from "next/image";

interface EquityCurveProps {
  imageUrl?: string | null;
}

export default function EquityCurve({ imageUrl }: EquityCurveProps) {
  // Use Supabase URL if provided, otherwise fall back to static file
  const src = imageUrl || "/track_record/equity_curve.png";

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Equity Curve</h2>
      </div>
      <div className="p-6">
        <div className="relative w-full aspect-[16/9] bg-gray-50 rounded-lg overflow-hidden">
          <Image
            src={src}
            alt="Time-weighted return equity curve showing portfolio performance"
            fill
            className="object-contain"
            priority
            unoptimized={imageUrl ? true : false}
          />
        </div>
        <p className="mt-4 text-sm text-gray-500 text-center">
          TWR-based equity curve, $100,000 baseline
        </p>
      </div>
    </div>
  );
}
