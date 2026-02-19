"use client";

import type { TickerData } from "@/app/api/market-data/route";

interface Props {
  data: Record<string, TickerData>;
}

interface SectorPoint {
  ticker: string;
  label: string;
  momentum: number;  // 1M performance (Y-axis: leading/lagging)
  acceleration: number; // 1W - 1M (X-axis: improving/weakening)
  size: number; // YTD performance for bubble size
  color: string;
}

const SECTOR_CONFIG = [
  { ticker: "XLK", label: "Tech", color: "#3b82f6" },
  { ticker: "XLF", label: "Finance", color: "#10b981" },
  { ticker: "XLE", label: "Energy", color: "#f59e0b" },
  { ticker: "XLV", label: "Health", color: "#ef4444" },
  { ticker: "XLI", label: "Industrial", color: "#8b5cf6" },
  { ticker: "XLP", label: "Consumer", color: "#ec4899" },
  { ticker: "XLU", label: "Utilities", color: "#06b6d4" },
  { ticker: "SOXX", label: "Semis", color: "#6366f1" },
  { ticker: "IBB", label: "Biotech", color: "#14b8a6" },
  { ticker: "ITB", label: "Builders", color: "#f97316" },
  { ticker: "CIBR", label: "Cyber", color: "#a855f7" },
  { ticker: "BLOK", label: "Crypto", color: "#eab308" },
];

function getQuadrant(momentum: number, acceleration: number): { label: string; color: string } {
  if (momentum > 0 && acceleration > 0) return { label: "LEADING", color: "text-green-700" };
  if (momentum > 0 && acceleration <= 0) return { label: "WEAKENING", color: "text-yellow-700" };
  if (momentum <= 0 && acceleration <= 0) return { label: "LAGGING", color: "text-red-700" };
  return { label: "IMPROVING", color: "text-blue-700" };
}

export default function SectorRotation({ data }: Props) {
  const points: SectorPoint[] = SECTOR_CONFIG
    .filter((s) => data[s.ticker])
    .map((s) => {
      const d = data[s.ticker];
      const momentum = d.month1;
      const acceleration = d.week1 - (d.month1 / 4); // weekly vs avg weekly from monthly
      return {
        ticker: s.ticker,
        label: s.label,
        momentum,
        acceleration,
        size: Math.abs(d.ytd),
        color: s.color,
      };
    });

  if (points.length === 0) return null;

  // Scale for the chart
  const maxMom = Math.max(...points.map((p) => Math.abs(p.momentum)), 3);
  const maxAcc = Math.max(...points.map((p) => Math.abs(p.acceleration)), 2);

  const chartW = 500;
  const chartH = 300;
  const padX = 45;
  const padY = 25;
  const innerW = chartW - padX * 2;
  const innerH = chartH - padY * 2;

  function toX(acc: number): number {
    return padX + ((acc + maxAcc) / (2 * maxAcc)) * innerW;
  }
  function toY(mom: number): number {
    return padY + ((maxMom - mom) / (2 * maxMom)) * innerH;
  }

  const quadrants = [
    { label: "IMPROVING", x: padX + innerW * 0.25, y: padY + innerH * 0.75, color: "#3b82f6" },
    { label: "LEADING", x: padX + innerW * 0.75, y: padY + innerH * 0.25, color: "#22c55e" },
    { label: "LAGGING", x: padX + innerW * 0.25, y: padY + innerH * 0.25, color: "#ef4444" },
    { label: "WEAKENING", x: padX + innerW * 0.75, y: padY + innerH * 0.75, color: "#eab308" },
  ];

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        SECTOR ROTATION MAP
      </h2>
      <p className="text-[9px] text-gray-500 mb-2">
        X-axis: Acceleration (1W vs avg 1M weekly). Y-axis: Momentum (1M performance). Bubble size: |YTD|.
      </p>

      <div className="flex gap-4">
        {/* Chart */}
        <div className="border border-gray-300 rounded bg-white p-1">
          <svg width={chartW} height={chartH} className="text-[9px]">
            {/* Background quadrants */}
            <rect x={padX} y={padY} width={innerW / 2} height={innerH / 2} fill="#fef2f2" opacity="0.5" />
            <rect x={padX + innerW / 2} y={padY} width={innerW / 2} height={innerH / 2} fill="#f0fdf4" opacity="0.5" />
            <rect x={padX} y={padY + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#eff6ff" opacity="0.5" />
            <rect x={padX + innerW / 2} y={padY + innerH / 2} width={innerW / 2} height={innerH / 2} fill="#fefce8" opacity="0.5" />

            {/* Quadrant labels */}
            {quadrants.map((q) => (
              <text key={q.label} x={q.x} y={q.y} textAnchor="middle" fill={q.color} fontSize="9" fontWeight="bold" opacity="0.4">
                {q.label}
              </text>
            ))}

            {/* Axes */}
            <line x1={padX} y1={toY(0)} x2={padX + innerW} y2={toY(0)} stroke="#999" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1={toX(0)} y1={padY} x2={toX(0)} y2={padY + innerH} stroke="#999" strokeWidth="0.5" strokeDasharray="3,3" />

            {/* Axis labels */}
            <text x={chartW / 2} y={chartH - 3} textAnchor="middle" fill="#666" fontSize="8">Acceleration →</text>
            <text x={8} y={chartH / 2} textAnchor="middle" fill="#666" fontSize="8" transform={`rotate(-90, 8, ${chartH / 2})`}>Momentum →</text>

            {/* Data points */}
            {points.map((p) => {
              const cx = toX(p.acceleration);
              const cy = toY(p.momentum);
              const r = Math.max(6, Math.min(18, p.size * 0.8));
              return (
                <g key={p.ticker}>
                  <circle cx={cx} cy={cy} r={r} fill={p.color} opacity="0.7" stroke={p.color} strokeWidth="1" />
                  <text x={cx} y={cy - r - 3} textAnchor="middle" fill="#333" fontSize="8" fontWeight="bold">
                    {p.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend table */}
        <div className="flex-1">
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="grid grid-cols-[60px_55px_55px_55px_70px] gap-0 py-1 px-2 bg-gray-100 border-b border-gray-300 text-[9px] font-bold text-gray-600">
              <div>Sector</div>
              <div className="text-right">1W</div>
              <div className="text-right">1M</div>
              <div className="text-right">YTD</div>
              <div className="text-center">Quadrant</div>
            </div>
            {points
              .sort((a, b) => b.momentum - a.momentum)
              .map((p, idx) => {
                const d = data[p.ticker];
                const q = getQuadrant(p.momentum, p.acceleration);
                return (
                  <div
                    key={p.ticker}
                    className={`grid grid-cols-[60px_55px_55px_55px_70px] gap-0 py-[3px] px-2 border-b border-gray-100 text-[10px] items-center ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                      <span className="font-bold text-[9px]">{p.label}</span>
                    </div>
                    <div className={`text-right ${d.week1 >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {d.week1.toFixed(2)}%
                    </div>
                    <div className={`text-right ${d.month1 >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {d.month1.toFixed(2)}%
                    </div>
                    <div className={`text-right ${d.ytd >= 0 ? "text-green-700" : "text-red-600"}`}>
                      {d.ytd.toFixed(2)}%
                    </div>
                    <div className={`text-center text-[8px] font-bold ${q.color}`}>
                      {q.label}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
