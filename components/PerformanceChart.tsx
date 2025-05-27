import { useEffect, useRef, useState, useMemo } from 'react'
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

// Optimized date parsing with memoization
const dateParseCache = new Map<string, Date>();

const parseDate = (dateString: string): Date => {
  // Check cache first
  if (dateParseCache.has(dateString)) {
    return dateParseCache.get(dateString)!;
  }
  
  let date: Date;
  
  // Try most common formats first (optimize for speed)
  if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
    // ISO format: YYYY-MM-DD (fastest)
    date = new Date(dateString);
  } else if (/^\d{8}$/.test(dateString)) {
    // YYYYMMDD format
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    date = new Date(`${year}-${month}-${day}`);
  } else if (/^\d{10,13}$/.test(dateString)) {
    // Unix timestamp
    date = new Date(Number(dateString));
  } else {
    // Fallback to standard parsing
    date = new Date(dateString);
  }
  
  // Cache the result
  if (!isNaN(date.getTime())) {
    dateParseCache.set(dateString, date);
  }
  
  return date;
};

// Format date strings for display
const formatDate = (dateString: string): string => {
  try {
    const date = parseDate(dateString);
    
    if (isNaN(date.getTime())) {
      return dateString;
    }
    
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (err) {
    return dateString;
  }
};

// Format date for chart labels
const formatDateForChart = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export default function PerformanceChart({ data, spData }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Memoize processed data to avoid recalculation on every render
  const { processedData, processedSpData } = useMemo(() => {
    const portfolioData = [...data]
      .map(item => ({
        date: parseDate(item.date),
        value: item.value,
        return: item.return
      }))
      .filter(item => !isNaN(item.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const spData500 = spData ? 
      [...spData]
        .map(item => ({
          date: parseDate(item.date),
          value: item.value,
          return: item.return
        }))
        .filter(item => !isNaN(item.date.getTime()))
        .sort((a, b) => a.date.getTime() - b.date.getTime()) : [];

    return {
      processedData: portfolioData,
      processedSpData: spData500
    };
  }, [data, spData]);

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
            duration: 300, // Reduced from 1000ms to 300ms for faster loading
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
                maxTicksLimit: 6, // Reduced from 8 to 6 for better performance
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
  }, [processedData, processedSpData]);

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