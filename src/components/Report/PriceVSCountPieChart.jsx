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
  "#4793AF"
];


const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const monthShort = name.slice(0, 3);

  return (
    <g>
      <text
        x={x}
        y={y - 8}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {(percent * 100).toFixed(1)}%
      </text>
      <text
        x={x}
        y={y + 8}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
      >
        {monthShort}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }) => {
  console.log('custom tool tip payload', payload)
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2 border rounded text-sm shadow">
        <p><strong>{data.name}</strong></p>
        <p>Units Sold: {data.unitCount}</p>
        <p>Avg Price: ${data.averageAmount}</p>
      </div>
    );
  }
  return null;
};


const CustomLegend = ({ payload }) => {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {payload.map((entry, index) => {
        const [month, year] = entry.value.split(", ");
        const shortMonth = month.slice(0, 3);
        const shortYear = year.slice(-2);
        const percent = entry.payload?.value?.toFixed(1) ?? 0;

        return (
          <li key={`item-${index}`} style={{ marginBottom: 2, marginRight: 33, display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 12,
                height: 12,
                backgroundColor: entry.color,
                marginRight: 8,
                borderRadius: 2,
              }}
            />
            <span style={{ color: "#000", fontSize: 15 }}> {`${shortMonth}, ${shortYear} - ${percent}%`}</span>
          </li>
        );
      })}
    </ul>
  );
};


const PriceVSCountPieChart = ({ salesData = [], view, identifierType }) => {

  if (view !== "month" || !salesData.length) return null;

  const totalUnits = salesData.reduce((sum, item) => sum + item.unitCount, 0);
  const pieData = salesData
    .map((item) => ({
      name: item.month,
      value: parseFloat(((item.unitCount / totalUnits) * 100).toFixed(2)),
      unitCount: item.unitCount, 
      averageAmount: item.averageAmount
    }))
    .filter((item) => item.value > 0);

  console.log("Rendering Pie Chart", pieData);

  console.log('sales data price vs count pie chart', salesData)

  return (
    <Card className="w-full flex justify-end  ">
      <ResponsiveContainer height={425}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={160}
            label={(props) =>
              renderCustomizedLabel({ ...props, name: props.name })
            }
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
          {/* <Tooltip formatter={(value) => `${value}%`} /> */}
          <Tooltip content={<CustomTooltip/>}/>
          {/* <Legend layout="vertical" verticalAlign="middle" align="right" /> */}
          <Legend
              content={<CustomLegend />}
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />

        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default PriceVSCountPieChart;