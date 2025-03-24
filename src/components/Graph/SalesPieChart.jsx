import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Text,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AA00FF",
  "#FF1493",
  "#32CD32",
  "#E91E63",
  "#9C27B0",
  "#4CAF50",
  "#3F51B5",
  "#FF5722",
];

// ✅ Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0];
    return (
      <div className="bg-white border px-3 py-2 rounded shadow text-sm">
        <p><strong>{name}</strong></p>
        <p>Units Sold: {value}</p>
        <p>{(percent * 100).toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

// ✅ Custom Label inside pie
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) / 2;
  const RADIAN = Math.PI / 180;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <Text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {percent > 0.02 ? `${(percent * 100).toFixed(0)}%` : ""}
    </Text>
  );
};

// ✅ Custom Legend component
const CustomLegend = ({ payload }) => {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm pl-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center w-1/2">
          <div
            className="w-3 h-3 mr-2 rounded-sm"
            style={{ backgroundColor: entry.color }}
          ></div>
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

const SalesPieChart = ({ data }) => {
  return (
    <div className="flex justify-center items-start gap-6 w-full">
      {/* Pie chart */}
      <div className="w-[250px] h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomizedLabel}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-col justify-center">
        <CustomLegend
          payload={data.map((entry, index) => ({
            value: entry.name,
            color: COLORS[index % COLORS.length],
          }))}
        />
      </div>
    </div>
  );
};

export default SalesPieChart;
