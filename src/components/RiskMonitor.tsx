"use client";

import type { TickerData } from "@/app/api/market-data/route";

interface Props {
  data: Record<string, TickerData>;
}

interface RiskSignal {
  label: string;
  ticker: string;
  condition: string;
  isRiskOn: boolean | null;
}

function getSignals(data: Record<string, TickerData>): RiskSignal[] {
  const signals: RiskSignal[] = [];

  const check = (ticker: string, label: string) => {
    const d = data[ticker];
    if (!d) return;

    const above50 = d.aboveSMA50;
    const above200 = d.aboveSMA200;

    let isRiskOn: boolean | null = null;
    let condition = "";

    if (above50 && above200) {
      isRiskOn = true;
      condition = "Above 50 & 200 SMA";
    } else if (above200 && !above50) {
      isRiskOn = null;
      condition = "Above 200, below 50 SMA";
    } else if (!above200 && above50) {
      isRiskOn = null;
      condition = "Below 200, above 50 SMA";
    } else {
      isRiskOn = false;
      condition = "Below 50 & 200 SMA";
    }

    signals.push({ label, ticker, condition, isRiskOn });
  };

  // US Markets
  check("SPY", "US Large Cap");
  check("QQQ", "US Tech");
  check("IWM", "US Small Cap");

  // International
  check("VGK", "Europe");
  check("EWJ", "Japan");
  check("FXI", "China");
  check("INDA", "India");
  check("EWZ", "Brazil");
  check("VWO", "Emerging Mkts");

  // Safe havens (inverted logic)
  const gld = data["GLD"];
  if (gld) {
    const goldRiskOn = gld.week1 < 0 && gld.month1 < 0;
    const goldRiskOff = gld.week1 > 0 && gld.month1 > 0;
    signals.push({
      label: "Gold",
      ticker: "GLD",
      condition: goldRiskOff ? "Rising (flight to safety)" : goldRiskOn ? "Falling (risk appetite)" : "Mixed",
      isRiskOn: goldRiskOn ? true : goldRiskOff ? false : null,
    });
  }

  const tlt = data["TLT"];
  if (tlt) {
    const bondRiskOn = tlt.week1 < 0;
    const bondRiskOff = tlt.week1 > 0;
    signals.push({
      label: "Bonds",
      ticker: "TLT",
      condition: bondRiskOff ? "Rising (flight to safety)" : bondRiskOn ? "Falling (risk appetite)" : "Flat",
      isRiskOn: bondRiskOn ? true : bondRiskOff ? false : null,
    });
  }

  const vixy = data["VIXY"];
  if (vixy) {
    const vixLow = vixy.week1 < 0;
    signals.push({
      label: "Volatility",
      ticker: "VIXY",
      condition: vixLow ? "Declining (complacency)" : "Rising (fear)",
      isRiskOn: vixLow ? true : false,
    });
  }

  return signals;
}

function getOverallScore(signals: RiskSignal[]): {
  score: number;
  label: string;
  color: string;
  bgColor: string;
} {
  const scored = signals.filter((s) => s.isRiskOn !== null);
  const riskOnCount = scored.filter((s) => s.isRiskOn === true).length;
  const score = scored.length > 0 ? (riskOnCount / scored.length) * 100 : 50;

  if (score >= 75) return { score, label: "RISK-ON", color: "text-green-800", bgColor: "bg-green-500" };
  if (score >= 55) return { score, label: "LEAN RISK-ON", color: "text-green-700", bgColor: "bg-green-400" };
  if (score >= 45) return { score, label: "NEUTRAL", color: "text-yellow-700", bgColor: "bg-yellow-400" };
  if (score >= 25) return { score, label: "LEAN RISK-OFF", color: "text-orange-700", bgColor: "bg-orange-400" };
  return { score, label: "RISK-OFF", color: "text-red-700", bgColor: "bg-red-500" };
}

export default function RiskMonitor({ data }: Props) {
  const signals = getSignals(data);
  const overall = getOverallScore(signals);

  if (signals.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        GLOBAL RISK-ON / RISK-OFF MONITOR
      </h2>

      {/* Overall Score */}
      <div className="flex items-center gap-4 mb-3 p-2 border border-gray-300 rounded">
        <div className="text-center">
          <div className="text-[9px] text-gray-500 mb-0.5">Overall Score</div>
          <div className={`text-2xl font-bold ${overall.color}`}>{overall.score.toFixed(0)}%</div>
        </div>
        <div className="flex-1">
          <div className="h-6 bg-gray-200 rounded-full overflow-hidden relative">
            <div
              className={`h-full ${overall.bgColor} transition-all duration-500 rounded-full`}
              style={{ width: `${overall.score}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-800">
              {overall.label}
            </div>
          </div>
          <div className="flex justify-between text-[8px] text-gray-400 mt-0.5">
            <span>RISK-OFF</span>
            <span>NEUTRAL</span>
            <span>RISK-ON</span>
          </div>
        </div>
      </div>

      {/* Signal Grid */}
      <div className="grid grid-cols-3 gap-1">
        {signals.map((signal) => (
          <div
            key={signal.ticker}
            className={`flex items-center gap-1.5 p-1.5 border rounded text-[10px] ${
              signal.isRiskOn === true
                ? "border-green-300 bg-green-50"
                : signal.isRiskOn === false
                ? "border-red-300 bg-red-50"
                : "border-yellow-300 bg-yellow-50"
            }`}
          >
            <span
              className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                signal.isRiskOn === true
                  ? "bg-green-500"
                  : signal.isRiskOn === false
                  ? "bg-red-500"
                  : "bg-yellow-400"
              }`}
            />
            <div className="min-w-0">
              <div className="font-bold truncate">{signal.label} <span className="text-gray-400 font-normal">({signal.ticker})</span></div>
              <div className="text-[8px] text-gray-500 truncate">{signal.condition}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
