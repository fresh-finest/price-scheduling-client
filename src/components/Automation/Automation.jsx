import { useState, useEffect } from "react";
import axios from "axios";
import AutomationChart from "./AutomationChart";
import ChartsLoadingSkeleton from "../LoadingSkeleton/ChartsLoadingSkeleton";

const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.141:3000";
// const BASE_URL = `https://api.priceobo.com`;

const Automation = () => {
  const [chartData, setChartData] = useState([]);

  // const chartData = [
  //   { month: "January", desktop: 186, mobile: 80 },
  //   { month: "February", desktop: 305, mobile: 200 },
  //   { month: "March", desktop: 237, mobile: 120 },
  //   { month: "April", desktop: 73, mobile: 190 },
  //   { month: "May", desktop: 209, mobile: 130 },
  //   { month: "June", desktop: 214, mobile: 140 },
  // ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auto-report/B-BB-2864`);
        const data = response.data.result;

        // Format the data for the chart
        const filteredData = data
          .filter((item) => item.unitCount > 0)
          .map((item) => ({
            time: new Date(item.executionDateTime).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true, // Use 12-hour format with AM/PM
            }),
            unitCount: item.unitCount,
          }));

        setChartData(filteredData);
        // setChartData(data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);
  console.log(chartData);
  return (
    <section>
      <div className="mt-5">
        {chartData.length > 0 ? (
          <AutomationChart chartData={chartData}></AutomationChart>
        ) : (
          <ChartsLoadingSkeleton></ChartsLoadingSkeleton>
        )}
      </div>
    </section>
  );
};

export default Automation;
