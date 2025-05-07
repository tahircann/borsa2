import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface AllocationChartProps {
  data: {
    name: string;
    value: number;
    color?: string;
  }[];
  totalValue: number;
  title?: string;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-gray-700">
          ${data.value.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="text-gray-600 text-sm">
          {((data.value / data.totalValue) * 100).toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

const AllocationChart: React.FC<AllocationChartProps> = ({ data, totalValue, title }) => {
  // Sort data from largest to smallest
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Add totalValue to each data item for percentage calculation in tooltip
  const enhancedData = sortedData.map(item => ({
    ...item,
    totalValue
  }));

  return (
    <div className="w-full h-full flex flex-col">
      {title && (
        <div className="text-center mb-2 text-lg font-medium text-gray-700">
          {title}
        </div>
      )}
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enhancedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={1}
              dataKey="value"
              labelLine={false}
            >
              {enhancedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#cccccc'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="vertical" 
              align="right" 
              verticalAlign="middle"
              formatter={(value, entry, index) => (
                <span className="text-xs">{value}</span>
              )}
            />
            
            {/* Center text showing LONG and the total value */}
            <text
              x="50%"
              y="43%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-gray-500"
              fontSize="14"
            >
              LONG
            </text>
            <text
              x="50%"
              y="57%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-gray-800 font-bold"
              fontSize="16"
            >
              {totalValue.toLocaleString(undefined, { 
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AllocationChart; 