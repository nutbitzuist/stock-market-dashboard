export interface TickerConfig {
  ticker: string;
  index: string;
}

export interface SectionConfig {
  title: string;
  tickers: TickerConfig[];
}

export const SECTIONS: SectionConfig[] = [
  {
    title: "Market",
    tickers: [
      { ticker: "SPY", index: "S&P 500" },
      { ticker: "RSP", index: "EW-S&P 500" },
      { ticker: "QQQ", index: "Nasdaq 100" },
      { ticker: "QQQE", index: "EW-NQ100" },
      { ticker: "SCHD", index: "Dividends" },
      { ticker: "MAGS", index: "Mag 7" },
      { ticker: "IWM", index: "Russel 2000" },
      { ticker: "MDY", index: "Mid Cap" },
      { ticker: "DJIA", index: "Dow Jones" },
    ],
  },
  {
    title: "Sectors",
    tickers: [
      { ticker: "XLE", index: "Energy" },
      { ticker: "XLP", index: "Consumer" },
      { ticker: "XLI", index: "Industrials" },
      { ticker: "XLU", index: "Utilities" },
      { ticker: "XLV", index: "Healthcare" },
      { ticker: "XLK", index: "Technology" },
      { ticker: "XLF", index: "Finance" },
    ],
  },
  {
    title: "Industries",
    tickers: [
      { ticker: "REMX", index: "Rare Earths" },
      { ticker: "TAN", index: "Solar" },
      { ticker: "NLR", index: "Nuclear" },
      { ticker: "ITB", index: "Home Builder" },
      { ticker: "SOXX", index: "Semis" },
      { ticker: "UFO", index: "Space" },
      { ticker: "ITA", index: "Aerospace" },
      { ticker: "DPRO", index: "Drones" },
      { ticker: "QTUM", index: "Quantum" },
      { ticker: "IBB", index: "Biotech" },
      { ticker: "IAI", index: "Brokers" },
      { ticker: "BLOK", index: "Crypto" },
      { ticker: "CIBR", index: "Cybersecurity" },
    ],
  },
  {
    title: "Managed ETFs",
    tickers: [
      { ticker: "MEME", index: "Memes" },
      { ticker: "FFTY", index: "IBD50" },
      { ticker: "GRNY", index: "Fundstrat" },
      { ticker: "IPO", index: "IPOs" },
      { ticker: "IVES", index: "AI Revolution" },
      { ticker: "ARKK", index: "ARK" },
    ],
  },
  {
    title: "Others",
    tickers: [
      { ticker: "USO", index: "Oil" },
      { ticker: "GLD", index: "Gold" },
      { ticker: "SLV", index: "Silver" },
      { ticker: "IBIT", index: "Bitcoin" },
      { ticker: "ETHA", index: "Ethereum" },
    ],
  },
  {
    title: "Macro",
    tickers: [
      { ticker: "UUP", index: "US Dollar" },
      { ticker: "VIXY", index: "Volatility" },
      { ticker: "TLT", index: "Bonds" },
    ],
  },
];

export const GLOBAL_SECTIONS: SectionConfig[] = [
  {
    title: "Developed Markets",
    tickers: [
      { ticker: "VGK", index: "Europe" },
      { ticker: "EWG", index: "Germany" },
      { ticker: "EWQ", index: "France" },
      { ticker: "EWU", index: "UK" },
      { ticker: "EWP", index: "Spain" },
      { ticker: "EWI", index: "Italy" },
      { ticker: "EWL", index: "Switzerland" },
      { ticker: "EWJ", index: "Japan" },
      { ticker: "EWA", index: "Australia" },
      { ticker: "EWC", index: "Canada" },
    ],
  },
  {
    title: "Emerging Markets",
    tickers: [
      { ticker: "VWO", index: "EM Broad" },
      { ticker: "FXI", index: "China" },
      { ticker: "INDA", index: "India" },
      { ticker: "EWZ", index: "Brazil" },
      { ticker: "EWY", index: "South Korea" },
      { ticker: "EWT", index: "Taiwan" },
      { ticker: "EWW", index: "Mexico" },
      { ticker: "THD", index: "Thailand" },
      { ticker: "VNM", index: "Vietnam" },
      { ticker: "EIDO", index: "Indonesia" },
    ],
  },
  {
    title: "Global Sectors",
    tickers: [
      { ticker: "IXC", index: "Global Energy" },
      { ticker: "IXJ", index: "Global Health" },
      { ticker: "IXN", index: "Global Tech" },
      { ticker: "IXG", index: "Global Finance" },
      { ticker: "MXI", index: "Global Materials" },
    ],
  },
];

export const ALL_TICKERS = [
  ...SECTIONS.flatMap((s) => s.tickers.map((t) => t.ticker)),
  ...GLOBAL_SECTIONS.flatMap((s) => s.tickers.map((t) => t.ticker)),
];
