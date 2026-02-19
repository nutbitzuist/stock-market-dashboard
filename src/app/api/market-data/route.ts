import { NextResponse } from "next/server";
import { ALL_TICKERS } from "@/lib/tickers";

const TIINGO_API_KEY = process.env.TIINGO_API_KEY!;
const TIINGO_BASE = "https://api.tiingo.com";

interface TiingoEOD {
  adjClose: number;
  adjHigh: number;
  adjLow: number;
  adjOpen: number;
  adjVolume: number;
  close: number;
  date: string;
  divCash: number;
  high: number;
  low: number;
  open: number;
  splitFactor: number;
  volume: number;
}

interface TiingoIEX {
  ticker: string;
  last: number;
  prevClose: number;
  tngoLast: number;
  timestamp: string;
}

export interface TickerData {
  ticker: string;
  price: number;
  change1D: number;
  ytd: number;
  week1: number;
  month1: number;
  year1: number;
  pctFrom52wHigh: number;
  sma10: number | null;
  sma20: number | null;
  sma50: number | null;
  sma200: number | null;
  aboveSMA10: boolean | null;
  aboveSMA20: boolean | null;
  aboveSMA50: boolean | null;
  aboveSMA200: boolean | null;
  above50and200: boolean | null;
}

async function fetchJSON(url: string) {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${TIINGO_API_KEY}`,
    },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    console.error(`Tiingo error for ${url}: ${res.status} ${res.statusText}`);
    return null;
  }
  return res.json();
}

function calcPerformance(prices: number[], currentPrice: number, daysAgo: number): number {
  if (prices.length < daysAgo + 1) return 0;
  const pastPrice = prices[prices.length - 1 - daysAgo];
  if (!pastPrice) return 0;
  return ((currentPrice - pastPrice) / pastPrice) * 100;
}

function calcSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const slice = prices.slice(prices.length - period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

export async function GET() {
  try {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 400); // ~13 months for 200 SMA + YTD
    const startStr = startDate.toISOString().split("T")[0];
    const endStr = today.toISOString().split("T")[0];

    // Get the start of the current year for YTD
    const yearStart = new Date(today.getFullYear(), 0, 1);
    const yearStartStr = yearStart.toISOString().split("T")[0];

    const results: Record<string, TickerData> = {};

    // Fetch historical data for all tickers in parallel (batched)
    const batchSize = 10;
    const batches: string[][] = [];
    for (let i = 0; i < ALL_TICKERS.length; i += batchSize) {
      batches.push(ALL_TICKERS.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const promises = batch.map(async (ticker) => {
        try {
          // Fetch historical EOD data
          const eodUrl = `${TIINGO_BASE}/tiingo/daily/${ticker}/prices?startDate=${startStr}&endDate=${endStr}&token=${TIINGO_API_KEY}`;
          const eodData: TiingoEOD[] | null = await fetchJSON(eodUrl);

          if (!eodData || eodData.length === 0) {
            return null;
          }

          const closePrices = eodData.map((d) => d.adjClose);
          const currentPrice = closePrices[closePrices.length - 1];
          const dates = eodData.map((d) => d.date.split("T")[0]);

          // 1D change
          const change1D =
            closePrices.length >= 2
              ? ((currentPrice - closePrices[closePrices.length - 2]) /
                  closePrices[closePrices.length - 2]) *
                100
              : 0;

          // YTD: find the last trading day of previous year
          let ytdBasePrice = closePrices[0];
          for (let i = 0; i < dates.length; i++) {
            if (dates[i] >= yearStartStr) {
              ytdBasePrice = i > 0 ? closePrices[i - 1] : closePrices[0];
              break;
            }
          }
          const ytd = ((currentPrice - ytdBasePrice) / ytdBasePrice) * 100;

          // 1 Week (~5 trading days)
          const week1 = calcPerformance(closePrices, currentPrice, 5);

          // 1 Month (~21 trading days)
          const month1 = calcPerformance(closePrices, currentPrice, 21);

          // 1 Year (~252 trading days)
          const year1 = calcPerformance(closePrices, currentPrice, 252);

          // 52-week high
          const last252 = closePrices.slice(Math.max(0, closePrices.length - 252));
          const high52w = Math.max(...last252);
          const pctFrom52wHigh = ((currentPrice - high52w) / high52w) * 100;

          // SMAs
          const sma10 = calcSMA(closePrices, 10);
          const sma20 = calcSMA(closePrices, 20);
          const sma50 = calcSMA(closePrices, 50);
          const sma200 = calcSMA(closePrices, 200);

          const data: TickerData = {
            ticker,
            price: Math.round(currentPrice * 100) / 100,
            change1D: Math.round(change1D * 100) / 100,
            ytd: Math.round(ytd * 100) / 100,
            week1: Math.round(week1 * 100) / 100,
            month1: Math.round(month1 * 100) / 100,
            year1: Math.round(year1 * 100) / 100,
            pctFrom52wHigh: Math.round(pctFrom52wHigh * 100) / 100,
            sma10,
            sma20,
            sma50,
            sma200,
            aboveSMA10: sma10 !== null ? currentPrice > sma10 : null,
            aboveSMA20: sma20 !== null ? currentPrice > sma20 : null,
            aboveSMA50: sma50 !== null ? currentPrice > sma50 : null,
            aboveSMA200: sma200 !== null ? currentPrice > sma200 : null,
            above50and200: sma50 !== null && sma200 !== null ? sma50 > sma200 : null,
          };

          return { ticker, data };
        } catch (err) {
          console.error(`Error fetching ${ticker}:`, err);
          return null;
        }
      });

      const batchResults = await Promise.all(promises);
      for (const result of batchResults) {
        if (result) {
          results[result.ticker] = result.data;
        }
      }
    }

    return NextResponse.json({
      data: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Market data API error:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
