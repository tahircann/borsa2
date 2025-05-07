import { useState, useEffect } from 'react';
import { getAllocation, AllocationData, AllocationItem } from '@/services/ibapi';
import AllocationChart from '@/components/AllocationChart';

export default function AllocationPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allocationData, setAllocationData] = useState<AllocationData | null>(null);

  // Calculate total values
  const calculateTotal = (data: AllocationItem[] | undefined): number => {
    if (!data || data.length === 0) return 0;
    return data.reduce((sum, item) => sum + item.value, 0);
  };

  useEffect(() => {
    const fetchAllocationData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching allocation data...');
        const result = await getAllocation();
        console.log('Allocation data received:', result);
        
        // Validate the received data
        if (!result) {
          throw new Error('Received empty data from server');
        }
        
        // Check if any of the arrays are empty
        const hasAssetClass = result.assetClass && result.assetClass.length > 0;
        const hasSector = result.sector && result.sector.length > 0;
        const hasIndustry = result.industry && result.industry.length > 0;
        
        if (!hasAssetClass && !hasSector && !hasIndustry) {
          throw new Error('No allocation data available');
        }
        
        setAllocationData(result);
      } catch (error: any) {
        console.error('Failed to fetch allocation data:', error);
        setError(`Failed to load allocation data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllocationData();
  }, []);

  // Calculate totals
  const assetClassTotal = calculateTotal(allocationData?.assetClass);
  const sectorTotal = calculateTotal(allocationData?.sector);
  const industryTotal = calculateTotal(allocationData?.industry);

  // Add default colors if missing
  const addDefaultColors = (items: AllocationItem[] | undefined, defaultColors: string[]): AllocationItem[] => {
    if (!items) return [];
    return items.map((item, index) => ({
      ...item,
      color: item.color || defaultColors[index % defaultColors.length]
    }));
  };

  // Default color palettes
  const assetClassColors = ['#8fffa9', '#e9e9e9', '#75d7ff', '#c9c9c9'];
  const sectorColors = ['#292b3c', '#f9d673', '#ff85c0', '#aaaaaa', '#5bc0de', '#99ddff', '#d9534f', '#f0ad4e'];
  const industryColors = ['#bc8f50', '#f0ad4e', '#ceeaff', '#f3f3ab', '#ffea95', '#ff7575', '#ffc8b3', '#9e9e9e'];

  // Process data with default colors
  const processedAssetClass = addDefaultColors(allocationData?.assetClass, assetClassColors);
  const processedSector = addDefaultColors(allocationData?.sector, sectorColors);
  const processedIndustry = addDefaultColors(allocationData?.industry, industryColors);

  // Check if we have data to show
  const hasAssetClassData = processedAssetClass.length > 0 && assetClassTotal > 0;
  const hasSectorData = processedSector.length > 0 && sectorTotal > 0;
  const hasIndustryData = processedIndustry.length > 0 && industryTotal > 0;

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Portfolio Allocation</h1>
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

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 mt-2">Loading allocation data...</p>
          </div>
        </div>
      ) : !hasAssetClassData && !hasSectorData && !hasIndustryData ? (
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14a2 2 0 100-4 2 2 0 000 4z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <p className="text-gray-500">No allocation data available</p>
            <p className="text-gray-400 text-sm mt-2">Check your connection to the data source</p>
          </div>
        </div>
      ) : (
        <>
          {/* Grid of three charts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Asset Class Chart */}
            {hasAssetClassData ? (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-[300px]">
                  <AllocationChart 
                    data={processedAssetClass} 
                    totalValue={assetClassTotal} 
                    title="Asset Class" 
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
                <p className="text-gray-500">No asset class data</p>
              </div>
            )}
            
            {/* Sector Chart */}
            {hasSectorData ? (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-[300px]">
                  <AllocationChart 
                    data={processedSector} 
                    totalValue={sectorTotal} 
                    title="Sector" 
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
                <p className="text-gray-500">No sector data</p>
              </div>
            )}
            
            {/* Industry Chart */}
            {hasIndustryData ? (
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-[300px]">
                  <AllocationChart 
                    data={processedIndustry} 
                    totalValue={industryTotal} 
                    title="Industry" 
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center">
                <p className="text-gray-500">No industry data</p>
              </div>
            )}
          </div>
          
          {/* Tables for each allocation type */}
          <div className="space-y-8">
            {/* Asset Class Table */}
            {hasAssetClassData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Asset Class Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asset Class</th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processedAssetClass
                        .sort((a, b) => b.value - a.value)
                        .map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              ${item.value.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {((item.value / assetClassTotal) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Sector Table */}
            {hasSectorData && (
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
                      {processedSector
                        .sort((a, b) => b.value - a.value)
                        .map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              ${item.value.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {((item.value / sectorTotal) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Industry Table */}
            {hasIndustryData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Industry Breakdown</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                        <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {processedIndustry
                        .sort((a, b) => b.value - a.value)
                        .map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-3 h-3 mr-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              ${item.value.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                              {((item.value / industryTotal) * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
} 