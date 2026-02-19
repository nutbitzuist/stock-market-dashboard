"use client";

import { useState, useEffect, useCallback } from "react";
import type { CryptoData } from "@/app/api/crypto/route";

function formatPrice(price: number): string {
  if (price >= 1000) return price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(4);
  return price.toFixed(6);
}

function formatVolume(vol: number): string {
  if (vol >= 1e9) return (vol / 1e9).toFixed(2) + "B";
  if (vol >= 1e6) return (vol / 1e6).toFixed(2) + "M";
  if (vol >= 1e3) return (vol / 1e3).toFixed(1) + "K";
  return vol.toFixed(0);
}

export default function CryptoDashboard() {
  const [data, setData] = useState<CryptoData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/crypto");
      if (!res.ok) return;
      const json = await res.json();
      setData(json.data || []);
    } catch (err) {
      console.error("Crypto fetch error:", err);
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
        <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">CRYPTO MARKETS</h2>
        <div className="text-[10px] text-gray-400 p-3 text-center">Loading crypto data...</div>
      </div>
    );
  }

  if (data.length === 0) return null;

  return (
    <div className="mb-6">
      <h2 className="text-sm font-bold tracking-widest mb-2 border-b-2 border-gray-800 pb-1">
        CRYPTO MARKETS
      </h2>
      <p className="text-[9px] text-gray-500 mb-2">Live prices from Tiingo Crypto API. Aggregated across multiple exchanges.</p>

      <div className="grid grid-cols-3 gap-2">
        {data.map((coin) => {
          const isUp = coin.change24h >= 0;
          const range = coin.high24h - coin.low24h;
          const posInRange = range > 0 ? ((coin.price - coin.low24h) / range) * 100 : 50;

          return (
            <div
              key={coin.ticker}
              className={`border rounded p-2 ${isUp ? "border-green-200 bg-green-50/50" : "border-red-200 bg-red-50/50"}`}
            >
              <div className="flex justify-between items-start mb-1">
                <div>
                  <span className="font-bold text-[11px]">{coin.name}</span>
                  <span className="text-[9px] text-gray-400 ml-1">{coin.ticker.toUpperCase().replace("USD", "")}</span>
                </div>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isUp ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"}`}>
                  {isUp ? "+" : ""}{coin.change24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-[14px] font-bold mb-1">${formatPrice(coin.price)}</div>
              <div className="flex justify-between text-[8px] text-gray-500 mb-1">
                <span>L: ${formatPrice(coin.low24h)}</span>
                <span>H: ${formatPrice(coin.high24h)}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div className="h-full relative">
                  <div
                    className={`absolute top-0 h-full w-1.5 rounded-full ${isUp ? "bg-green-500" : "bg-red-500"}`}
                    style={{ left: `${Math.max(0, Math.min(98, posInRange))}%` }}
                  />
                </div>
              </div>
              <div className="text-[8px] text-gray-400">Vol: ${formatVolume(coin.volume24h)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
