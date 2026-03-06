import { NextRequest, NextResponse } from "next/server";

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ticker = searchParams.get("ticker");

  if (!ticker) {
    return NextResponse.json({ error: "Missing ticker parameter" }, { status: 400 });
  }

  if (!POLYGON_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  try {
    // Fetch the previous day's close (most reliable for delayed data)
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_API_KEY}`;
    const response = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No data available" }, { status: 404 });
    }

    const result = data.results[0];

    return NextResponse.json({
      ticker,
      price: result.c, // Close price
      timestamp: result.t,
    });
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
