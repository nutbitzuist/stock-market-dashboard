"use client";

import { useState, useEffect, useCallback } from "react";
import type { ForexData } from "@/app/api/forex/route";

const PAIR_FLAGS: Record<string, string> = {
  eurusd: "EU/US",
  gbpusd: "UK/US",
  usdjpy: "US/JP",
  audusd: "AU/US",
  usdcnh: "US/CN",
  usdchf: "US/CH",
  usdcad: "US/CA",
  nzdusd: "NZ/US",
  usdmxn: "US/MX",
  usdthb: "US/TH",
};

export default function ForexMonitor() {
  const [data, setData] = useState<ForexData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/forex");
      if (!res.ok) return;
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Forex fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="mb-6">
        <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">FOREX MARKETS</h2>
        <div className="text-[10px] text-gray-400 p-3 text-center">Loading forex data...</div>
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        FOREX MARKETS
      </h2>
      <p className="text-[9px] text-gray-500 mb-2">Live FX rates from Tiingo Forex API. Bid/Ask/Mid prices.</p>

      <div className="border border-gray-300 rounded overflow-hidden">
        <div className="grid grid-cols-[80px_60px_100px_100px_100px_80px] gap-0 py-1 px-2 bg-gray-100 border-b border-gray-300 text-[9px] font-bold text-gray-600">
          <div>Pair</div>
          <div>Region</div>
          <div className="text-right">Bid</div>
          <div className="text-right">Ask</div>
          <div className="text-right">Mid</div>
          <div className="text-right">Spread</div>
        </div>
        {data.map((fx, idx) => {
          const spread = Math.abs(fx.askPrice - fx.bidPrice);
          const isJPY = fx.ticker.includes("jpy");
          const decimals = isJPY ? 3 : 5;
          const spreadPips = isJPY ? spread * 100 : spread * 10000;

          return (
            <div
              key={fx.ticker}
              className={`grid grid-cols-[80px_60px_100px_100px_100px_80px] gap-0 py-[4px] px-2 border-b border-gray-100 text-[10px] items-center ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              }`}
            >
              <div className="font-bold">{fx.label}</div>
              <div className="text-[8px] text-gray-400">{PAIR_FLAGS[fx.ticker] || ""}</div>
              <div className="text-right font-mono">{fx.bidPrice.toFixed(decimals)}</div>
              <div className="text-right font-mono">{fx.askPrice.toFixed(decimals)}</div>
              <div className="text-right font-mono font-bold">{fx.midPrice.toFixed(decimals)}</div>
              <div className="text-right text-gray-500">{spreadPips.toFixed(1)} pips</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
