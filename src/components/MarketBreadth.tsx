"use client";

import type { TickerData } from "@/app/api/market-data/route";

interface Props {
  data: Record<string, TickerData>;
}

interface BreadthMetric {
  label: string;
  above: number;
  total: number;
  pct: number;
}

function BreadthBar({ pct, label, count }: { pct: number; label: string; count: string }) {
  let barColor = "#22c55e";
  if (pct < 30) barColor = "#ef4444";
  else if (pct < 50) barColor = "#f59e0b";
  else if (pct < 70) barColor = "#84cc16";

  return (
    <div className="flex items-center gap-2">
      <div className="w-[90px] text-[9px] text-gray-600 text-right shrink-0">{label}</div>
      <div className="flex-1 h-[14px] bg-gray-200 rounded overflow-hidden relative">
        <div
          className="h-full rounded transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-gray-800">
          {pct.toFixed(1)}% ({count})
        </div>
      </div>
    </div>
  );
}

function MiniGauge({ value, label }: { value: number; label: string }) {
  let color = "text-green-700";
  let bg = "bg-green-100";
  let status = "Bullish";
  if (value < 30) { color = "text-red-700"; bg = "bg-red-100"; status = "Bearish"; }
  else if (value < 50) { color = "text-orange-700"; bg = "bg-orange-100"; status = "Weak"; }
  else if (value < 70) { color = "text-yellow-700"; bg = "bg-yellow-100"; status = "Neutral"; }

  return (
    <div className={`border rounded p-2 text-center ${bg}`}>
      <div className="text-[9px] text-gray-500 mb-0.5">{label}</div>
      <div className={`text-xl font-bold ${color}`}>{value.toFixed(0)}%</div>
      <div className={`text-[9px] font-bold ${color}`}>{status}</div>
    </div>
  );
}

export default function MarketBreadth({ data }: Props) {
  const allTickers = Object.values(data);
  if (allTickers.length === 0) return null;

  // Calculate breadth metrics
  const calcBreadth = (key: keyof TickerData, label: string): BreadthMetric => {
    const valid = allTickers.filter((t) => t[key] !== null);
    const above = valid.filter((t) => t[key] === true);
    return {
      label,
      above: above.length,
      total: valid.length,
      pct: valid.length > 0 ? (above.length / valid.length) * 100 : 0,
    };
  };

  const sma10 = calcBreadth("aboveSMA10", "Above 10 SMA");
  const sma20 = calcBreadth("aboveSMA20", "Above 20 SMA");
  const sma50 = calcBreadth("aboveSMA50", "Above 50 SMA");
  const sma200 = calcBreadth("aboveSMA200", "Above 200 SMA");
  const golden = calcBreadth("above50and200", "50 > 200 SMA");

  // Performance-based breadth
  const positive1D = allTickers.filter((t) => t.change1D > 0).length;
  const positive1W = allTickers.filter((t) => t.week1 > 0).length;
  const positive1M = allTickers.filter((t) => t.month1 > 0).length;
  const positiveYTD = allTickers.filter((t) => t.ytd > 0).length;

  const total = allTickers.length;
  const pct1D = (positive1D / total) * 100;
  const pct1W = (positive1W / total) * 100;
  const pct1M = (positive1M / total) * 100;
  const pctYTD = (positiveYTD / total) * 100;

  // Near 52w high
  const near52wHigh = allTickers.filter((t) => Math.abs(t.pctFrom52wHigh) <= 5).length;
  const far52wHigh = allTickers.filter((t) => Math.abs(t.pctFrom52wHigh) > 20).length;

  // Composite breadth score
  const compositeScore = (sma50.pct * 0.3 + sma200.pct * 0.3 + pctYTD * 0.2 + pct1M * 0.2);

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        MARKET BREADTH DASHBOARD
      </h2>
      <p className="text-[9px] text-gray-500 mb-2">
        Breadth analysis across all {total} tracked tickers. Measures market participation and internal strength.
      </p>

      <div className="grid grid-cols-[1fr_1fr_200px] gap-4">
        {/* SMA Breadth */}
        <div>
          <h3 className="text-[10px] font-bold mb-1.5 text-gray-600 border-b border-gray-200 pb-0.5">
            Trend Breadth (% Above SMA)
          </h3>
          <div className="space-y-1.5">
            <BreadthBar pct={sma10.pct} label={sma10.label} count={`${sma10.above}/${sma10.total}`} />
            <BreadthBar pct={sma20.pct} label={sma20.label} count={`${sma20.above}/${sma20.total}`} />
            <BreadthBar pct={sma50.pct} label={sma50.label} count={`${sma50.above}/${sma50.total}`} />
            <BreadthBar pct={sma200.pct} label={sma200.label} count={`${sma200.above}/${sma200.total}`} />
            <BreadthBar pct={golden.pct} label={golden.label} count={`${golden.above}/${golden.total}`} />
          </div>
        </div>

        {/* Performance Breadth */}
        <div>
          <h3 className="text-[10px] font-bold mb-1.5 text-gray-600 border-b border-gray-200 pb-0.5">
            Performance Breadth (% Positive)
          </h3>
          <div className="space-y-1.5">
            <BreadthBar pct={pct1D} label="Positive 1D" count={`${positive1D}/${total}`} />
            <BreadthBar pct={pct1W} label="Positive 1W" count={`${positive1W}/${total}`} />
            <BreadthBar pct={pct1M} label="Positive 1M" count={`${positive1M}/${total}`} />
            <BreadthBar pct={pctYTD} label="Positive YTD" count={`${positiveYTD}/${total}`} />
            <BreadthBar
              pct={(near52wHigh / total) * 100}
              label="Near 52w High"
              count={`${near52wHigh}/${total}`}
            />
          </div>

          <div className="mt-2 flex gap-2 text-[9px]">
            <div className="border rounded px-2 py-1 bg-green-50 border-green-200">
              <span className="text-green-700 font-bold">{near52wHigh}</span> within 5% of 52w high
            </div>
            <div className="border rounded px-2 py-1 bg-red-50 border-red-200">
              <span className="text-red-700 font-bold">{far52wHigh}</span> more than 20% from 52w high
            </div>
          </div>
        </div>

        {/* Composite Gauges */}
        <div>
          <h3 className="text-[10px] font-bold mb-1.5 text-gray-600 border-b border-gray-200 pb-0.5">
            Composite Scores
          </h3>
          <div className="space-y-2">
            <MiniGauge value={compositeScore} label="Overall Breadth" />
            <MiniGauge value={sma200.pct} label="Long-Term Health" />
            <MiniGauge value={pct1D} label="Today's Breadth" />
          </div>
        </div>
      </div>
    </div>
  );
}
