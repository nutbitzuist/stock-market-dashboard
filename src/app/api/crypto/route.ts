import { NextResponse } from "next/server";

const TIINGO_API_KEY = process.env.TIINGO_API_KEY!;

const CRYPTO_TICKERS = [
  "btcusd", "ethusd", "solusd", "xrpusd", "adausd",
  "dogeusd", "avaxusd", "dotusd", "linkusd",
];

export interface CryptoData {
  ticker: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

const CRYPTO_NAMES: Record<string, string> = {
  btcusd: "Bitcoin",
  ethusd: "Ethereum",
  solusd: "Solana",
  xrpusd: "XRP",
  adausd: "Cardano",
  dogeusd: "Dogecoin",
  avaxusd: "Avalanche",
  dotusd: "Polkadot",
  linkusd: "Chainlink",
};

export async function GET() {
  try {
    const url = `https://api.tiingo.com/tiingo/crypto/top?tickers=${CRYPTO_TICKERS.join(",")}&token=${TIINGO_API_KEY}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
    }

    const raw = await res.json();
    const results: CryptoData[] = [];

    for (const item of raw) {
      const td = item.topOfBookData?.[0];
      if (!td) continue;

      const price = td.lastPrice || 0;
      const open = td.open || price;
      const change24h = open > 0 ? ((price - open) / open) * 100 : 0;

      results.push({
        ticker: item.ticker,
        name: CRYPTO_NAMES[item.ticker] || item.ticker,
        price,
        change24h: Math.round(change24h * 100) / 100,
        high24h: td.high || price,
        low24h: td.low || price,
        volume24h: td.volume || 0,
      });
    }

    return NextResponse.json({ data: results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Crypto API error:", error);
    return NextResponse.json({ error: "Failed to fetch crypto data" }, { status: 500 });
  }
}
