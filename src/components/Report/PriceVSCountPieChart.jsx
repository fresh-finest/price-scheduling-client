import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "../ui/card";

const COLORS = [
  "#E76E50",
  "#2A9D90",
  "#E8C468",
  "#F4A462",
  "#C1CFA1",
  "#EC7FA9",
  "#3ABEF9",
  "#2DAA9E",
  "#D84040",
  "#80CBC4",
  "#578FCA",
];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const PriceVSCountPieChart = ({ salesData = [], view, identifierType }) => {
  console.log("piechart data", salesData, view);
  if (view !== "month" || !salesData.length) return null;

  const totalUnits = salesData.reduce((sum, item) => sum + item.unitCount, 0);
  const pieData = salesData.map((item) => ({
    name: item.month,
    value: parseFloat(((item.unitCount / totalUnits) * 100).toFixed(2)),
  }));

  console.log("Rendering Pie Chart", pieData);

  return (
    <Card className="w-full flex justify-end  ">
      <ResponsiveContainer height={425}>
        {/* <ResponsiveContainer width="24%" height={350}> */}
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={renderCustomizedLabel}
            labelLine={false}
            dataKey="value"
            className="border"
          >
            {pieData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `${value}%`} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PriceVSCountPieChart;
