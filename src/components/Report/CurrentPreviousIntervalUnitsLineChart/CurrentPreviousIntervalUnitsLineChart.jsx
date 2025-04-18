import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import dayjs from 'dayjs';
import { Card } from '@/components/ui/card';

const formatDate = (date) => dayjs(date).format('DD MMM, YY');

const transformMetrics = (metrics, labelKey) => {
  return metrics.map((metric) => {
    const [startStr] = metric.interval.split('--');
    return {
      date: formatDate(startStr),
      rawDate: startStr,
      units: metric.units || 0,
      price: metric.price || 0,
      [labelKey]: metric.units || 0,
    };
  });
};

const mergeDataByIndex = (currentMetrics, previousMetrics) => {
  const maxLen = Math.max(currentMetrics.length, previousMetrics.length);
  const merged = [];

  for (let i = 0; i < maxLen; i++) {
    const curr = currentMetrics[i] || {};
    const prev = previousMetrics[i] || {};

    merged.push({
      xLabel: ``,
      currentUnits: curr.rawDate ? curr.units || 0 : null,
      previousUnits: prev.rawDate ? prev.units || 0 : null,
      currentPrice: curr.price || 0,
      previousPrice: prev.price || 0,
      currentDate: curr.rawDate || '',
      previousDate: prev.rawDate || ''
    });
  }

  return merged;
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { currentUnits, previousUnits, currentDate, previousDate, currentPrice, previousPrice } = payload[0].payload;
    return (
      <div className="bg-white border shadow p-2 rounded text-sm">
        <table className="table-auto text-xs w-full">
          <thead>
            <tr className="border-b">
              <th className="px-2 py-1 text-left font-semibold">Label</th>
              <th className="px-2 py-1 text-left font-semibold">Units</th>
              <th className="px-2 py-1 text-left font-semibold">Price</th>
              <th className="px-2 py-1 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="px-2 py-1 text-[#0E6FFD] font-medium">Current</td>
              <td className="px-2 py-1">{currentUnits ?? '-'}</td>
              <td className="px-2 py-1">${currentPrice}</td>
              <td className="px-2 py-1">{currentDate ? formatDate(currentDate) : '-'}</td>
            </tr>
            <tr>
              <td className="px-2 py-1 text-[#F97316] font-medium">Previous</td>
              <td className="px-2 py-1">{previousUnits ?? '-'}</td>
              <td className="px-2 py-1">${previousPrice}</td>
              <td className="px-2 py-1">{previousDate ? formatDate(previousDate) : '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
  return null;
};

const CurrentPreviousIntervalUnitsLineChart = ({ currentMetrics, previousMetrics }) => {
  if ((!currentMetrics || currentMetrics.length === 0) && (!previousMetrics || previousMetrics.length === 0)) {
    return <p>No data available.</p>;
  }

  const currentData = transformMetrics(currentMetrics, 'currentUnits');
  const previousData = transformMetrics(previousMetrics, 'previousUnits');
  const chartData = mergeDataByIndex(currentData, previousData);

  const currentStart = currentMetrics[0]?.interval?.split('--')[0];
  const currentEnd = currentMetrics.at(-1)?.interval?.split('--')[0];
  const prevStart = previousMetrics[0]?.interval?.split('--')[0];
  const prevEnd = previousMetrics.at(-1)?.interval?.split('--')[0];

  return (
    <Card className="px-2 py-3 mb-3">
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={chartData} margin={{ top: 10, right: 5, bottom: 0, left: 0 }}>
          <CartesianGrid horizontal vertical={false} stroke="#e0e0e0" strokeWidth={0.4} />
          <XAxis
            dataKey="xLabel"
            interval={0}
            axisLine={false}
            tickLine={false}
            tick={false}
          />
          <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="currentUnits"
            stroke="#0E6FFD"
            strokeWidth={2}
            dot={false}
            name="Current"
            connectNulls={false}
          />
          <Line
            type="monotone"
            dataKey="previousUnits"
            stroke="#F97316"
            strokeWidth={2}
            dot={false}
            name="Previous"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="flex items-center justify-between  px-4 text-xs">
        <div className="flex flex-col items-start space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-[2px] bg-[#F97316] block" />
            <span className="text-[#F97316]">Previous</span>
            <span className='text-[#F97316]'> ({prevStart && prevEnd ? `${formatDate(prevStart)} → ${formatDate(prevEnd)}` : ''})</span>
          </div>
        </div>

        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-4 h-[2px] bg-[#0E6FFD] block" />
            <span className="text-[#0E6FFD]">Current</span>
            <span className="text-[#0E6FFD]">({currentStart && currentEnd ? `${formatDate(currentStart)} → ${formatDate(currentEnd)}` : ''})</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CurrentPreviousIntervalUnitsLineChart;