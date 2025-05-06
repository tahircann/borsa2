import { useEffect, useRef, useState } from 'react'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

type PerformanceChartProps = {
  data: {
    date: string;
    value: number;
    return: number;
  }[];
}

// Format currency values for display
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(value);
};

// Format percentage values for display
const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

// Parse date from various formats
const parseDate = (dateString: string): Date => {
  // Add a log at start to see the exact format
  console.log(`Parsing date: "${dateString}" (length: ${dateString.length})`);
  
  // Common date formats in Turkish systems
  const formats = [
    // YYYYMMDD format (e.g., "20230520")
    { 
      regex: /^(\d{4})(\d{2})(\d{2})$/, 
      parser: (s: string) => {
        const year = s.substring(0, 4);
        const month = s.substring(4, 6);
        const day = s.substring(6, 8);
        return new Date(`${year}-${month}-${day}`);
      }
    },
    
    // Try direct parsing first (ISO format: YYYY-MM-DD)
    { regex: /^\d{4}-\d{2}-\d{2}/, parser: (s: string) => new Date(s) },
    
    // DD.MM.YYYY (common in Turkey)
    { 
      regex: /^(\d{2})\.(\d{2})\.(\d{4})/, 
      parser: (s: string) => {
        const parts = s.split('.');
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    },
    
    // DD/MM/YYYY
    { 
      regex: /^(\d{2})\/(\d{2})\/(\d{4})/, 
      parser: (s: string) => {
        const parts = s.split('/');
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      }
    },
    
    // MM/DD/YYYY (US format)
    { 
      regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})/, 
      parser: (s: string) => new Date(s)
    },
    
    // Unix timestamp (milliseconds)
    {
      regex: /^\d{10,13}$/,
      parser: (s: string) => new Date(Number(s))
    },
    
    // Day-Month-Year (e.g., "20 Mayıs 2023")
    {
      regex: /^(\d{1,2})\s+([A-Za-zçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})$/,
      parser: (s: string) => {
        const months = {
          'ocak': 0, 'şubat': 1, 'mart': 2, 'nisan': 3, 'mayıs': 4, 'haziran': 5,
          'temmuz': 6, 'ağustos': 7, 'eylül': 8, 'ekim': 9, 'kasım': 10, 'aralık': 11
        };
        
        const parts = s.match(/^(\d{1,2})\s+([A-Za-zçğıöşüÇĞİÖŞÜ]+)\s+(\d{4})$/);
        if (parts) {
          const day = parseInt(parts[1]);
          const monthStr = parts[2].toLowerCase();
          const year = parseInt(parts[3]);
          
          // Find month index
          let monthIndex = -1;
          for (const [name, index] of Object.entries(months)) {
            if (monthStr.startsWith(name) || name.startsWith(monthStr)) {
              monthIndex = index;
              break;
            }
          }
          
          if (monthIndex >= 0) {
            return new Date(year, monthIndex, day);
          }
        }
        return new Date('Invalid Date');
      }
    }
  ];
  
  for (const format of formats) {
    if (format.regex.test(dateString)) {
      const date = format.parser(dateString);
      if (!isNaN(date.getTime())) {
        console.log(`Successfully parsed "${dateString}" to ${date.toLocaleDateString('tr-TR')}`);
        return date;
      }
    }
  }
  
  // Log problematic date for debugging
  console.log(`Could not parse date: "${dateString}"`);
  return new Date('Invalid Date');
};

// Format date strings for display
const formatDate = (dateString: string): string => {
  try {
    // Check if the date is a valid date string
    if (!dateString || dateString === 'Invalid Date') {
      return 'Geçersiz Tarih';
    }
    
    // Try to parse the date using our custom parser
    const date = parseDate(dateString);
    
    // Verify we have a valid date
    if (isNaN(date.getTime())) {
      console.log(`Invalid date format: ${dateString}`);
      return dateString; // Return original string if can't be parsed
    }
    
    // Format date as DD MMM YYYY (e.g., "20 May 2023")
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (err) {
    console.error(`Error formatting date: ${dateString}`, err);
    return dateString; // Return original if there's an error
  }
};

// Format date for sorting and internal use
const formatDateForChart = (date: Date): string => {
  const year = date.getFullYear();
  // Month is 0-indexed, so add 1 and pad with leading zero if needed
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debug array for console
  const dataPoints = data.map(point => `${formatDate(point.date)}: ${point.return}`);
  console.log("Data points to be charted:", dataPoints);

  useEffect(() => {
    // Clean up previous chart instance if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (!data || data.length === 0) {
      setError("No data provided to chart");
      return;
    }

    if (!chartRef.current) {
      setError("Chart canvas not found");
      return;
    }

    try {
      // Sort data by date
      const sortedData = [...data].sort((a, b) => {
        try {
          const dateA = parseDate(a.date);
          const dateB = parseDate(b.date);
          
          // If either date is invalid, fall back to string comparison
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
            return a.date.localeCompare(b.date);
          }
          
          return dateA.getTime() - dateB.getTime();
        } catch (err) {
          console.error('Error sorting dates:', err);
          return a.date.localeCompare(b.date);
        }
      });

      // Create datasets
      const ctx = chartRef.current.getContext('2d');
      
      if (!ctx) {
        setError("Could not get canvas context");
        return;
      }

      // Determine if trend is positive for coloring
      const startValue = sortedData[0].return;
      const endValue = sortedData[sortedData.length - 1].return;
      const isPositive = endValue >= startValue;
      
      const chartColor = isPositive ? '#10b981' : '#ef4444'; // green or red
      
      // Find min and max values for better scaling
      const returnValues = sortedData.map(item => item.return);
      const minReturn = Math.min(...returnValues);
      const maxReturn = Math.max(...returnValues);
      
      // Create buffer for better visualization (10% padding)
      const range = Math.max(Math.abs(minReturn), Math.abs(maxReturn));
      const buffer = range * 0.2;
      
      // Create simple chart
      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sortedData.map(item => {
            const date = parseDate(item.date);
            if (!isNaN(date.getTime())) {
              return formatDateForChart(date);
            }
            return item.date; // Fallback to original string
          }),
          datasets: [{
            label: 'Kar/Zarar',
            data: sortedData.map(item => item.return),
            borderColor: chartColor,
            backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            fill: {
              target: 'origin',
              above: 'rgba(16, 185, 129, 0.1)', // Green area for values above zero
              below: 'rgba(239, 68, 68, 0.1)'   // Red area for values below zero
            }
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: false,
              ticks: {
                callback: function(value) {
                  return formatPercentage(Number(value));
                },
                // Force the chart to show more ticks for better readability
                count: 10
              },
              // Ensure zero is included and visible
              suggestedMin: Math.min(minReturn - buffer, 0),
              suggestedMax: Math.max(maxReturn + buffer, 0),
              grid: {
                color: (context) => {
                  // Highlight the zero line
                  if (context.tick.value === 0) {
                    return 'rgba(0, 0, 0, 0.5)';
                  }
                  return 'rgba(0, 0, 0, 0.1)';
                },
                lineWidth: (context) => {
                  // Make zero line thicker
                  if (context.tick.value === 0) {
                    return 2;
                  }
                  return 1;
                }
              }
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function(context) {
                  return formatPercentage(context.parsed.y);
                }
              }
            },
            title: {
              display: true,
              text: 'Portföy Kar/Zarar Grafiği'
            }
          }
        }
      });
      
      setError(null);
    } catch (err) {
      console.error("Error creating chart:", err);
      setError(`Error creating chart: ${err instanceof Error ? err.message : String(err)}`);
    }

    return () => {
      // Cleanup
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data]);

  return (
    <div className="w-full h-full">
      {error && (
        <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
          <p className="font-bold">Chart Error:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="relative h-96">
        <canvas ref={chartRef}></canvas>
      </div>
      
      {/* Debug information */}
      <div className="mt-4 p-3 bg-gray-100 text-xs rounded">
        <details>
          <summary className="cursor-pointer font-semibold">Debug Data ({data.length} points)</summary>
          <div className="mt-2 max-h-40 overflow-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-1 border text-left">Index</th>
                  <th className="p-1 border text-left">Date</th>
                  <th className="p-1 border text-right">Return</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, i) => {
                  const parsedDate = parseDate(item.date);
                  const formattedDate = !isNaN(parsedDate.getTime()) 
                    ? formatDateForChart(parsedDate)
                    : 'Invalid Date';
                    
                  return (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="p-1 border text-center">{i + 1}</td>
                      <td className="p-1 border">
                        <div>{formatDate(item.date)}</div>
                        <div className="text-xs text-gray-500">{formattedDate}</div>
                      </td>
                      <td className="p-1 border text-right">{(item.return * 100).toFixed(2)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
} 