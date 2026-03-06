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
    // Get today's date
    const today = new Date().toISOString().split("T")[0];

    // Fetch the latest minute bar for today (15-min delayed)
    const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/minute/${today}/${today}?apiKey=${POLYGON_API_KEY}&limit=1&sort=desc`;
    const response = await fetch(url, { next: { revalidate: 60 } }); // Cache for 60 seconds

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();

    // If no data for today (weekend/holiday or before market open), fall back to previous close
    if (!data.results || data.results.length === 0) {
      const prevUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?apiKey=${POLYGON_API_KEY}`;
      const prevResponse = await fetch(prevUrl, { next: { revalidate: 60 } });

      if (!prevResponse.ok) {
        throw new Error(`Polygon API error: ${prevResponse.status}`);
      }

      const prevData = await prevResponse.json();

      if (!prevData.results || prevData.results.length === 0) {
        return NextResponse.json({ error: "No data available" }, { status: 404 });
      }

      return NextResponse.json({
        ticker,
        price: prevData.results[0].c,
        timestamp: prevData.results[0].t,
        isDelayed: true,
        isPreviousClose: true,
      });
    }

    const result = data.results[0];

    return NextResponse.json({
      ticker,
      price: result.c, // Close price of latest minute bar
      timestamp: result.t,
      isDelayed: true,
      isPreviousClose: false,
    });
  } catch (error) {
    console.error("Error fetching stock price:", error);
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}
