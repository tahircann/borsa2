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

const SectorChart: React.FC<SectorChartProps> = ({ data, totalValue }) => {
  // Sort data from largest to smallest
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={sortedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
          >
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`$${value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`, '']}
          />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
          
          {/* Center text */}
          <text
            x="50%"
            y="45%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-gray-500 font-light"
            fontSize="16"
          >
            LONG
          </text>
          <text
            x="50%"
            y="55%"
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