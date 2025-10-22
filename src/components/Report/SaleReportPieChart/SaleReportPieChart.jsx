import { useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import PieChartLoadingSkeleton from "@/components/LoadingSkeleton/PieChartLoadingSkeleton";

const transformData = (data, visibleMonths) => {
  const monthlyData = {};

  data.forEach((entry) => {
    const startDate = new Date(entry.interval.split("--")[0]);
    const month = startDate.toLocaleString("en-US", { month: "short" });
    const year = startDate.getFullYear();
    const monthYear = `${month} ${year}`;

    if (visibleMonths[monthYear]) {
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0;
      }
      monthlyData[monthYear] += entry.unitCount;
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
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const SaleReportPieChart = ({
  data,
  visibleMonths,
  chartLoading,
  colorMap,
  error,
}) => {
  const chartData = useMemo(() => {
    return data.length ? transformData(data, visibleMonths) : [];
  }, [data, visibleMonths]);

  // if (chartLoading) return <p>Loading sales data...</p>;
  // if (chartLoading) return <PieChartLoadingSkeleton></PieChartLoadingSkeleton>;
  if (error) return <p>Error loading sales data.</p>;

  return (
    <Card className="px-2 py-3 ">
      <div className="flex justify-between gap-1 items-center">
       {chartLoading ? <PieChartLoadingSkeleton></PieChartLoadingSkeleton> :  <ResponsiveContainer width="100%" height={280}>
       <PieChart>
            <Pie
              data={chartData}
              dataKey="unitCount"
              nameKey="month"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={renderCustomLabel}
              labelLine={false}
              isAnimationActive={true}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorMap[entry.month] || "#000"}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          
        </ResponsiveContainer>}
      </div>
    </Card>
  );
};

export default SaleReportPieChart;