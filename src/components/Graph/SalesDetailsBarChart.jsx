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


const  SalesDetailsBarChart=({ view, salesData }) =>{
  const [activeChart, setActiveChart] = useState("desktop");

  console.log("sales data", salesData);
  console.log("view", view);

  // Determine the dataKey for the X-axis dynamically
  const xAxisKey = useMemo(() => {
    if (view === "day") return "date";
    if (view === "week") return "week";
    if (view === "month") return "month";
    return "date"; // Default to "date"
  }, [view]);

  const formatXAxisLabel = (value) => {
    if (view === "day") {
      const [day, month, year] = value.split("/"); // Parse DD/MM/YYYY format
      const formattedDate = new Date(`${year}-${month}-${day}`);
      return formattedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
    return value; // For week and month, assume they're already formatted properly
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
            // data={chartData}
            data={salesData}
            
            margin={{
              top: 40,
              right: 30,
              left: 20,
              bottom: view === "week" ? 120 : 20,
            }} // Add more bottom margin for label rotation
          >
            <CartesianGrid vertical={false} />
        
            <XAxis
              dataKey={xAxisKey}
              
              tickFormatter={(value) => formatXAxisLabel(value)} // Format based on view
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              angle={view === "week" ? -40 : 0} // Set angle to -45 degrees for weekly view
              textAnchor={view === "week" ? "end" : "middle"} // Adjust text anchor for alignment
              dx={view === "week" ? -10 : 0}
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
                  // nameKey="views"
                  labelFormatter={(value) => {
                    if (view === "day" && typeof value === "string") {
                      const [day, month, year] = value.split("/");
                      const formattedDate = new Date(`${year}-${month}-${day}`);
                      return formattedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }
                    return value; // For week and month
                  }}
                />
              }
            />
          

            <Bar dataKey="unitCount" fill="#2A9D90">
              {/* Label for price */}
              <LabelList
                dataKey={view === "day" ? "amount" : "averageAmount"}
                position="top"
                formatter={(value) => `$${value}`}
                // formatter={(value) => `$${value.toFixed(2)}`}
              />

              {/* display unitCount above the bar */}
              <LabelList
                dataKey="unitCount"
                position="top"
                formatter={(value) => `${value}`}
                offset={19}
                fontSize={12}
                fill="#555"
                fontWeight="bold"
              ></LabelList>

              
            </Bar>
          </BarChart>
        </ChartContainer>

        
      </CardContent>
    </>
  );
}

export default SalesDetailsBarChart;