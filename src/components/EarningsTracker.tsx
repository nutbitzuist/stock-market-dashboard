"use client";

import type { TickerData } from "@/app/api/market-data/route";

interface Props {
  data: Record<string, TickerData>;
}

interface MacroEvent {
  date: string;
  event: string;
  region: string;
  impact: "high" | "medium" | "low";
}

// Key macro events calendar (rolling schedule)
function getUpcomingEvents(): MacroEvent[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const events: MacroEvent[] = [
    // Fed meetings (roughly every 6 weeks)
    { date: `${year}-01-29`, event: "FOMC Rate Decision", region: "US", impact: "high" },
    { date: `${year}-03-19`, event: "FOMC Rate Decision", region: "US", impact: "high" },
    { date: `${year}-05-07`, event: "FOMC Rate Decision", region: "US", impact: "high" },
    { date: `${year}-06-18`, event: "FOMC Rate Decision", region: "US", impact: "high" },
    { date: `${year}-07-30`, event: "FOMC Rate Decision", region: "US", impact: "high" },
    { date: `${year}-09-17`, event: "FOMC Rate Decision", region: "US", impact: "high" },
    { date: `${year}-10-29`, event: "FOMC Rate Decision", region: "US", impact: "high" },
    { date: `${year}-12-17`, event: "FOMC Rate Decision", region: "US", impact: "high" },

    // ECB meetings
    { date: `${year}-01-30`, event: "ECB Rate Decision", region: "EU", impact: "high" },
    { date: `${year}-03-06`, event: "ECB Rate Decision", region: "EU", impact: "high" },
    { date: `${year}-04-17`, event: "ECB Rate Decision", region: "EU", impact: "high" },
    { date: `${year}-06-05`, event: "ECB Rate Decision", region: "EU", impact: "high" },
    { date: `${year}-07-24`, event: "ECB Rate Decision", region: "EU", impact: "high" },
    { date: `${year}-09-11`, event: "ECB Rate Decision", region: "EU", impact: "high" },
    { date: `${year}-10-30`, event: "ECB Rate Decision", region: "EU", impact: "high" },
    { date: `${year}-12-18`, event: "ECB Rate Decision", region: "EU", impact: "high" },

    // BOJ meetings
    { date: `${year}-01-24`, event: "BOJ Rate Decision", region: "JP", impact: "high" },
    { date: `${year}-03-14`, event: "BOJ Rate Decision", region: "JP", impact: "high" },
    { date: `${year}-05-01`, event: "BOJ Rate Decision", region: "JP", impact: "high" },
    { date: `${year}-06-13`, event: "BOJ Rate Decision", region: "JP", impact: "high" },
    { date: `${year}-07-31`, event: "BOJ Rate Decision", region: "JP", impact: "high" },
    { date: `${year}-09-19`, event: "BOJ Rate Decision", region: "JP", impact: "high" },
    { date: `${year}-10-31`, event: "BOJ Rate Decision", region: "JP", impact: "high" },
    { date: `${year}-12-19`, event: "BOJ Rate Decision", region: "JP", impact: "high" },

    // PBOC
    { date: `${year}-01-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-02-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-03-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-04-21`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-05-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-06-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-07-21`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-08-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-09-22`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-10-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-11-20`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },
    { date: `${year}-12-22`, event: "PBOC LPR Decision", region: "CN", impact: "medium" },

    // RBI (India)
    { date: `${year}-02-07`, event: "RBI Rate Decision", region: "IN", impact: "medium" },
    { date: `${year}-04-09`, event: "RBI Rate Decision", region: "IN", impact: "medium" },
    { date: `${year}-06-06`, event: "RBI Rate Decision", region: "IN", impact: "medium" },
    { date: `${year}-08-08`, event: "RBI Rate Decision", region: "IN", impact: "medium" },
    { date: `${year}-10-08`, event: "RBI Rate Decision", region: "IN", impact: "medium" },
    { date: `${year}-12-05`, event: "RBI Rate Decision", region: "IN", impact: "medium" },

    // US Earnings Seasons
    { date: `${year}-01-13`, event: "US Q4 Earnings Season Begins", region: "US", impact: "medium" },
    { date: `${year}-04-14`, event: "US Q1 Earnings Season Begins", region: "US", impact: "medium" },
    { date: `${year}-07-14`, event: "US Q2 Earnings Season Begins", region: "US", impact: "medium" },
    { date: `${year}-10-13`, event: "US Q3 Earnings Season Begins", region: "US", impact: "medium" },

    // US Jobs Report (first Friday of each month)
    { date: `${year}-01-10`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-02-07`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-03-07`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-04-04`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-05-02`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-06-06`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-07-03`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-08-01`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-09-05`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-10-03`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-11-07`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },
    { date: `${year}-12-05`, event: "US Non-Farm Payrolls", region: "US", impact: "high" },

    // US CPI (mid-month)
    { date: `${year}-01-15`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-02-12`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-03-12`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-04-10`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-05-13`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-06-11`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-07-11`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-08-12`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-09-10`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-10-14`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-11-12`, event: "US CPI Report", region: "US", impact: "high" },
    { date: `${year}-12-10`, event: "US CPI Report", region: "US", impact: "high" },
  ];

  const nowStr = now.toISOString().split("T")[0];
  // Show past 7 days and next 30 days
  const pastDate = new Date(now);
  pastDate.setDate(pastDate.getDate() - 7);
  const pastStr = pastDate.toISOString().split("T")[0];
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + 30);
  const futureStr = futureDate.toISOString().split("T")[0];

  return events
    .filter((e) => e.date >= pastStr && e.date <= futureStr)
    .sort((a, b) => a.date.localeCompare(b.date));
}

function regionBadge(region: string): { bg: string; label: string } {
  const map: Record<string, { bg: string; label: string }> = {
    US: { bg: "bg-blue-100 text-blue-800", label: "US" },
    EU: { bg: "bg-indigo-100 text-indigo-800", label: "EU" },
    JP: { bg: "bg-pink-100 text-pink-800", label: "JP" },
    CN: { bg: "bg-red-100 text-red-800", label: "CN" },
    IN: { bg: "bg-orange-100 text-orange-800", label: "IN" },
  };
  return map[region] || { bg: "bg-gray-100 text-gray-800", label: region };
}

function impactDot(impact: string): string {
  if (impact === "high") return "bg-red-500";
  if (impact === "medium") return "bg-yellow-500";
  return "bg-green-500";
}

interface MarketPerformanceWindow {
  ticker: string;
  label: string;
  region: string;
  weekBefore: number;
  weekAfter: number;
}

function getPerformanceWindows(data: Record<string, TickerData>): MarketPerformanceWindow[] {
  const tickers = [
    { ticker: "SPY", label: "US", region: "US" },
    { ticker: "VGK", label: "Europe", region: "EU" },
    { ticker: "EWJ", label: "Japan", region: "JP" },
    { ticker: "FXI", label: "China", region: "CN" },
    { ticker: "INDA", label: "India", region: "IN" },
    { ticker: "EWZ", label: "Brazil", region: "BR" },
    { ticker: "EWY", label: "S. Korea", region: "KR" },
    { ticker: "VWO", label: "EM", region: "EM" },
  ];

  return tickers
    .filter((t) => data[t.ticker])
    .map((t) => {
      const d = data[t.ticker];
      return {
        ticker: t.ticker,
        label: t.label,
        region: t.region,
        weekBefore: d.week1,
        weekAfter: d.change1D,
      };
    });
}

export default function EarningsTracker({ data }: Props) {
  const events = getUpcomingEvents();
  const perfWindows = getPerformanceWindows(data);
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        MULTI-MARKET MACRO CALENDAR & PERFORMANCE TRACKER
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Upcoming Events */}
        <div>
          <h3 className="text-[10px] font-bold mb-1 text-gray-600">Upcoming Macro Events (Next 30 Days)</h3>
          <div className="border border-gray-300 rounded overflow-hidden max-h-[300px] overflow-y-auto">
            <div className="grid grid-cols-[75px_30px_1fr_45px] gap-0 py-1 px-2 bg-gray-100 border-b border-gray-300 text-[9px] font-bold text-gray-600 sticky top-0">
              <div>Date</div>
              <div>Region</div>
              <div>Event</div>
              <div className="text-center">Impact</div>
            </div>
            {events.length === 0 ? (
              <div className="p-3 text-center text-gray-400 text-[10px]">No events in window</div>
            ) : (
              events.map((event, idx) => {
                const isPast = event.date < today;
                const isToday = event.date === today;
                return (
                  <div
                    key={`${event.date}-${event.event}-${idx}`}
                    className={`grid grid-cols-[75px_30px_1fr_45px] gap-0 py-[3px] px-2 border-b border-gray-100 text-[10px] items-center ${
                      isToday ? "bg-yellow-50 font-bold" : isPast ? "opacity-50" : ""
                    } ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                  >
                    <div className={`${isToday ? "text-blue-600 font-bold" : "text-gray-600"}`}>
                      {event.date.slice(5)}
                      {isToday && " *"}
                    </div>
                    <div>
                      <span className={`text-[8px] px-1 py-0.5 rounded ${regionBadge(event.region).bg}`}>
                        {regionBadge(event.region).label}
                      </span>
                    </div>
                    <div className={isPast ? "line-through" : ""}>{event.event}</div>
                    <div className="flex justify-center">
                      <span className={`w-2 h-2 rounded-full ${impactDot(event.impact)}`} title={event.impact}></span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Performance Windows */}
        <div>
          <h3 className="text-[10px] font-bold mb-1 text-gray-600">Market Performance Windows</h3>
          <div className="border border-gray-300 rounded overflow-hidden">
            <div className="grid grid-cols-[60px_80px_40px_70px_70px] gap-0 py-1 px-2 bg-gray-100 border-b border-gray-300 text-[9px] font-bold text-gray-600">
              <div>Ticker</div>
              <div>Market</div>
              <div>Region</div>
              <div className="text-right">1W Perf</div>
              <div className="text-right">1D Perf</div>
            </div>
            {perfWindows.map((pw, idx) => (
              <div
                key={pw.ticker}
                className={`grid grid-cols-[60px_80px_40px_70px_70px] gap-0 py-[3px] px-2 border-b border-gray-100 text-[10px] items-center ${
                  idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <div className="font-bold">{pw.ticker}</div>
                <div className="text-gray-600">{pw.label}</div>
                <div>
                  <span className={`text-[8px] px-1 py-0.5 rounded ${regionBadge(pw.region).bg}`}>
                    {pw.region}
                  </span>
                </div>
                <div className={`text-right ${pw.weekBefore >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {pw.weekBefore.toFixed(2)}%
                </div>
                <div className={`text-right ${pw.weekAfter >= 0 ? "text-green-700" : "text-red-600"}`}>
                  {pw.weekAfter.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-2 flex gap-3 text-[8px] text-gray-500">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> High Impact
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span> Medium Impact
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span> Low Impact
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
