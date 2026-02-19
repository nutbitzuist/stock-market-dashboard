"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { SECTIONS, GLOBAL_SECTIONS } from "@/lib/tickers";
import type { TickerData } from "@/app/api/market-data/route";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import RiskMonitor from "@/components/RiskMonitor";
import RelativeStrength from "@/components/RelativeStrength";
import EarningsTracker from "@/components/EarningsTracker";
import CryptoDashboard from "@/components/CryptoDashboard";
import ForexMonitor from "@/components/ForexMonitor";
import NewsFeed from "@/components/NewsFeed";
import SectorRotation from "@/components/SectorRotation";
import MarketBreadth from "@/components/MarketBreadth";

interface MarketDataResponse {
  data: Record<string, TickerData>;
  timestamp: string;
}

function formatPct(val: number | undefined | null, decimals = 2): string {
  if (val === undefined || val === null) return "-";
  return val.toFixed(decimals) + "%";
}

function pctColor(val: number | undefined | null): string {
  if (val === undefined || val === null) return "text-gray-500";
  if (val > 0) return "text-green-700";
  if (val < 0) return "text-red-600";
  return "text-gray-700";
}

function perfCellBg(val: number | undefined | null): string {
  if (val === undefined || val === null) return "";
  if (val > 5) return "bg-[#2d8a4e]";
  if (val > 2) return "bg-[#6abf7b]";
  if (val > 0) return "bg-[#c6efce]";
  if (val < -5) return "bg-[#c0392b]";
  if (val < -2) return "bg-[#e67e73]";
  if (val < 0) return "bg-[#fce4e4]";
  return "";
}

function perfCellText(val: number | undefined | null): string {
  if (val === undefined || val === null) return "text-gray-500";
  if (val > 5) return "text-white";
  if (val < -5) return "text-white";
  return "text-gray-900";
}

function changeBg1D(val: number | undefined | null): string {
  if (val === undefined || val === null) return "";
  if (val > 3) return "bg-[#2d8a4e]";
  if (val > 1.5) return "bg-[#6abf7b]";
  if (val > 0) return "bg-[#c6efce]";
  if (val < -3) return "bg-[#c0392b]";
  if (val < -1.5) return "bg-[#e67e73]";
  if (val < 0) return "bg-[#fce4e4]";
  return "";
}

function changeBg1DText(val: number | undefined | null): string {
  if (val === undefined || val === null) return "text-gray-500";
  if (val > 3 || val < -3) return "text-white";
  return "text-gray-900";
}

function TrendArrow({ above }: { above: boolean | null }) {
  if (above === null) return <span className="text-gray-300">-</span>;
  if (above) return <span className="text-green-600 text-xs">&#9650;</span>;
  return <span className="text-red-500 text-xs">&#9660;</span>;
}

function HighBar({ pct }: { pct: number }) {
  const pctFromHigh = Math.abs(pct);
  const barWidth = Math.max(0, Math.min(100, 100 - pctFromHigh));

  let barColor = "#2d8a4e";
  if (pctFromHigh > 40) barColor = "#c0392b";
  else if (pctFromHigh > 25) barColor = "#e67e22";
  else if (pctFromHigh > 15) barColor = "#f39c12";
  else if (pctFromHigh > 5) barColor = "#6abf7b";

  return (
    <div className="flex items-center gap-1 w-full">
      <div className="flex-1 h-[10px] bg-gray-200 overflow-hidden relative">
        <div
          className="h-full"
          style={{ width: `${barWidth}%`, backgroundColor: barColor }}
        />
      </div>
      <span className="text-[9px] text-gray-600 w-[42px] text-right whitespace-nowrap">
        {pctFromHigh.toFixed(2)}%
      </span>
    </div>
  );
}

function getMarketExposure(data: Record<string, TickerData>): {
  label: string;
  color: string;
  pct: number;
} {
  const spy = data["SPY"];
  if (!spy) return { label: "Neutral", color: "bg-yellow-400", pct: 50 };

  let score = 0;
  if (spy.aboveSMA10) score += 1;
  if (spy.aboveSMA20) score += 1;
  if (spy.aboveSMA50) score += 1;
  if (spy.aboveSMA200) score += 1;
  if (spy.above50and200) score += 1;

  const qqq = data["QQQ"];
  const iwm = data["IWM"];
  if (qqq) {
    if (qqq.aboveSMA50) score += 0.5;
    if (qqq.aboveSMA200) score += 0.5;
  }
  if (iwm) {
    if (iwm.aboveSMA50) score += 0.5;
    if (iwm.aboveSMA200) score += 0.5;
  }

  const maxScore = 7;
  const pct = (score / maxScore) * 100;

  if (pct >= 80) return { label: "Bullish", color: "bg-green-600", pct };
  if (pct >= 60) return { label: "Positive", color: "bg-green-400", pct };
  if (pct >= 40) return { label: "Neutral", color: "bg-yellow-400", pct };
  if (pct >= 20) return { label: "Negative", color: "bg-orange-400", pct };
  return { label: "Bearish", color: "bg-red-500", pct };
}

function getBroadMarketOverview(data: Record<string, TickerData>) {
  const allTickers = Object.values(data);
  if (allTickers.length === 0) return null;

  const countAbove = (key: keyof TickerData) => {
    const valid = allTickers.filter((t) => t[key] !== null);
    const above = valid.filter((t) => t[key] === true);
    return valid.length > 0 ? (above.length / valid.length) * 100 : 50;
  };

  const sma10Pct = countAbove("aboveSMA10");
  const sma20Pct = countAbove("aboveSMA20");
  const sma50Pct = countAbove("aboveSMA50");
  const sma200Pct = countAbove("aboveSMA200");
  const sma50v200Pct = countAbove("above50and200");

  const getLabel = (pct: number) => {
    if (pct >= 70) return { label: "Positive", color: "bg-green-600 text-white" };
    if (pct >= 40) return { label: "Neutral", color: "bg-yellow-400 text-gray-900" };
    return { label: "Negative", color: "bg-red-500 text-white" };
  };

  return {
    shortTerm10: { pct: sma10Pct, ...getLabel(sma10Pct) },
    shortTerm20: { pct: sma20Pct, ...getLabel(sma20Pct) },
    midTerm: { pct: sma50Pct, ...getLabel(sma50Pct) },
    longTerm200: { pct: sma200Pct, ...getLabel(sma200Pct) },
    midTermCross: { pct: sma50v200Pct, ...getLabel(sma50v200Pct) },
    longTermCross: { pct: sma50v200Pct, ...getLabel(sma50v200Pct) },
  };
}

function getPerformanceOverview(data: Record<string, TickerData>) {
  const allTickers = Object.values(data);
  if (allTickers.length === 0) return null;

  const avg = (key: keyof TickerData) => {
    const vals = allTickers.map((t) => t[key] as number).filter((v) => v !== null && v !== undefined);
    return vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const getLabel = (val: number) => {
    if (val > 1) return { label: "Positive", color: "bg-green-600 text-white" };
    if (val > -1) return { label: "Neutral", color: "bg-yellow-400 text-gray-900" };
    return { label: "Negative", color: "bg-red-500 text-white" };
  };

  const ytdAvg = avg("ytd");
  const weekAvg = avg("week1");
  const monthAvg = avg("month1");
  const yearAvg = avg("year1");

  const spy = data["SPY"];
  const high52w = spy ? Math.abs(spy.pctFrom52wHigh) : 0;

  const vix = data["VIXY"];
  const vixPrice = vix ? vix.price : 0;

  return {
    ytd: { val: ytdAvg, ...getLabel(ytdAvg) },
    week: { val: weekAvg, ...getLabel(weekAvg) },
    month: { val: monthAvg, ...getLabel(monthAvg) },
    year: { val: yearAvg, ...getLabel(yearAvg) },
    high52w,
    vix: vixPrice,
  };
}

const GRID_COLS = "grid-cols-[60px_100px_65px_50px_50px_50px_55px_55px_1fr_45px_45px_45px_45px_55px]";

export default function Dashboard() {
  const [data, setData] = useState<Record<string, TickerData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/market-data");
      if (!res.ok) throw new Error("Failed to fetch");
      const json: MarketDataResponse = await res.json();
      setData(json.data);
      setLastUpdated(new Date(json.timestamp).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }));
      setError(null);
    } catch (err) {
      setError("Failed to load market data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const downloadPDF = useCallback(async () => {
    if (!dashboardRef.current) return;
    setDownloading(true);
    try {
      const dataUrl = await toPng(dashboardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Load image to get dimensions
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = dataUrl;
      });

      const imgWidth = img.width;
      const imgHeight = img.height;

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a3",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 5;
      const usableWidth = pdfWidth - margin * 2;
      const usableHeight = pdfHeight - margin * 2;

      const scaledHeight = (imgHeight / imgWidth) * usableWidth;

      if (scaledHeight <= usableHeight) {
        pdf.addImage(dataUrl, "PNG", margin, margin, usableWidth, scaledHeight);
      } else {
        // Multi-page
        const scale = usableWidth / imgWidth;
        const pageImgHeight = usableHeight / scale;
        let srcY = 0;
        let page = 0;

        while (srcY < imgHeight) {
          if (page > 0) pdf.addPage();
          const sliceH = Math.min(pageImgHeight, imgHeight - srcY);

          const canvas = document.createElement("canvas");
          canvas.width = imgWidth;
          canvas.height = Math.ceil(sliceH);
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, srcY, imgWidth, sliceH, 0, 0, imgWidth, sliceH);
            const sliceData = canvas.toDataURL("image/png");
            pdf.addImage(sliceData, "PNG", margin, margin, usableWidth, sliceH * scale);
          }

          srcY += pageImgHeight;
          page++;
        }
      }

      const dateStr = new Date().toISOString().split("T")[0];
      pdf.save(`stock-market-environment-${dateStr}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setDownloading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading market data from Tiingo...</p>
          <p className="text-gray-400 text-xs mt-2">This may take a moment for the first load</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const exposure = getMarketExposure(data);
  const perfOverview = getPerformanceOverview(data);
  const broadOverview = getBroadMarketOverview(data);

  return (
    <div className="min-h-screen bg-white px-3 py-4" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: "11px" }}>
      <div ref={dashboardRef} className="max-w-[1350px] mx-auto bg-white">
        {/* Title */}
        <h1 className="text-center text-lg font-bold tracking-[0.3em] mb-3 pb-1" style={{ borderBottom: "2px solid #000" }}>
          STOCK MARKET ENVIRONMENT
        </h1>

        {/* Top Summary Row */}
        <div className="flex gap-3 mb-5">
          {/* Market Exposure */}
          <div className="border border-gray-400 p-2 w-[220px] shrink-0">
            <div className="font-bold text-[11px] mb-1.5 border-b border-gray-300 pb-0.5">Market Exposure</div>
            <div className="space-y-0.5 text-[10px]">
              {[
                { label: "Bullish", range: "100%-80%", color: "#22863a" },
                { label: "Positive", range: "80%-60%", color: "#85e89d" },
                { label: "Neutral", range: "60%-40%", color: "#ffd33d" },
                { label: "Negative", range: "40%-20%", color: "#fb8532" },
                { label: "Bearish", range: "20%-0%", color: "#cb2431" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-1.5 py-px px-1 ${
                    exposure.label === item.label ? "font-bold" : ""
                  }`}
                >
                  <span className="w-[14px] h-[12px] inline-block border border-gray-400" style={{ backgroundColor: item.color }}></span>
                  <span className="w-[60px]">{item.label}</span>
                  <span className="text-gray-500">{item.range}</span>
                  {exposure.label === item.label && (
                    <span className="ml-auto text-red-600">&#9668;</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Market Performance Overview */}
          <div className="border border-gray-400 p-2 flex-1">
            <div className="font-bold text-[11px] mb-1.5 border-b border-gray-300 pb-0.5">Market Performance Overview</div>
            {perfOverview && (
              <table className="w-full text-[10px] text-center">
                <thead>
                  <tr>
                    <td></td>
                    <td className="font-bold pb-0.5">% YTD</td>
                    <td className="font-bold pb-0.5">% 1 Week</td>
                    <td className="font-bold pb-0.5">% 1 Month</td>
                    <td className="font-bold pb-0.5">% 1 Year</td>
                    <td className="font-bold pb-0.5">52w High</td>
                    <td className="font-bold pb-0.5">VIX</td>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-left text-gray-500 pr-2">avg</td>
                    <td className={pctColor(perfOverview.ytd.val)}>{perfOverview.ytd.val.toFixed(2)}%</td>
                    <td className={pctColor(perfOverview.week.val)}>{perfOverview.week.val.toFixed(2)}%</td>
                    <td className={pctColor(perfOverview.month.val)}>{perfOverview.month.val.toFixed(2)}%</td>
                    <td className={pctColor(perfOverview.year.val)}>{perfOverview.year.val.toFixed(2)}%</td>
                    <td>{perfOverview.high52w.toFixed(2)}%</td>
                    <td>{perfOverview.vix.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td></td>
                    <td><span className={`inline-block px-2 py-0.5 rounded text-[9px] ${perfOverview.ytd.color}`}>{perfOverview.ytd.label}</span></td>
                    <td><span className={`inline-block px-2 py-0.5 rounded text-[9px] ${perfOverview.week.color}`}>{perfOverview.week.label}</span></td>
                    <td><span className={`inline-block px-2 py-0.5 rounded text-[9px] ${perfOverview.month.color}`}>{perfOverview.month.label}</span></td>
                    <td><span className={`inline-block px-2 py-0.5 rounded text-[9px] ${perfOverview.year.color}`}>{perfOverview.year.label}</span></td>
                    <td><span className="inline-block px-2 py-0.5 rounded text-[9px] bg-green-600 text-white">Positive</span></td>
                    <td><span className="inline-block px-2 py-0.5 rounded text-[9px] bg-yellow-400 text-gray-900">Neutral</span></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          {/* Broad Market Overview */}
          <div className="border border-gray-400 p-2 flex-1">
            <div className="font-bold text-[11px] mb-1.5 border-b border-gray-300 pb-0.5">Broad Market Overview</div>
            {broadOverview && (
              <table className="w-full text-[10px] text-center">
                <thead>
                  <tr>
                    <td className="font-bold pb-0.5">Short-Term</td>
                    <td className="font-bold pb-0.5">Short-Term</td>
                    <td className="font-bold pb-0.5">Mid-Term</td>
                    <td className="font-bold pb-0.5">Long-Term</td>
                    <td className="font-bold pb-0.5">Mid-Term</td>
                    <td className="font-bold pb-0.5">Long-Term</td>
                  </tr>
                </thead>
                <tbody>
                  <tr className="text-[9px] text-gray-500">
                    <td>10SMA</td>
                    <td>20SMA</td>
                    <td>50SMA</td>
                    <td>200SMA</td>
                    <td>50&gt;200</td>
                    <td>50&gt;200</td>
                  </tr>
                  <tr>
                    <td>{broadOverview.shortTerm10.pct.toFixed(2)}%</td>
                    <td>{broadOverview.shortTerm20.pct.toFixed(2)}%</td>
                    <td>{broadOverview.midTerm.pct.toFixed(2)}%</td>
                    <td>{broadOverview.longTerm200.pct.toFixed(2)}%</td>
                    <td>{broadOverview.midTermCross.pct.toFixed(2)}%</td>
                    <td>{broadOverview.longTermCross.pct.toFixed(2)}%</td>
                  </tr>
                  <tr>
                    <td><span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${broadOverview.shortTerm10.color}`}>{broadOverview.shortTerm10.label}</span></td>
                    <td><span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${broadOverview.shortTerm20.color}`}>{broadOverview.shortTerm20.label}</span></td>
                    <td><span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${broadOverview.midTerm.color}`}>{broadOverview.midTerm.label}</span></td>
                    <td><span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${broadOverview.longTerm200.color}`}>{broadOverview.longTerm200.label}</span></td>
                    <td><span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${broadOverview.midTermCross.color}`}>{broadOverview.midTermCross.label}</span></td>
                    <td><span className={`inline-block px-1.5 py-0.5 rounded text-[9px] ${broadOverview.longTermCross.color}`}>{broadOverview.longTermCross.label}</span></td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Ticker Sections */}
        {SECTIONS.map((section) => (
          <div key={section.title} className="mb-3">
            {/* Section Title Row with column headers */}
            <div className={`grid ${GRID_COLS} gap-0 py-[3px] px-1 border-b border-gray-400 items-end`} style={{ backgroundColor: "#f0f0f0" }}>
              <div className="font-bold">{section.title}</div>
              <div className="text-gray-500">Index</div>
              <div className="text-right text-gray-500">Price</div>
              <div className="text-right text-gray-500">% 1D</div>
              <div className="text-center font-bold text-[9px] leading-tight">
                <span className="text-gray-400">Performance</span>
              </div>
              <div></div>
              <div></div>
              <div></div>
              <div className="text-center font-bold text-[9px] leading-tight">
                <span className="text-gray-400">Highs</span>
              </div>
              <div className="text-center font-bold text-[9px] leading-tight col-span-5">
                <span className="text-gray-400">Trend Indicators (MAs)</span>
              </div>
            </div>
            {/* Sub-header */}
            <div className={`grid ${GRID_COLS} gap-0 py-[2px] px-1 border-b border-gray-300 text-[9px] text-gray-500 font-bold`} style={{ backgroundColor: "#fafafa" }}>
              <div>Ticker</div>
              <div>Index</div>
              <div className="text-right">Price</div>
              <div className="text-right">% 1D</div>
              <div className="text-right">% YTD</div>
              <div className="text-right">% 1W</div>
              <div className="text-right">% 1M</div>
              <div className="text-right">% 1Y</div>
              <div className="text-center">% From 52w High</div>
              <div className="text-center">10SMA</div>
              <div className="text-center">20SMA</div>
              <div className="text-center">50SMA</div>
              <div className="text-center">200SMA</div>
              <div className="text-center">50&gt;200</div>
            </div>

            {/* Ticker Rows */}
            {section.tickers.map((tickerConfig, idx) => {
              const d = data[tickerConfig.ticker];
              if (!d) {
                return (
                  <div
                    key={tickerConfig.ticker}
                    className={`grid ${GRID_COLS} gap-0 py-[2px] px-1 border-b border-gray-100 ${
                      idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                    }`}
                  >
                    <div className="font-bold">{tickerConfig.ticker}</div>
                    <div className="text-gray-600">{tickerConfig.index}</div>
                    <div className="text-right text-gray-400 col-span-12">No data</div>
                  </div>
                );
              }

              return (
                <div
                  key={tickerConfig.ticker}
                  className={`grid ${GRID_COLS} gap-0 py-[2px] px-1 border-b border-gray-100 items-center ${
                    idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                  }`}
                >
                  <div className="font-bold">{d.ticker}</div>
                  <div className="text-gray-600">{tickerConfig.index}</div>
                  <div className="text-right">{d.price.toFixed(2)}</div>
                  <div className={`text-right px-0.5 ${changeBg1DText(d.change1D)} ${changeBg1D(d.change1D)}`}>
                    {formatPct(d.change1D)}
                  </div>
                  <div className={`text-right px-0.5 ${perfCellText(d.ytd)} ${perfCellBg(d.ytd)}`}>
                    {formatPct(d.ytd)}
                  </div>
                  <div className={`text-right px-0.5 ${pctColor(d.week1)}`}>
                    {formatPct(d.week1)}
                  </div>
                  <div className={`text-right px-0.5 ${pctColor(d.month1)}`}>
                    {formatPct(d.month1)}
                  </div>
                  <div className={`text-right px-0.5 ${pctColor(d.year1)}`}>
                    {formatPct(d.year1)}
                  </div>
                  <div className="flex justify-center px-1">
                    <HighBar pct={d.pctFrom52wHigh} />
                  </div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA10} /></div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA20} /></div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA50} /></div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA200} /></div>
                  <div className="text-center"><TrendArrow above={d.above50and200} /></div>
                </div>
              );
            })}
          </div>
        ))}

        {/* GLOBAL MARKETS SECTION */}
        <h2 className="text-center text-base font-bold tracking-[0.3em] mt-6 mb-3 pb-1" style={{ borderBottom: "2px solid #000" }}>
          GLOBAL MARKET ENVIRONMENT
        </h2>

        {GLOBAL_SECTIONS.map((section) => (
          <div key={section.title} className="mb-3">
            <div className={`grid ${GRID_COLS} gap-0 py-[3px] px-1 border-b border-gray-400 items-end`} style={{ backgroundColor: "#f0f0f0" }}>
              <div className="font-bold">{section.title}</div>
              <div className="text-gray-500">Index</div>
              <div className="text-right text-gray-500">Price</div>
              <div className="text-right text-gray-500">% 1D</div>
              <div className="text-center font-bold text-[9px] leading-tight">
                <span className="text-gray-400">Performance</span>
              </div>
              <div></div>
              <div></div>
              <div></div>
              <div className="text-center font-bold text-[9px] leading-tight">
                <span className="text-gray-400">Highs</span>
              </div>
              <div className="text-center font-bold text-[9px] leading-tight col-span-5">
                <span className="text-gray-400">Trend Indicators (MAs)</span>
              </div>
            </div>
            <div className={`grid ${GRID_COLS} gap-0 py-[2px] px-1 border-b border-gray-300 text-[9px] text-gray-500 font-bold`} style={{ backgroundColor: "#fafafa" }}>
              <div>Ticker</div>
              <div>Index</div>
              <div className="text-right">Price</div>
              <div className="text-right">% 1D</div>
              <div className="text-right">% YTD</div>
              <div className="text-right">% 1W</div>
              <div className="text-right">% 1M</div>
              <div className="text-right">% 1Y</div>
              <div className="text-center">% From 52w High</div>
              <div className="text-center">10SMA</div>
              <div className="text-center">20SMA</div>
              <div className="text-center">50SMA</div>
              <div className="text-center">200SMA</div>
              <div className="text-center">50&gt;200</div>
            </div>
            {section.tickers.map((tickerConfig, idx) => {
              const d = data[tickerConfig.ticker];
              if (!d) {
                return (
                  <div key={tickerConfig.ticker} className={`grid ${GRID_COLS} gap-0 py-[2px] px-1 border-b border-gray-100 ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                    <div className="font-bold">{tickerConfig.ticker}</div>
                    <div className="text-gray-600">{tickerConfig.index}</div>
                    <div className="text-right text-gray-400 col-span-12">No data</div>
                  </div>
                );
              }
              return (
                <div key={tickerConfig.ticker} className={`grid ${GRID_COLS} gap-0 py-[2px] px-1 border-b border-gray-100 items-center ${idx % 2 === 0 ? "bg-white" : "bg-[#fafafa]"}`}>
                  <div className="font-bold">{d.ticker}</div>
                  <div className="text-gray-600">{tickerConfig.index}</div>
                  <div className="text-right">{d.price.toFixed(2)}</div>
                  <div className={`text-right px-0.5 ${changeBg1DText(d.change1D)} ${changeBg1D(d.change1D)}`}>{formatPct(d.change1D)}</div>
                  <div className={`text-right px-0.5 ${perfCellText(d.ytd)} ${perfCellBg(d.ytd)}`}>{formatPct(d.ytd)}</div>
                  <div className={`text-right px-0.5 ${pctColor(d.week1)}`}>{formatPct(d.week1)}</div>
                  <div className={`text-right px-0.5 ${pctColor(d.month1)}`}>{formatPct(d.month1)}</div>
                  <div className={`text-right px-0.5 ${pctColor(d.year1)}`}>{formatPct(d.year1)}</div>
                  <div className="flex justify-center px-1"><HighBar pct={d.pctFrom52wHigh} /></div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA10} /></div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA20} /></div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA50} /></div>
                  <div className="text-center"><TrendArrow above={d.aboveSMA200} /></div>
                  <div className="text-center"><TrendArrow above={d.above50and200} /></div>
                </div>
              );
            })}
          </div>
        ))}

        {/* ANALYTICS SECTION */}
        <h2 className="text-center text-base font-bold tracking-[0.3em] mt-6 mb-3 pb-1" style={{ borderBottom: "2px solid #000" }}>
          MARKET ANALYTICS
        </h2>

        <MarketBreadth data={data} />
        <SectorRotation data={data} />
        <RiskMonitor data={data} />
        <RelativeStrength data={data} />
        <CorrelationHeatmap data={data} />

        {/* ADDITIONAL MARKETS */}
        <h2 className="text-center text-base font-bold tracking-[0.3em] mt-6 mb-3 pb-1" style={{ borderBottom: "2px solid #000" }}>
          CRYPTO &amp; FOREX
        </h2>

        <CryptoDashboard />
        <ForexMonitor />

        {/* NEWS & CALENDAR */}
        <h2 className="text-center text-base font-bold tracking-[0.3em] mt-6 mb-3 pb-1" style={{ borderBottom: "2px solid #000" }}>
          NEWS &amp; CALENDAR
        </h2>

        <EarningsTracker data={data} />
        <NewsFeed />

        {/* Footer */}
        <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-400 text-[10px] text-gray-500">
          <div className="italic">{lastUpdated}</div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="px-3 py-1 bg-gray-800 text-white rounded text-[10px] hover:bg-gray-700 transition-colors cursor-pointer"
            >
              Refresh Data
            </button>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              className="px-3 py-1 bg-red-700 text-white rounded text-[10px] hover:bg-red-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
