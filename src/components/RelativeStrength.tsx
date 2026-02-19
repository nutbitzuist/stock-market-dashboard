"use client";

import type { TickerData } from "@/app/api/market-data/route";

interface Props {
  data: Record<string, TickerData>;
}

interface RankedItem {
  ticker: string;
  label: string;
  region: string;
  ytd: number;
  month1: number;
  week1: number;
  compositeScore: number;
}

const RANK_TICKERS = [
  { ticker: "SPY", label: "US Large Cap", region: "US" },
  { ticker: "QQQ", label: "US Tech", region: "US" },
  { ticker: "IWM", label: "US Small Cap", region: "US" },
  { ticker: "VGK", label: "Europe", region: "DM" },
  { ticker: "EWG", label: "Germany", region: "DM" },
  { ticker: "EWU", label: "UK", region: "DM" },
  { ticker: "EWJ", label: "Japan", region: "DM" },
  { ticker: "EWA", label: "Australia", region: "DM" },
  { ticker: "EWC", label: "Canada", region: "DM" },
  { ticker: "EWL", label: "Switzerland", region: "DM" },
  { ticker: "FXI", label: "China", region: "EM" },
  { ticker: "INDA", label: "India", region: "EM" },
  { ticker: "EWZ", label: "Brazil", region: "EM" },
  { ticker: "EWY", label: "S. Korea", region: "EM" },
  { ticker: "EWT", label: "Taiwan", region: "EM" },
  { ticker: "EWW", label: "Mexico", region: "EM" },
  { ticker: "THD", label: "Thailand", region: "EM" },
  { ticker: "VNM", label: "Vietnam", region: "EM" },
  { ticker: "EIDO", label: "Indonesia", region: "EM" },
  { ticker: "VWO", label: "EM Broad", region: "EM" },
];

function regionColor(region: string): string {
  if (region === "US") return "bg-blue-100 text-blue-800";
  if (region === "DM") return "bg-purple-100 text-purple-800";
  return "bg-orange-100 text-orange-800";
}

function barWidth(val: number, max: number): number {
  if (max === 0) return 0;
  return Math.max(0, Math.min(100, (val / max) * 100));
}

export default function RelativeStrength({ data }: Props) {
  const items: RankedItem[] = RANK_TICKERS
    .filter((t) => data[t.ticker])
    .map((t) => {
      const d = data[t.ticker];
      const compositeScore = d.ytd * 0.4 + d.month1 * 0.35 + d.week1 * 0.25;
      return {
        ticker: t.ticker,
        label: t.label,
        region: t.region,
        ytd: d.ytd,
        month1: d.month1,
        week1: d.week1,
        compositeScore,
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);

  if (items.length === 0) return null;

  const maxScore = Math.max(...items.map((i) => Math.abs(i.compositeScore)), 1);

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        RELATIVE STRENGTH RANKING
      </h2>
      <p className="text-[9px] text-gray-500 mb-2">
        Composite score: 40% YTD + 35% 1M + 25% 1W. Ranked by momentum strength across global markets.
      </p>

      <div className="border border-gray-300 rounded overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[30px_50px_100px_50px_60px_60px_60px_1fr] gap-0 py-1 px-2 bg-gray-100 border-b border-gray-300 text-[9px] font-bold text-gray-600">
          <div>#</div>
          <div>Ticker</div>
          <div>Market</div>
          <div>Region</div>
          <div className="text-right">% YTD</div>
          <div className="text-right">% 1M</div>
          <div className="text-right">% 1W</div>
          <div className="text-center">Composite Score</div>
        </div>

        {/* Rows */}
        {items.map((item, idx) => (
          <div
            key={item.ticker}
            className={`grid grid-cols-[30px_50px_100px_50px_60px_60px_60px_1fr] gap-0 py-[3px] px-2 border-b border-gray-100 items-center text-[10px] ${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            } ${idx < 3 ? "font-bold" : ""}`}
          >
            <div className={`${idx < 3 ? "text-green-700" : idx >= items.length - 3 ? "text-red-600" : "text-gray-500"}`}>
              {idx + 1}
            </div>
            <div className="font-bold">{item.ticker}</div>
            <div className="text-gray-600">{item.label}</div>
            <div>
              <span className={`text-[8px] px-1.5 py-0.5 rounded ${regionColor(item.region)}`}>
                {item.region}
              </span>
            </div>
            <div className={`text-right ${item.ytd > 0 ? "text-green-700" : "text-red-600"}`}>
              {item.ytd.toFixed(2)}%
            </div>
            <div className={`text-right ${item.month1 > 0 ? "text-green-700" : "text-red-600"}`}>
              {item.month1.toFixed(2)}%
            </div>
            <div className={`text-right ${item.week1 > 0 ? "text-green-700" : "text-red-600"}`}>
              {item.week1.toFixed(2)}%
            </div>
            <div className="flex items-center gap-1 px-1">
              {item.compositeScore >= 0 ? (
                <div className="flex-1 flex justify-start">
                  <div className="w-1/2"></div>
                  <div className="w-1/2 h-[10px] bg-gray-100 overflow-hidden rounded-r">
                    <div
                      className="h-full bg-green-500 rounded-r"
                      style={{ width: `${barWidth(item.compositeScore, maxScore)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex justify-start">
                  <div className="w-1/2 h-[10px] bg-gray-100 overflow-hidden rounded-l flex justify-end">
                    <div
                      className="h-full bg-red-500 rounded-l"
                      style={{ width: `${barWidth(Math.abs(item.compositeScore), maxScore)}%` }}
                    />
                  </div>
                  <div className="w-1/2"></div>
                </div>
              )}
              <span className={`text-[9px] w-[45px] text-right ${item.compositeScore >= 0 ? "text-green-700" : "text-red-600"}`}>
                {item.compositeScore.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
