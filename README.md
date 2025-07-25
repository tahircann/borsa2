# Interactive Brokers Trading Dashboard

A web application for monitoring and managing your Interactive Brokers trading account with real-time stock data integration.

## Features

- Dashboard with account overview
- Portfolio tracking with real dividend yields and country information
- Trade history with purchase date tracking
- New Buy tagging for stocks purchased within 24 hours
- Performance charts with S&P 500 comparison
- Sale percentage tracking

## Prerequisites

- Node.js (v14+)
- Interactive Brokers account (for real trading data)
- Alpha Vantage API key (for dividend and country data)
- Docker Desktop (if running the IB API in Docker)

## Configuration

1. Create a `.env.local` file in the root directory with the following variables:

```
# Interactive Brokers API Configuration
NEXT_PUBLIC_IB_API_URL=http://localhost:3000/ibapi
NEXT_PUBLIC_USE_MOCK_DATA=false
NEXT_PUBLIC_IB_ACCOUNT_ID=your_account_id_here

# Alpha Vantage API Configuration (for dividend and country data)
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_api_key_here
```

### Alpha Vantage API Key Setup

1. Go to [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
2. Get your free API key (allows 25 requests per day)
3. For production use, consider upgrading to a paid plan for higher rate limits
4. Update the API key in `services/alphaVantageApi.ts`:

```typescript
const API_KEY = 'your_alpha_vantage_api_key_here'; // Replace with your actual key
```

2. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` if you want to use mock data instead of the real API.

## New Features Implementation

### Real Data Integration

- **Dividend Data**: Retrieved from Alpha Vantage API for accurate annual dividend yields
- **Country Information**: Stock origin country from Alpha Vantage company overview
- **Purchase Dates**: Real purchase dates from IBKR trades API
- **Sale Tracking**: Percentage of position sold calculated from IBKR trade history
- **New Buy Detection**: Automatic tagging of stocks purchased within last 24 hours

### Portfolio Enhancements

- Added 4 new columns to portfolio table:
  - **Dividend**: Shows annual dividend yield percentage
  - **Purchase Date**: Date of most recent purchase with "New Buy" tags
  - **Sold**: Percentage of position that has been sold
  - **Country**: Country of origin for each stock
- Removed separate dividend navigation page
- Integrated S&P 500 comparison in performance charts

## Running with Mock Data

```bash
npm run dev
```

## Running with Interactive Brokers API

### Step 1: Authenticate with Interactive Brokers

1. Open the Interactive Brokers Client Portal or API gateway
2. Log in with your credentials
3. Once authenticated, note your account ID

### Step 2: Set Environment Variables

Set your IBKR account ID as an environment variable:

```bash
# Windows PowerShell
$env:IBKR_ACCOUNT_ID="your_account_id_here"

# Windows Command Prompt
set IBKR_ACCOUNT_ID=your_account_id_here

# Linux/Mac
export IBKR_ACCOUNT_ID=your_account_id_here
```

Also update the `.env.local` file with the same account ID:

```
NEXT_PUBLIC_IB_ACCOUNT_ID=your_account_id_here
```

### Step 3: Run the Application with API

```bash
npm run dev-with-api
```

This will start both the Next.js frontend and the Interactive Brokers API backend.

### Alternative: Run Components Separately

```bash
# Start the Interactive Brokers API backend
npm run start-ibkr-api

# In another terminal, start the Next.js frontend
npm run dev
```

## Running with Docker (Alternative)

If you prefer to run the Interactive Brokers API in Docker:

```bash
cd api-backend/interactive-brokers-web-api-main
docker-compose up
```

Then in another terminal, start the Next.js app:

```bash
npm run dev
```

## Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Important Notes

1. The API uses mock data by default. Set `NEXT_PUBLIC_USE_MOCK_DATA=false` to use the real Interactive Brokers API.
2. You must be authenticated with Interactive Brokers for the API to work.
3. Alpha Vantage free tier allows 25 requests per day - consider rate limiting for production.
4. For local development, the API proxy in Next.js configuration handles CORS issues.
5. Real dividend and country data requires a valid Alpha Vantage API key.

## License

MIT

## Technology Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2 (with S&P 500 overlay)
- **API Integration**: Interactive Brokers API, Alpha Vantage API
- **State Management**: React Hooks
- **Styling**: Tailwind CSS with custom components

## Project Structure

```
borsa22/
├── components/           # Reusable UI components
│   └── PerformanceChart.tsx   # Chart with S&P 500 integration
├── pages/                # Next.js pages and API routes
│   ├── portfolio.tsx     # Enhanced portfolio with new columns
│   └── performance.tsx   # Performance vs S&P 500 comparison
├── public/               # Static assets
├── services/             # API services and data fetching
│   ├── ibapi.ts         # Enhanced IBKR API integration
│   └── alphaVantageApi.ts    # Alpha Vantage API for stock metadata
├── styles/               # Global styles and Tailwind config
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## API Rate Limits & Considerations

### Alpha Vantage API
- **Free Tier**: 25 requests per day
- **Standard**: 75 requests per minute
- **Premium**: Higher limits available

### Interactive Brokers API
- Real-time data requires market data subscriptions
- API authentication required for live trading data
- Rate limits apply based on account type

## Data Sources

- **Portfolio Positions**: Interactive Brokers API
- **Trade History**: Interactive Brokers API  
- **Dividend Yields**: Alpha Vantage API
- **Country Data**: Alpha Vantage API
- **S&P 500 Data**: Mock data (configurable for real API)
- **Purchase Dates**: Calculated from IBKR trade history
- **Sale Percentages**: Calculated from IBKR trade history

## Acknowledgements

- [Interactive Brokers API](https://www.interactivebrokers.com/en/trading/ib-api.php)
- [Alpha Vantage API](https://www.alphavantage.co/)
- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Chart.js](https://www.chartjs.org/)
- [React Icons](https://react-icons.github.io/react-icons/)

#   b o r s a 
 
 #   b o r s a 2 
 
 #   b o r s a 2 
 
 