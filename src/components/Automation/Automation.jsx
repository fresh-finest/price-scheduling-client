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
import { InputGroup, Form } from "react-bootstrap";
import { MdOutlineClose } from "react-icons/md";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.109:3000";
const BASE_URL = `https://api.priceobo.com`;

const Automation = () => {
  const [chartData, setChartData] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleClearInput = () => {
    setSearchTerm("");
  };

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
      <div className="my-3 flex items-center gap-4">
       
        <CreateRuleForm></CreateRuleForm>

        <div>
         <InputGroup className="w-[500px]  ">
          <Form.Control
            type="text"
            placeholder="Search by Sku"
            value={searchTerm}
            onChange={handleSearch}
            style={{ borderRadius: "0px" }}
            className="custom-input"
          />
          {searchTerm && (
            <button
              onClick={handleClearInput}
              className="absolute right-2 top-1  p-1 z-10 text-xl rounded transition duration-500 text-black"
            >
              <MdOutlineClose />
            </button>
          )}
        </InputGroup>
      </div>

      
      </div>
      <div className="">
        <Automationtable searchTerm={searchTerm}></Automationtable>
      </div>
    </section>
  );
};

export default Automation;
