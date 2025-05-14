// Mock Positions API Server
// This simple server simulates the positions API for testing the frontend
const express = require('express');
const cors = require('cors');
const app = express();
const port = 5056;

// Enable CORS for all routes
app.use(cors());

// Sample position data that matches the real API format
const mockPositions = [
  {
    position: 0.1793, // fractional shares
    conid: "417292597",
    avgCost: 61.94,
    avgPrice: 61.94,
    currency: "USD",
    description: "MLPX",
    isLastToLoq: false,
    marketPrice: 60.03,
    marketValue: 10.76,
    realizedPnl: 0.0,
    secType: "STK",
    timestamp: Date.now(),
    unrealizedPnl: -0.34,
    assetClass: "STK",
    sector: "Energy",
    group: "MLPs",
    model: ""
  },
  {
    position: 0.2043,
    conid: "3691937",
    avgCost: 217.00,
    avgPrice: 217.00,
    currency: "USD",
    description: "AMZN",
    isLastToLoq: false,
    marketPrice: 188.99,
    marketValue: 38.61,
    realizedPnl: 0.0,
    secType: "STK",
    timestamp: Date.now(),
    unrealizedPnl: -5.72,
    assetClass: "STK",
    sector: "Communications",
    group: "Internet",
    model: ""
  },
  {
    position: 25,
    conid: "265598",
    avgCost: 178.50,
    avgPrice: 178.50,
    currency: "USD",
    description: "AAPL",
    isLastToLoq: false,
    marketPrice: 183.75,
    marketValue: 4593.75,
    realizedPnl: 0.0,
    secType: "STK",
    timestamp: Date.now(),
    unrealizedPnl: 131.25,
    assetClass: "STK",
    sector: "Technology",
    group: "Hardware",
    model: ""
  },
  {
    position: 15,
    conid: "8864",
    avgCost: 368.42,
    avgPrice: 368.42,
    currency: "USD",
    description: "MSFT",
    isLastToLoq: false,
    marketPrice: 392.11,
    marketValue: 5881.65,
    realizedPnl: 0.0,
    secType: "STK",
    timestamp: Date.now(),
    unrealizedPnl: 355.65,
    assetClass: "STK",
    sector: "Technology",
    group: "Software",
    model: ""
  },
  {
    position: 10,
    conid: "272093",
    avgCost: 128.75,
    avgPrice: 128.75,
    currency: "USD",
    description: "GOOGL",
    isLastToLoq: false,
    marketPrice: 139.80,
    marketValue: 1398.00,
    realizedPnl: 0.0,
    secType: "STK",
    timestamp: Date.now(),
    unrealizedPnl: 110.50,
    assetClass: "STK",
    sector: "Technology",
    group: "Internet",
    model: ""
  }
];

// Positions endpoint
app.get('/positions', (req, res) => {
  console.log(`[${new Date().toISOString()}] GET /positions - Request received`);
  
  // Generate slightly different values each time to simulate real-time data
  const positions = mockPositions.map(pos => {
    // Random price fluctuation up to 1%
    const priceChange = pos.marketPrice * (Math.random() * 0.02 - 0.01);
    const newMarketPrice = pos.marketPrice + priceChange;
    const newMarketValue = pos.position * newMarketPrice;
    const newUnrealizedPnl = newMarketValue - (pos.avgCost * pos.position);
    
    return {
      ...pos,
      marketPrice: Number(newMarketPrice.toFixed(2)),
      marketValue: Number(newMarketValue.toFixed(2)),
      unrealizedPnl: Number(newUnrealizedPnl.toFixed(2)),
      timestamp: Date.now()
    };
  });
  
  // Simulate network delay
  setTimeout(() => {
    res.json(positions);
    console.log(`[${new Date().toISOString()}] GET /positions - Response sent (${positions.length} items)`);
  }, 300); // 300ms delay
});

// Root endpoint for health check
app.get('/', (req, res) => {
  res.send('Mock Positions API is running. Try /positions endpoint.');
});

// Start the server
app.listen(port, () => {
  console.log(`
Mock Positions API Server is running!
-----------------------------------
URL: http://localhost:${port}
Available endpoints:
- GET /positions : Returns mock position data
-----------------------------------
Press Ctrl+C to stop the server
  `);
}); 