import { NextResponse } from "next/server";

const TIINGO_API_KEY = process.env.TIINGO_API_KEY!;

const FOREX_PAIRS = ["eurusd", "gbpusd", "usdjpy", "audusd", "usdcnh", "usdchf", "usdcad", "nzdusd", "usdmxn", "usdthb"];

export interface ForexData {
  ticker: string;
  label: string;
  bidPrice: number;
  askPrice: number;
  midPrice: number;
  timestamp: string;
}

const FOREX_LABELS: Record<string, string> = {
  eurusd: "EUR/USD",
  gbpusd: "GBP/USD",
  usdjpy: "USD/JPY",
  audusd: "AUD/USD",
  usdcnh: "USD/CNH",
  usdchf: "USD/CHF",
  usdcad: "USD/CAD",
  nzdusd: "NZD/USD",
  usdmxn: "USD/MXN",
  usdthb: "USD/THB",
};

export async function GET() {
  try {
    const url = `https://api.tiingo.com/tiingo/fx/top?tickers=${FOREX_PAIRS.join(",")}&token=${TIINGO_API_KEY}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch forex data" }, { status: 500 });
    }

    const raw = await res.json();
    const results: ForexData[] = [];

    for (const item of raw) {
      if (!item) continue;
      const ticker = item.ticker || item.index || null;
      if (!ticker || typeof ticker !== "string") continue;
      if (!item.midPrice && !item.bidPrice) continue;
      results.push({
        ticker,
        label: FOREX_LABELS[ticker] || ticker.toUpperCase(),
        bidPrice: item.bidPrice || 0,
        askPrice: item.askPrice || 0,
        midPrice: item.midPrice || 0,
        timestamp: item.quoteTimestamp || "",
      });
    }

    return NextResponse.json({ data: results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Forex API error:", error);
    return NextResponse.json({ error: "Failed to fetch forex data" }, { status: 500 });
  }
}
