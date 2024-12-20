import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

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
const AutomationChart = ({ chartData }) => {
  return (
    <Card>
      <CardHeader className="items-center pb-0">
        <CardTitle> Automated Price Sales Report</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <YAxis
              dataKey="unitCount"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <XAxis
              dataKey="time"
              //   dataKey="executionDateTime"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              //   tickFormatter={(value) => value.slice(0, 3)}
            />
            {/* <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            /> */}
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const { time, unitCount } = payload[0].payload;
                  return (
                    <div className="tooltip-content p-2 bg-white border rounded shadow-md">
                      <p>
                        <strong>Time:</strong> {time}
                      </p>
                      <p>
                        <strong>Unit Count:</strong> {unitCount}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              dataKey="unitCount"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-desktop)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default AutomationChart;
