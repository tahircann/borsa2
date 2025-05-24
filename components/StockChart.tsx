import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

type StockChartProps = {
  period: string;
}

export default function StockChart({ period }: StockChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Generate mock data based on period
  const generateData = (period: string) => {
    const labels: string[] = []
    const data: number[] = []
    
    let days = 30
    switch (period) {
      case '1w': days = 7; break;
      case '1m': days = 30; break;
      case '3m': days = 90; break;
      case '6m': days = 180; break;
      case '1y': days = 365; break;
      case 'all': days = 730; break;
    }
    
    let value = 100000
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - (days - i))
      labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      
      // Random daily change, slightly biased upward
      const change = (Math.random() * 4) - 1.5
      value = value * (1 + change / 100)
      data.push(value)
    }
    
    return { labels, data }
  }

  // toLocaleString yerine sabit formatlama kullan
  const formatChartCurrency = (value: number): string => {
    const fixed = value.toFixed(2);
    const parts = fixed.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `$${integerPart}.${parts[1]}`;
  };

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
      
      const { labels, data } = generateData(period)
      
      // Create new chart
      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        // Create gradient for the chart
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)'); // Green with transparency
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');

        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Portfolio Value',
              data,
              borderColor: '#22C55E', // Modern green
              backgroundColor: gradient,
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 6,
              pointHoverBackgroundColor: '#16A34A',
              pointHoverBorderColor: '#FFFFFF',
              pointHoverBorderWidth: 3,
            }]
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
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(17, 24, 39, 0.95)',
                titleColor: '#F9FAFB',
                bodyColor: '#F9FAFB',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                titleFont: {
                  size: 14,
                  weight: 600,
                },
                bodyFont: {
                  size: 13,
                },
                padding: 12,
                callbacks: {
                  label: function(context) {
                    return `Portfolio Value: ${formatChartCurrency(context.parsed.y)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                display: true,
                grid: {
                  display: false
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
                  maxTicksLimit: 8
                }
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
                  callback: function(value) {
                    return formatChartCurrency(Number(value));
                  },
                  padding: 8,
                }
              }
            }
          }
        })
      }
    }
    
    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [period])

  return (
    <div className="h-80">
      <canvas ref={chartRef}></canvas>
    </div>
  )
} 