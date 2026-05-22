# Moomoo Stock Analyzer

A stock position analysis web app for moomoo users. Features portfolio roasting, FX P/L decoupling, and technical trend analysis. Supports Chinese (Simplified) and English.

## Prerequisites

- Python 3.11+
- Node.js 20+
- [FutuOpenD](https://www.futunn.com/openAPI) installed and logged into your moomoo account

## Quick Start

### 1. Start FutuOpenD
Launch FutuOpenD and log into your moomoo account. It runs on `127.0.0.1:11111` by default.

### 2. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Features

### Portfolio Roast & Review
Humorous but insightful critique of your current holdings. Analyzes diversification, concentration risk, and performance. Generates witty commentary about each position. Share as image.

### FX P/L Decoupling
For multi-currency accounts: decouples currency exchange gain/loss from stock price movement. Shows how much P&L came from FX moves vs. actual stock performance.

### Stock Price Trend Analysis
Interactive candlestick charts with MA(5,20,60,200), MACD, RSI(14), and Bollinger Bands. Auto-detected support/resistance levels. Multi-timeframe analysis (1D to 5Y).

## Architecture

- **Backend:** Python FastAPI + futu-api SDK, connecting to local FutuOpenD gateway
- **Frontend:** React + TypeScript + Vite, lightweight-charts for financial charts
- **No database required** — all data is real-time from FutuOpenD
- **Single-user** — designed for local use with one FutuOpenD connection

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend framework | FastAPI |
| Moomoo API | futu-api SDK |
| Frontend | React 18, TypeScript |
| Financial charts | lightweight-charts |
| Statistical charts | recharts |
| State management | React Query + Zustand |
| i18n | react-i18next |
| UI | Tailwind CSS |
| Packaging | Vite build served by FastAPI |
