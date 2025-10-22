import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '@/components/ui/card';

const COLORS = ["#0E6FFD", "#F97316"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white border shadow p-2 rounded text-sm">
        <p><span className='font-semibold'>{name}:</span> {value} units</p>
      </div>
    );
  }
  return null;
};

const CurrentPreviousIntervalUnitsPieChart = ({ currentUnits = 0, previousUnits = 0 }) => {
  const pieData = [
    { name: 'Current Interval', value: currentUnits },
    { name: 'Previous Interval', value: previousUnits }
  ];

  return (
    <Card className="py-2 px-1 mb-3">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={90}
            fill="#8884d8"
            dataKey="value"
            label={renderCustomizedLabel}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: value === 'Current Interval' ? COLORS[0] : COLORS[1] }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
      <p className="text-center text-xs text-gray-500 mt-1">Current vs Previous Interval Units</p>
    </Card>
  );
};

export default CurrentPreviousIntervalUnitsPieChart;