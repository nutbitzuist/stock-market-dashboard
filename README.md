# Stock Market Environment Dashboard

Real-time global stock market environment dashboard powered by [Tiingo API](https://www.tiingo.com/).

## Features

- **US Market Overview** — S&P 500, Nasdaq, Russell 2000, Dow Jones, Mag 7, and more
- **Sector & Industry Tracking** — Energy, Tech, Finance, Semis, Biotech, Crypto, etc.
- **Global Market Environment** — Developed Markets (Europe, Japan, Australia) & Emerging Markets (China, India, Brazil, etc.)
- **Market Exposure Indicator** — Bullish/Positive/Neutral/Negative/Bearish based on SMA analysis
- **Performance Metrics** — YTD, 1W, 1M, 1Y with color-coded backgrounds
- **52-Week High Bars** — Visual distance from 52-week highs
- **Trend Indicators** — 10/20/50/200 SMA arrows and 50>200 crossover
- **Risk-On / Risk-Off Monitor** — Global risk appetite score
- **Relative Strength Ranking** — Momentum-based ranking across all global markets
- **Cross-Market Correlation Heatmap** — Performance correlation matrix
- **Macro Calendar** — Upcoming Fed, ECB, BOJ, PBOC, RBI decisions and US economic data
- **PDF Export** — Download the entire dashboard as a PDF

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` with your Tiingo API key:
   ```
   TIINGO_API_KEY=your_tiingo_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Tech Stack

- **Next.js 16** with App Router
- **TailwindCSS v4** for styling
- **Tiingo API** for real-time EOD market data
- **html-to-image + jsPDF** for PDF export
- Deployed on **Vercel** (serverless API routes, no separate backend needed)

## Environment Variables

| Variable | Description |
|----------|-------------|
| `TIINGO_API_KEY` | Your Tiingo API key (get one at [tiingo.com](https://www.tiingo.com)) |
