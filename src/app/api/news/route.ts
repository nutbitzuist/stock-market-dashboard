import { NextResponse } from "next/server";

const TIINGO_API_KEY = process.env.TIINGO_API_KEY!;

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedDate: string;
  tickers: string[];
  description: string;
}

export async function GET() {
  try {
    const url = `https://api.tiingo.com/tiingo/news?token=${TIINGO_API_KEY}&limit=20&sortBy=publishedDate`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
    }

    const raw = await res.json();
    const results: NewsItem[] = raw.map((item: Record<string, unknown>) => ({
      id: String(item.id || ""),
      title: String(item.title || ""),
      url: String(item.url || ""),
      source: String(item.source || ""),
      publishedDate: String(item.publishedDate || ""),
      tickers: (item.tickers as string[] || []).slice(0, 5),
      description: String(item.description || "").slice(0, 200),
    }));

    return NextResponse.json({ data: results, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("News API error:", error);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
