import { Card } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
  } from "recharts";
  
  const transformSelectedChartData = (entries, visibleMonths) => {
    const groupedByDay = {};
  
    entries.forEach((entry) => {
      const [start] = entry.interval.split("--");
      const date = new Date(start);
      const day = date.getDate();
      const month = date.toLocaleString("en-US", { month: "short" });
      const year = date.getFullYear();
      const monthYear = `${month} ${year}`;
  
      if (!visibleMonths[monthYear]) return; 
  
      if (!groupedByDay[day]) groupedByDay[day] = { day };
  
      groupedByDay[day][monthYear] = entry.units;
      groupedByDay[day][`${monthYear}_price`] = entry.price || 0;
    });
  
    return Object.values(groupedByDay).sort((a, b) => a.day - b.day);
  };
  


  
  
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
            zIndex: 1100,
          }}
        >
          <p style={{ margin: 0, textAlign: "left" }}>Day {label}</p>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                <th style={{ padding: "5px", fontWeight: "normal" }}>Month</th>
                <th style={{ padding: "5px", fontWeight: "normal" }}>Units</th>
                <th style={{ padding: "5px", fontWeight: "normal" }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {payload.map((entry, index) => {
                const month = entry.dataKey;
                const price = entry.payload[`${month}_price`] ?? 0;
                return (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "5px", color: entry.color }}>{month}</td>
                    <td style={{ padding: "5px" }}>{entry.value}</td>
                    <td style={{ padding: "5px" }}>${price.toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    return null;
  };
  
  

  const SaleReportSelectedLineChart = ({ entries, loading, visibleMonths, colorMap }) => {

    console.log('sale report selected line chart data', entries)
    const data = transformSelectedChartData(entries, visibleMonths);
  
    const monthKeys = Object.keys(data[0] || {}).filter(
      (key) => key !== "day" && !key.endsWith("_price")
    );

  //   const monthKeys = Object.keys(visibleMonths)
  // .filter((month) => visibleMonths[month]); 

  
    if (loading) return <p>Loading chart...</p>;
    if (!entries || entries.length === 0) return <p>No data available.</p>;
  
    return (
      <Card className="px-2 py-3 ">


    
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid   horizontal
            vertical={false}
            stroke="#d3d3d3"
            strokeWidth={0.4} />
          {/* <CartesianGrid stroke="#ccc" strokeDasharray="3 3" /> */}
          <XAxis dataKey="day"   tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12 }} />
          {/* <YAxis /> */}
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
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {monthKeys.map((month) => (
            <Line
              key={month}
              type="monotone"
              dataKey={month}
            stroke={colorMap[month] || "#000"}
              strokeWidth={2}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      </Card>
    );
  };
  
  export default SaleReportSelectedLineChart;
  