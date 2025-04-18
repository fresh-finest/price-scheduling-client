import { Card } from "@/components/ui/card";
import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const transformSelectedPieData = (entries, visibleMonths) => {
  const monthlyData = {};

  entries.forEach((entry) => {
    const startDate = new Date(entry.interval.split("--")[0]);
    const month = startDate.toLocaleString("en-US", { month: "short" });
    const year = startDate.getFullYear();
    const monthYear = `${month} ${year}`;

    if (visibleMonths[monthYear]) {
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += entry.units;
    }
  });

  return Object.entries(monthlyData).map(([month, unitCount]) => ({
    month,
    unitCount,
  }));
};

const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const SaleReportSelectedPieChart = ({ entries, visibleMonths, loading, error, colorMap }) => {
  const chartData = useMemo(() => {
    return entries.length ? transformSelectedPieData(entries, visibleMonths) : [];
  }, [entries, visibleMonths]);

  if (loading) return <p>Loading selected pie chart...</p>;
  if (error) return <p>Error loading selected pie chart.</p>;
  if (!chartData.length) return <p>No data available for selected product.</p>;

  return (
     <Card className="py-2 px-1 mb-3 ">


   
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="unitCount"
          nameKey="month"
          cx="50%"
          cy="50%"
          outerRadius={90}
          fill="#8884d8"
          label={renderCustomLabel}
          labelLine={false}
          isAnimationActive={true}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colorMap[entry.month] || "#000"} />
          ))}
        </Pie>
        <Tooltip />
        {/* <Legend /> */}
      </PieChart>
    </ResponsiveContainer>
    <p className="text-center text-xs text-gray-500 mt-1">By Month</p>
    </Card>
  );
};

export default SaleReportSelectedPieChart;
