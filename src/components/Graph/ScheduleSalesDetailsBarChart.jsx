import React, { useState, useMemo } from "react";
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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../ui/chart";
import { TrendingUp } from "lucide-react";

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

const CustomXAxisTick = ({ x, y, payload }) => {
  // Shorten the date range text (e.g., "August 20 - August 24, 2024" -> "Aug 20 - Aug 24")
  const [startDate, endDate] = payload.value.split(" - ");
  const shortStartDate = new Date(startDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const shortEndDate = new Date(endDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const shortLabel = `${shortStartDate} - ${shortEndDate}`;

  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fill="#666"
      transform="rotate(-30)"
      title={payload.value}
    >
      {shortLabel}
    </text>
  );
};

const  ScheduleSalesDetailsBarChart=({
  view,
  scheduleSalesData,
})=> {
  const [activeChart, setActiveChart] = useState("desktop");

  console.log("sales data", scheduleSalesData);
  console.log("view", view);

  // Determine the dataKey for the X-axis dynamically
  const xAxisKey = useMemo(() => {
    return "interval"; // Default to "date"
  }, [view]);

  // function formatXAxisLabel(value) {
  //   const [start, end] = value.split(" - ");
  //   const formatOptions = {
  //     month: "short",
  //     day: "numeric",
  //     hour: "numeric",
  //     minute: "numeric",
  //   };

  //   const startDate = new Date(start)
  //     .toLocaleDateString("en-US", formatOptions)
  //     .replace(", ", " at ");
  //   const endDate = new Date(end)
  //     .toLocaleDateString("en-US", formatOptions)
  //     .replace(", ", " at ");

  //   return `${startDate} - ${endDate}`;
  // }

  function formatXAxisLabel(value) {
    const [start, end] = value.split(" - ");
    const startDate = new Date(start);
    const endDate = new Date(end);

    const startFormat = startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    });

    if (startDate.toDateString() === endDate.toDateString()) {
      // Same day: show time only for the second part
      const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      });
      return `${startFormat} - ${endTime}`;
    } else {
      // Different days: show full format for both
      const endFormat = endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      });
      return `${startFormat} - ${endFormat}`;
    }
  }

  return (
    <>
      {/* <Card className="h-[50vh]"> */}
      {/* <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>Bar Chart - Interactive</CardTitle>
          <CardDescription>
            Showing unit counts and price details.
          </CardDescription>
        </div>
        <div className="flex">
          {["desktop", "mobile"].map((key) => {
            const chart = key;
            return (
              <button
                key={chart}
                data-active={activeChart === chart}
                className="relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-8 sm:py-6"
                onClick={() => setActiveChart(chart)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[chart].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-3xl">
                  {total[chart].toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </CardHeader> */}
      <CardContent className="px-2  sm:p-6">
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto w-full ${
            view === "week" ? "h-[400px]" : "h-[400px]"
          }`}
        >
          <BarChart
            // data={chartData}
            data={scheduleSalesData}
            // width={600}
            // width={900} // Increase the width
            // height={500}
            // margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            margin={{
              top: 20,
              right: 30,
              left: 80,
              bottom: 120,
            }} // Add more bottom margin for label rotation
          >
            <CartesianGrid vertical={false} />
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            {/* <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                });
              }}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            /> */}
            <XAxis
              dataKey={xAxisKey}
              // tickFormatter={(value) => {
              //   const dateParts = value.split("/");
              //   const formattedDate = new Date(
              //     dateParts[2],
              //     dateParts[1] - 1,
              //     dateParts[0]
              //   );
              //   return formattedDate.toLocaleDateString("en-US", {
              //     month: "short",
              //     day: "numeric",
              //   });
              // }}
              // tickFormatter={(value)} // Format based on view
              tickFormatter={(value) => formatXAxisLabel(value)} // Format based on view
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={-40} // Set angle to -45 degrees for weekly view
              textAnchor={"end"} // Adjust text anchor for alignment
              dx={-10}
            />

            {/* <YAxis axisLine={false} tickLine={false} tickMargin={8} /> */}
            <YAxis
              dataKey="unitCount"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              allowDecimals={false} // Prevents fractions
              label={{
                value: "Units Sold",
                angle: -90,
                position: "insideLeft",
              }}
            />

            {/* <Tooltip
              formatter={(value, name) =>
                name === "price" ? `$${value}` : value
              }
            /> */}
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="views"
                  // labelFormatter={(value) => {
                  //   if (view === "day" && typeof value === "string") {
                  //     const [day, month, year] = value.split("/");
                  //     const formattedDate = new Date(`${year}-${month}-${day}`);
                  //     return formattedDate.toLocaleDateString("en-US", {
                  //       month: "short",
                  //       day: "numeric",
                  //       year: "numeric",
                  //     });
                  //   }
                  //   return value; // For week and month
                  // }}
                  labelFormatter={(value) => formatXAxisLabel(value)}
                />
              }
            />

            <Bar dataKey="unitCount" fill="#ED927C">
              {/* Label for price */}
              <LabelList
                dataKey={"price"}
                position="top"
                formatter={(value) => `$${value}`}
                // formatter={(value) => `$${value.toFixed(2)}`}
              />

              {/* Display unitCount inside the bar */}
              <LabelList
                dataKey="unitCount"
                position="inside"
                formatter={(value) => `${value}`} // Show raw unitCount
                fontSize={12}
                fill="#fff" // White text for inside bar
              />
            </Bar>
          </BarChart>
        </ChartContainer>

        {/* <CardFooter className="flex-col gap-2 text-sm">
          <div className="flex items-center gap-2 font-medium leading-none">
            Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none text-muted-foreground">
            Showing total visitors for the last 6 months
          </div>
        </CardFooter> */}
      </CardContent>
    </>
  );
}

export default ScheduleSalesDetailsBarChart;