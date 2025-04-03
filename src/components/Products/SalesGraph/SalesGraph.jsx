import { Card } from "@/components/ui/card";
import { useMemo, useState } from "react";
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
import { DatePicker } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const SalesGraph = ({ saleReportData }) => {
  const [dateRange, setDateRange] = useState([null, null]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const defaultData = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return saleReportData
      .filter((report) => new Date(report._id) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a._id) - new Date(b._id))
      .map((report) => ({
        date: formatDate(report._id),
        totalSales: report.totalSales,
      }));
  }, [saleReportData]);

  const filteredChartData = useMemo(() => {
    const data = saleReportData
      .sort((a, b) => new Date(a._id) - new Date(b._id))
      .map((report) => ({
        date: formatDate(report._id),
        totalSales: report.totalSales,
      }));

    if (!dateRange[0] || !dateRange[1]) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return data.filter(({ date }) => new Date(date) >= thirtyDaysAgo);
    }

    const [startDate, endDate] = dateRange;
    return data.filter(({ date }) => {
      const current = new Date(date);
      return current >= startDate && current <= endDate;
    });
  }, [dateRange, saleReportData]);

  const onRangeChange = (dates, dateStrings) => {
    if (dates && dates[0] && dates[1]) {
      setDateRange([dates[0].toDate(), dates[1].toDate()]);
    } else {
      setDateRange([null, null]);
    }
  };

  const rangePresets = [
    { label: "Today", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
    {
      label: "Last 7 Days",
      value: [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "This Week",
      value: [dayjs().startOf("week"), dayjs().endOf("week")],
    },
    {
      label: "Last Week",
      value: [
        dayjs().subtract(1, "week").startOf("week"),
        dayjs().subtract(1, "week").endOf("week"),
      ],
    },
    {
      label: "Last 30 Days",
      value: [dayjs().subtract(30, "day").startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "Last 90 Days",
      value: [dayjs().subtract(90, "day").startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "This Month",
      value: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
    {
      label: "Last Month",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    {
      label: "Last 6 Months",
      value: [
        dayjs().subtract(6, "month").startOf("month"),
        dayjs().endOf("month"),
      ],
    },
    {
      label: "Year to Date",
      value: [dayjs().startOf("year"), dayjs().endOf("day")],
    },
  ];

  return (
    <div>
      <div>
        <RangePicker
          className="ant-datePicker-input"
          presets={rangePresets}
          onChange={onRangeChange}
        />
      </div>
      <Card className="my-4 py-3 mx-2">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={filteredChartData}>
            <CartesianGrid
              horizontal
              vertical={false}
              stroke="#e0e0e0"
              strokeWidth={0.5}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, angle: -45, textAnchor: "end" }}
              height={60}
              interval={0}
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
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderColor: "#ccc",
                borderRadius: 5,
              }}
              labelStyle={{ color: "#333" }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="totalSales"
              stroke="rgba(42, 156, 143, 1.0)"
              strokeWidth={2}
              dot={false}
              fill="rgba(42, 156, 143, 0.05)"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

export default SalesGraph;
