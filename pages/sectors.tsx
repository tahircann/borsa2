import { useState, useEffect } from 'react';
import { getPositions } from '@/services/ibapi';
import SectorChart from '@/components/SectorChart';

// Define sector mapping for grouping
const sectorMapping: Record<string, string> = {
  // Technology
  'AAPL': 'Technology',
  'MSFT': 'Technology',
  'GOOG': 'Technology',
  'GOOGL': 'Technology',
  'META': 'Technology',
  'NVDA': 'Technology',
  'INTC': 'Technology',
  'AMD': 'Technology',
  
  // Communications
  'NFLX': 'Communications',
  'CMCSA': 'Communications',
  'DIS': 'Communications',
  'T': 'Communications',
  'VZ': 'Communications',
  
  // Consumer Cyclical
  'AMZN': 'Consumer Cyclical',
  'TSLA': 'Consumer Cyclical',
  'HD': 'Consumer Cyclical',
  'NKE': 'Consumer Cyclical',
  'SBUX': 'Consumer Cyclical',
  'MCD': 'Consumer Cyclical',
  
  // Energy
  'XOM': 'Energy',
  'CVX': 'Energy',
  'COP': 'Energy',
  'BP': 'Energy',
  
  // Utilities
  'NEE': 'Utilities',
  'DUK': 'Utilities',
  'SO': 'Utilities',
  'D': 'Utilities',
  
  // Basic Materials
  'LIN': 'Basic Materials',
  'BHP': 'Basic Materials',
  'RIO': 'Basic Materials',
  
  // Industrial
  'HON': 'Industrial',
  'UPS': 'Industrial',
  'CAT': 'Industrial',
  'BA': 'Industrial',
  'GE': 'Industrial',
  
  // Default for unknown symbols
  'default': 'Others'
};

// Define colors for each sector
const sectorColors: Record<string, string> = {
  'Technology': '#292b3c',
  'Communications': '#99ddff',
  'Consumer Cyclical': '#f9d673',
  'Energy': '#ff85c0',
  'Utilities': '#5bc0de',
  'Basic Materials': '#d9534f',
  'Industrial': '#aaaaaa',
  'Others': '#f0ad4e'
};

export default function SectorsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sectorData, setSectorData] = useState<{
    name: string;
    value: number;
    color: string;
  }[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  useEffect(() => {
    const fetchPositions = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching positions data...');
        const result = await getPositions();
        console.log('Positions data received:', result);
        
        if (!result || !Array.isArray(result) || result.length === 0) {
          setError('Received empty or invalid data from server');
          setLoading(false);
          return;
        }
        
        // Group positions by sector
        const sectorGroups: Record<string, number> = {};
        let total = 0;
        
        result.forEach((position: any) => {
          // Extract symbol and market value
          const symbol = position.symbol || '';
          let marketValue = position.marketValue;
          
          // Convert to number if it's a string
          if (typeof marketValue === 'string') {
            marketValue = parseFloat(marketValue);
          }
          
          // Skip if marketValue is invalid
          if (isNaN(marketValue) || marketValue <= 0) return;
          
          // Find sector for the symbol
          const sector = sectorMapping[symbol] || sectorMapping['default'];
          
          // Add to sector group
          if (!sectorGroups[sector]) {
            sectorGroups[sector] = 0;
          }
          sectorGroups[sector] += marketValue;
          total += marketValue;
        });
        
        console.log('Sector groups:', sectorGroups);
        console.log('Total market value:', total);
        
        // Convert to chart data format
        const chartData = Object.entries(sectorGroups).map(([name, value]) => ({
          name,
          value,
          color: sectorColors[name] || '#888888'
        }));
        
        if (chartData.length === 0) {
          setError('No sector data could be processed');
        } else {
          setSectorData(chartData);
          setTotalValue(total);
        }
      } catch (error) {
        console.error('Failed to fetch positions data:', error);
        setError('Failed to load positions data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPositions();
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sector Allocation</h1>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-md text-sm"
          disabled={loading}
        >
          Refresh Data
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="h-96">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="text-center">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500 mt-2">Loading sector data...</p>
              </div>
            </div>
          ) : sectorData.length > 0 ? (
            <SectorChart data={sectorData} totalValue={totalValue} />
          ) : (
            <div className="flex justify-center items-center h-full">
              <p className="text-gray-500">No sector data available</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Sector breakdown table */}
      {sectorData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Sector Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sector</th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sectorData
                  .sort((a, b) => b.value - a.value)
                  .map((sector, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: sector.color }}></div>
                          <div className="text-sm font-medium text-gray-900">{sector.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        ${sector.value.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                        {((sector.value / totalValue) * 100).toFixed(2)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
} 