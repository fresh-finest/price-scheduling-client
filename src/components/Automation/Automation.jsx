import { useState, useEffect } from "react";
import axios from "axios";
import ChartsLoadingSkeleton from "../LoadingSkeleton/ChartsLoadingSkeleton";
import Automationtable from "./Automationtable";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CreateRuleForm from "./CreateRule/CreateRuleForm";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.109:3000";
const BASE_URL = `https://api.priceobo.com`;

const Automation = () => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/auto-report/B-BB-2864`);
        const data = response.data.result;

        const filteredData = data
          .filter((item) => item.unitCount > 0)
          .map((item) => ({
            time: new Date(item.executionDateTime).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            unitCount: item.unitCount,
          }));

        setChartData(filteredData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <section>
      <div className="mt-5">
        <CreateRuleForm></CreateRuleForm>
      </div>
      <div>
        <Automationtable></Automationtable>
      </div>
   
    </section>
  );
};

export default Automation;