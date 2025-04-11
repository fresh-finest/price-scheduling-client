import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Card } from '@/components/ui/card';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { units, price } = payload[0].payload;
    return (
      <div className="bg-white border shadow p-2 rounded text-sm">
        <p> <span className='font-semibold'> Date: </span> {label}</p>
        <p><span className='font-semibold'>Units:</span> {units}</p>
        <p><span className='font-semibold'>Price:</span> ${price}</p>
      </div>
    );
  }
  return null;
};

const transformMetricsToDaily = (metrics) => {
  return metrics.map((metric) => {
    const [startStr] = metric.interval.split('--');
    return {
      date: dayjs(startStr).format('YYYY-MM-DD'),
      units: metric.units || 0,
      price: parseFloat((metric.price || 0).toFixed(2))
    };
  }).sort((a, b) => new Date(a.date) - new Date(b.date));
};

const filterByDateRange = (data, range) => {
  if (!range || range.length !== 2) return data;
  const [start, end] = range.map(d => dayjs(d).startOf('day'));
  return data.filter((entry) => {
    const date = dayjs(entry.date);
    return date.isSameOrAfter(start) && date.isSameOrBefore(end);
  });
};

const CurrentIntervalUnitsLineChart = ({ metrics, currentDateRange , currentUnits}) => {


  if (!metrics || metrics.length === 0) return <p>No chart data available.</p>;

  const allChartData = transformMetricsToDaily(metrics);
  const chartData = filterByDateRange(allChartData, currentDateRange);

  return (
    <Card className=" px-1 py-2 mb-3">
      <ResponsiveContainer width="100%" height={130}>
        <LineChart data={chartData} margin={{ top: 10, right: 5, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal
            vertical={false}
            stroke="#d3d3d3"
            strokeWidth={0.4} />
          <XAxis dataKey="date" tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }}  />
          <YAxis    tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12 }}
                      label={{
                        value: "Total Units",
                        angle: -90,
                        position: "insideLeft",
                        style: { textAnchor: "middle", fontSize: "12px", fill: "#666" },
                      }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="units" stroke="#0E6FFD" strokeWidth={2} dot={false} />
        </LineChart>
       
      </ResponsiveContainer>

      <div className="flex items-center justify-between w-full mt-1">
  <div className="w-1/3 text-left">
    <p className="text-xs text-gray-500 pl-3">Total Unit Count: {currentUnits}</p>
  </div>
  <div className="w-1/3 text-center">
    <p className="text-xs text-gray-500">Current Interval Units</p>
  </div>
  <div className="w-1/3" /> {/* optional empty right side */}
</div>

    </Card>
  );
};

export default CurrentIntervalUnitsLineChart;