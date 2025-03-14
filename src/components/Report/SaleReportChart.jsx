import { useMemo } from "react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/card";

const transformData = (data) => {
  const groupedData = {};

  data.forEach((entry) => {
    const intervalParts = entry.interval.split("--");
    const startDate = new Date(intervalParts[0]);
    const month = startDate.toLocaleString("en-US", { month: "short" });
    const year = startDate.getFullYear();
    const day = startDate.getDate();

    const monthYear = `${month} ${year}`;

    if (!groupedData[day]) {
      groupedData[day] = { day };
    }

    groupedData[day][monthYear] = entry.unitCount;
    groupedData[day][`${monthYear}_price`] =
      entry.averageUnitPrice?.amount || 0;
  });

  return Object.values(groupedData);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #ccc",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
          zIndex: 1100,
          // position: "absolute",
          // maxHeight: "300px",
          // overflowY: "auto",
        }}
      >
        <p style={{ margin: 0, textAlign: "left" }}>Day {label}</p>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
              <th style={{ padding: "5px", fontWeight: "normal" }}>Month</th>
              <th style={{ padding: "5px", fontWeight: "normal" }}>
                Total Sales
              </th>
              <th style={{ padding: "5px", fontWeight: "normal" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {payload.map((entry, index) => {
              const monthName = entry.dataKey; // e.g., "Jan 2025"
              const totalSales = entry.payload[monthName] ?? 0;
              const avgPrice = entry.payload[`${monthName}_price`] ?? 0; // Extract from transformed data

              return (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "5px", color: entry.color }}>
                    {monthName}
                  </td>
                  <td style={{ padding: "5px" }}>{totalSales}</td>
                  <td style={{ padding: "5px" }}>${avgPrice.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return null;
};

function SaleReportChart({
  data,
  visibleMonths,
  chartLoading,
  colorMap,
  error,
}) {
  const chartData = useMemo(() => {
    return data.length ? transformData(data) : [];
  }, [data]);

  if (chartLoading) return <p>Loading sales data...</p>;
  if (error) return <p>Error loading sales data.</p>;

  return (
    <Card className="px-2 py-3">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid
            horizontal
            vertical={false}
            stroke="#d3d3d3"
            strokeWidth={0.4}
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}
            label={{
              value: "Total Sales",
              angle: -90,
              position: "insideLeft",
              style: { textAnchor: "middle", fontSize: "12px", fill: "#666" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {Object.keys(visibleMonths).map((month) =>
            visibleMonths[month] ? (
              <Line
                key={month}
                type="monotone"
                dataKey={month}
                stroke={colorMap[month] || "#000"}
                strokeWidth={2}
                dot={false}
              />
            ) : null
          )}
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

export default SaleReportChart;