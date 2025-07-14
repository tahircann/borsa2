import React from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

interface SectorChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  totalValue: number;
}

const COLORS = [
  '#f0ad4e', // Others (orange)
  '#5bc0de', // Utilities (blue)
  '#ff85c0', // Energy (pink)
  '#d9534f', // Basic Materials (red)
  '#aaaaaa', // Industrial (gray)
  '#292b3c', // Technology (dark blue)
  '#f9d673', // Consumer Cyclical (yellow)
  '#99ddff', // Communications (light blue)
];

// Custom tooltip component
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const percentage = ((data.value / data.totalValue) * 100).toFixed(2);
    return (
      <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
        <p className="font-medium text-gray-900">{data.name}</p>
        <p className="text-gray-700 text-lg font-semibold">
          {percentage}%
        </p>
      </div>
    );
  }
  return null;
};

const SectorChart: React.FC<SectorChartProps> = ({ data, totalValue }) => {
  // Sort data from largest to smallest
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  // Add totalValue to each data item for percentage calculation in tooltip
  const enhancedData = sortedData.map(item => ({
    ...item,
    totalValue
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enhancedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
          >
            {enhancedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
          
          {/* Center text - only show the total value */}
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-gray-800 font-bold"
            fontSize="24"
          >
            {totalValue.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SectorChart; 