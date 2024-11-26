import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  LabelList,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "../ui/chart";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

const  ScheduleSalesDetailsBarChart=({
  view,
  scheduleSalesData,
})=> {
  const xAxisKey = useMemo(() => "interval", [view]);

  function formatXAxisLabel(value) {
    const [start, end] = value.split(" - ");
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    // Format start date with the year
    const startFormat = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric", // Always include the year
      hour: "numeric",
      minute: "numeric",
    });

    // Format end date with the year
    const endFormat = endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric", // Always include the year
      hour: "numeric",
      minute: "numeric",
    });

    // Same day case
    if (startDate.toDateString() === endDate.toDateString()) {
      const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
      return `${startFormat} - ${endTime}`;
    }

    // Same year case but different days
    if (startYear === endYear) {
      const startWithoutYear = startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
      return `${startWithoutYear} - ${endFormat}`;
    }

    // Different year case
    return `${startFormat} - ${endFormat}`;
  }

  const showLabels = scheduleSalesData.length <= 31;

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const unitCount = payload[0].value;
      const price =
        payload[0].payload?.price || payload[0].payload?.averagePrice;

      // Format the interval label
      const formattedInterval = formatXAxisLabel(label);

      return (
        <div className="rounded bg-white w-[170px] border shadow-lg py-2 px-2">
          {formattedInterval && (
            <p className="font-semibold text-xs">{formattedInterval}</p>
          )}

          <div className="grid grid-cols-[10px_70px_auto] gap-x-2 items-center mt-1 text-xs">
            <span className="w-[10px] h-[10px] bg-[#E9907A]"></span>
            <span className="text-gray-600">Unit Count</span>
            <span className="font-semibold text-right">{unitCount}</span>
          </div>

          {
            <div className="grid grid-cols-[10px_70px_auto] gap-x-2 items-center text-xs mt-0.5">
              <span className="w-[10px] h-[10px] bg-transparent"></span>
              <span className="text-gray-600">Price</span>
              {price ? (
                <span className="font-semibold text-right">${price}</span>
              ) : (
                <span className="font-semibold text-right">0</span>
              )}
            </div>
          }
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <CardHeader className="items-center pb-0">
        <CardTitle>On Schedule Sale Report</CardTitle>
      </CardHeader>
      <CardContent className="px-2  sm:p-6">
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto w-full ${
            view === "week" ? "h-[400px]" : "h-[400px]"
          }`}
        >
          <BarChart
            data={scheduleSalesData}
            margin={{
              top: 40,
              right: 30,
              left: 20,
              bottom: 140,
            }}
            barCategoryGap="20%"
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey={xAxisKey}
              tickFormatter={(value) => formatXAxisLabel(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-40}
              textAnchor={"end"}
              dx={-10}
            />

            <YAxis
              dataKey="unitCount"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              allowDecimals={false}
              label={{
                value: "Units Sold",
                angle: -90,
                position: "insideLeft",
              }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Bar dataKey="unitCount" fill="#ED927C" barSize={40}>
              {showLabels && (
                <>
                  <LabelList
                    dataKey={"price"}
                    position="top"
                    formatter={(value) => `$${value}`}
                  />

                  <LabelList
                    dataKey="unitCount"
                    position="top"
                    offset={19}
                    formatter={(value) => `${value}`}
                    fontSize={12}
                    fill="#555"
                    fontWeight="bold"
                  />
                </>
              )}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </>
  );
}
export default ScheduleSalesDetailsBarChart;