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
  spData?: {
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

export default function PerformanceChart({ data, spData }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debug array for console
  const dataPoints = data.map(point => `${formatDate(point.date)}: ${point.return}`);
  console.log("Data points to be charted:", dataPoints);
  if (spData) {
    const spDataPoints = spData.map(point => `${formatDate(point.date)}: ${point.return}`);
    console.log("S&P 500 data points:", spDataPoints);
  }

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

    setError(null);
    
    try {
      // Process and sort data by date
      const processedData = [...data]
        .map(item => ({
          date: parseDate(item.date),
          value: item.value,
          return: item.return
        }))
        .filter(item => !isNaN(item.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime());

      const processedSpData = spData ? 
        [...spData]
          .map(item => ({
            date: parseDate(item.date),
            value: item.value,
            return: item.return
          }))
          .filter(item => !isNaN(item.date.getTime()))
          .sort((a, b) => a.date.getTime() - b.date.getTime()) : [];

      if (processedData.length === 0) {
        setError("No valid data points to display");
        return;
      }

      const labels = processedData.map(item => formatDateForChart(item.date));
      const portfolioReturns = processedData.map(item => item.return * 100); // Convert to percentage
      const spReturns = processedSpData.map(item => item.return * 100);

      const ctx = chartRef.current.getContext('2d');
      if (!ctx) {
        setError("Could not get canvas context");
        return;
      }

      // Create gradients for the lines
      const portfolioGradient = ctx.createLinearGradient(0, 0, 0, 400);
      portfolioGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)'); // Blue with transparency
      portfolioGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');

      const spGradient = ctx.createLinearGradient(0, 0, 0, 400);
      spGradient.addColorStop(0, 'rgba(156, 163, 175, 0.2)'); // Gray with transparency
      spGradient.addColorStop(1, 'rgba(156, 163, 175, 0.05)');

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Portfolio Performance',
              data: portfolioReturns,
              borderColor: '#3B82F6', // Modern blue
              backgroundColor: portfolioGradient,
              borderWidth: 3,
              fill: true,
              tension: 0.4, // Smoother curves
              pointBackgroundColor: '#3B82F6',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#1D4ED8',
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 3,
            },
            ...(spReturns.length > 0 ? [{
              label: 'S&P 500',
              data: spReturns,
              borderColor: '#6B7280', // Modern gray
              backgroundColor: spGradient,
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#6B7280',
              pointBorderColor: '#FFFFFF',
              pointBorderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: '#4B5563',
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 2,
            }] : []),
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            intersect: false,
            mode: 'index',
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart',
          },
          plugins: {
            legend: {
              display: true,
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                borderRadius: 6,
                color: '#374151',
                font: {
                  size: 13,
                  weight: 500,
                },
                padding: 20,
                usePointStyle: true,
                pointStyle: 'circle',
              },
            },
            tooltip: {
              backgroundColor: 'rgba(17, 24, 39, 0.95)',
              titleColor: '#F9FAFB',
              bodyColor: '#F9FAFB',
              borderColor: '#E5E7EB',
              borderWidth: 1,
              cornerRadius: 8,
              displayColors: true,
              titleFont: {
                size: 14,
                weight: 600,
              },
              bodyFont: {
                size: 13,
              },
              padding: 12,
              callbacks: {
                title: function(context: any) {
                  if (context[0]?.dataIndex !== undefined) {
                    const dateStr = labels[context[0].dataIndex];
                    return formatDate(dateStr);
                  }
                  return '';
                },
                label: function(context: any) {
                  const value = context.parsed.y;
                  const datasetLabel = context.dataset.label || '';
                  return `${datasetLabel}: ${formatPercentage(value / 100)}`;
                },
              },
            },
          },
          scales: {
            x: {
              display: true,
              grid: {
                display: false,
              },
              border: {
                display: false,
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12,
                  weight: 400,
                },
                maxTicksLimit: 8,
                callback: function(value: any, index: number) {
                  const dateStr = labels[index];
                  if (dateStr) {
                    return formatDate(dateStr);
                  }
                  return '';
                },
              },
            },
            y: {
              display: true,
              position: 'left',
              grid: {
                color: 'rgba(156, 163, 175, 0.2)',
              },
              border: {
                display: false,
              },
              ticks: {
                color: '#6B7280',
                font: {
                  size: 12,
                  weight: 400,
                },
                callback: function(value: any) {
                  return formatPercentage(value / 100);
                },
                padding: 8,
              },
            },
          },
        },
      });
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
  }, [data, spData]);

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
    </div>
  );
} 