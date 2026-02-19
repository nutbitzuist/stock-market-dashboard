"use client";

import type { TickerData } from "@/app/api/market-data/route";

interface Props {
  data: Record<string, TickerData>;
}

const CORR_TICKERS = [
  { ticker: "SPY", label: "S&P 500" },
  { ticker: "QQQ", label: "Nasdaq" },
  { ticker: "IWM", label: "Russell" },
  { ticker: "XLK", label: "Tech" },
  { ticker: "XLE", label: "Energy" },
  { ticker: "XLF", label: "Finance" },
  { ticker: "VGK", label: "Europe" },
  { ticker: "EWJ", label: "Japan" },
  { ticker: "FXI", label: "China" },
  { ticker: "INDA", label: "India" },
  { ticker: "EWZ", label: "Brazil" },
  { ticker: "VWO", label: "EM" },
  { ticker: "GLD", label: "Gold" },
  { ticker: "TLT", label: "Bonds" },
  { ticker: "IBIT", label: "Bitcoin" },
];

function computeCorrelation(a: TickerData, b: TickerData): number {
  // Use available performance metrics as a proxy for correlation
  // (YTD, 1W, 1M, 1Y directions)
  const aVals = [a.ytd, a.week1, a.month1, a.year1];
  const bVals = [b.ytd, b.week1, b.month1, b.year1];

  const n = aVals.length;
  const meanA = aVals.reduce((s, v) => s + v, 0) / n;
  const meanB = bVals.reduce((s, v) => s + v, 0) / n;

  let num = 0, denA = 0, denB = 0;
  for (let i = 0; i < n; i++) {
    const da = aVals[i] - meanA;
    const db = bVals[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }

  const den = Math.sqrt(denA * denB);
  if (den === 0) return 0;
  return num / den;
}

function corrColor(val: number): string {
  if (val > 0.8) return "#1a6b37";
  if (val > 0.5) return "#4caf50";
  if (val > 0.2) return "#a5d6a7";
  if (val > -0.2) return "#fff9c4";
  if (val > -0.5) return "#ef9a9a";
  if (val > -0.8) return "#e53935";
  return "#b71c1c";
}

function corrTextColor(val: number): string {
  if (val > 0.8 || val < -0.8) return "#fff";
  if (val > 0.5 || val < -0.5) return "#fff";
  return "#333";
}

export default function CorrelationHeatmap({ data }: Props) {
  const available = CORR_TICKERS.filter((t) => data[t.ticker]);

  if (available.length < 3) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        CROSS-MARKET CORRELATION HEATMAP
      </h2>
      <p className="text-[9px] text-gray-500 mb-2">
        Based on YTD, 1W, 1M, 1Y performance direction similarity. Green = correlated, Red = inverse, Yellow = uncorrelated.
      </p>
      <div className="overflow-x-auto">
        <table className="text-[9px] border-collapse">
          <thead>
            <tr>
              <td className="p-1 font-bold border border-gray-300 bg-gray-100 sticky left-0 z-10"></td>
              {available.map((t) => (
                <td
                  key={t.ticker}
                  className="p-1 font-bold border border-gray-300 bg-gray-100 text-center"
                  style={{ writingMode: "vertical-rl", minWidth: "28px", height: "60px" }}
                >
                  {t.label}
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {available.map((row) => (
              <tr key={row.ticker}>
                <td className="p-1 font-bold border border-gray-300 bg-gray-100 whitespace-nowrap sticky left-0 z-10">
                  {row.label}
                </td>
                {available.map((col) => {
                  const corr =
                    row.ticker === col.ticker
                      ? 1
                      : computeCorrelation(data[row.ticker], data[col.ticker]);
                  return (
                    <td
                      key={col.ticker}
                      className="p-1 border border-gray-300 text-center font-mono"
                      style={{
                        backgroundColor: corrColor(corr),
                        color: corrTextColor(corr),
                        minWidth: "28px",
                      }}
                    >
                      {corr.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
