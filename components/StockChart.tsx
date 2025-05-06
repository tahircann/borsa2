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
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Portfolio Value ($)',
              data,
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 0,
              pointHoverRadius: 4
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                  label: function(context) {
                    return formatChartCurrency(context.parsed.y);
                  }
                }
              }
            },
            scales: {
              x: {
                grid: {
                  display: false
                },
                ticks: {
                  maxTicksLimit: 10
                }
              },
              y: {
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                  callback: function(value) {
                    return formatChartCurrency(Number(value));
                  }
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