import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Record | Market Regime Capital",
  description:
    "Transparent, auditable track record with time-weighted returns and detailed performance metrics.",
};

export default function TrackRecordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

// Revalidate every 60 seconds to pick up updates without redeploy
export const revalidate = 60;
