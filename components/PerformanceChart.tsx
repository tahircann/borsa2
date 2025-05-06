import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

// Register Chart.js components
Chart.register(...registerables)

type PerformanceChartProps = {
  data: {
    date: string;
    value: number;
  }[];
}

// toLocaleString yerine sabit formatlama kullan
const formatChartCurrency = (value: number): string => {
  const fixed = value.toFixed(2);
  const parts = fixed.split('.');
  const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `$${integerPart}.${parts[1]}`;
};

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartRef.current) {
      // Destroy previous chart if it exists
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
      
      const labels = data.map(item => {
        const date = new Date(item.date)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
      
      const values = data.map(item => item.value)
      
      // Create new chart
      const ctx = chartRef.current.getContext('2d')
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: 'Portfolio Value ($)',
              data: values,
              borderColor: '#0284c7',
              backgroundColor: 'rgba(2, 132, 199, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 2,
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
  }, [data])

  return (
    <canvas ref={chartRef}></canvas>
  )
} 