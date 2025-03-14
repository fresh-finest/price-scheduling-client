import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
  Rectangle,
} from "recharts";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "../ui/chart";

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

const SalesDetailsBarChart = ({ view, salesData, scheduleSalesData }) => {
  const filteredSalesData = salesData.filter((data) => data.unitCount > 0);

  let isMatchingDate;

  console.log("isMatchingDate", isMatchingDate);

  // Determine the dataKey for the X-axis dynamically
  const xAxisKey = useMemo(() => {
    if (view === "day") return "date";
    if (view === "week") return "week";
    if (view === "month") return "month";
    return "date"; // Default to "date"
  }, [view]);

  const formatXAxisLabel = (value) => {
    if (view === "day") {
      try {
        // Parse the value assuming DD/MM/YYYY format
        const [day, month, year] = value.split("/");
        if (!day || !month || !year) throw new Error("Invalid date format");

        const formattedDate = new Date(`${year}-${month}-${day}T00:00:00`);

        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "Asia/Dhaka",
        }).format(formattedDate);
      } catch (error) {
        console.error("Error formatting date:", error.message);
        return value;
      }
    }

    return value;
  };

  // const showLabels = salesData.length <= 31;
  const showLabels = filteredSalesData.length <= 40;

  const CustomTooltip = ({ active, payload, label, view, isMatchingDate }) => {
    console.log("is matching date from custom tooltip", isMatchingDate);
    if (active && payload && payload.length) {
      const unitCount = payload[0].value;
      const price =
        payload[0].payload?.amount || payload[0].payload?.averageAmount;

      const formattedDate =
        view === "day" && typeof label === "string"
          ? new Date(
              label.includes("/") ? label.split("/").reverse().join("-") : label
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : label;

      return (
        <div className="rounded bg-white w-[150px] border shadow-lg py-2 px-2">
          {formattedDate && (
            <p className="font-semibold text-xs">{formattedDate}</p>
          )}

          <div className="grid grid-cols-[10px_70px_auto] gap-x-2 items-center mt-1 text-xs">
            <span
              className={`w-[10px] h-[10px]  ${
                isMatchingDate ? "bg-[#ED927C]" : "bg-[#2A9C8F]"
              } `}
            ></span>
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
        <CardTitle>Amazon Sale Report</CardTitle>
      </CardHeader>

      <CardContent className="px-2  sm:p-6">
        <ChartContainer
          config={chartConfig}
          className={`aspect-auto w-full ${
            view === "week" ? "h-[400px]" : "h-[300px]"
          }`}
        >
          <BarChart
            // width={Math.max(600, salesData.length * 100)}
            // data={salesData}
            data={filteredSalesData}
            margin={{
              top: 40,
              right: 30,
              left: 20,
              bottom: view === "week" ? 120 : 20,
            }}
            // barCategoryGap="10%"
          >
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey={xAxisKey}
              tickFormatter={(value) => formatXAxisLabel(value)}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={view === "week" ? -40 : 0}
              textAnchor={view === "week" ? "end" : "middle"}
              dx={view === "week" ? -10 : 0}
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

            <ChartTooltip
              content={({ active, payload, label }) => {
                // Pass `isMatchingDate` condition to the tooltip
                // const matchingDates = scheduleSalesData.map((schedule) => {
                //   const [startDate] = schedule.interval.split(" - ");
                //   const [year, month, day] = startDate.split(" ")[0].split("-");
                //   return `${day}/${month}/${year}`;
                // });
                // const isMatchingDate = matchingDates.includes(
                //   payload?.[0]?.payload.date
                // );

                return (
                  <CustomTooltip
                    active={active}
                    payload={payload}
                    label={label}
                    view={view}
                    isMatchingDate={isMatchingDate} // Pass the condition
                  />
                );
              }}
            />
            <Bar
              dataKey="unitCount"
              barSize={40}
              shape={(props) => {
                const { x, y, width, height, payload } = props;

                // Function to generate all dates between start and end date
                const getDatesInRange = (startDate, endDate) => {
                  const dates = [];
                  let currentDate = new Date(startDate);

                  const lastDate = new Date(endDate);

                  while (currentDate <= lastDate) {
                    const formattedDate = currentDate
                      .toLocaleDateString("en-GB") // DD/MM/YYYY
                      .replace(/\//g, "/");
                    dates.push(formattedDate);
                    currentDate.setDate(currentDate.getDate() + 1);
                  }

                  return dates;
                };

                const matchingDates = scheduleSalesData.flatMap((schedule) => {
                  const [startDate, endDate] = schedule.interval
                    .split(" - ")
                    .map((date) => {
                      const [onlyDate] = date.split(" ");
                      return new Date(onlyDate)
                        .toISOString()
                        .split("T")[0]
                        .replace(/-/g, "/");
                    });

                  return getDatesInRange(startDate, endDate);
                });

                // Check if the payload date is in the list of matching dates

                isMatchingDate = matchingDates.includes(payload.date);

                console.log("is Matching Date", { isMatchingDate });

                return (
                  <Rectangle
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={isMatchingDate ? "#ED927C" : "#2A9D90"}
                    stroke={isMatchingDate ? "#FFA500" : "none"}
                    strokeWidth={isMatchingDate ? 0 : 0}
                  />
                );
              }}
            >
              {/* Conditionally render LabelList */}
              {showLabels && (
                <>
                  <LabelList
                    dataKey={view === "day" ? "amount" : "averageAmount"}
                    position="top"
                    formatter={(value) => `$${value}`}
                  />
                  <LabelList
                    dataKey="unitCount"
                    position="top"
                    formatter={(value) => `${value}`}
                    offset={19}
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
};

export default SalesDetailsBarChart;
