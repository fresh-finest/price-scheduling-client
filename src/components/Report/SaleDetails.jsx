import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { useLocation, useParams } from "react-router-dom";
import moment from "moment";
import SalesDetailsBarChart from "../Graph/SalesDetailsBarChart";
import { MdCheck } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";
import { Card } from "../ui/card";
import PriceVsCount from "./PriceVsCount";
import ScheduleVsCount from "./ScheduleVsCount";
import ChartsLoadingSkeleton from "../LoadingSkeleton/ChartsLoadingSkeleton";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.167:3000";

const BASE_URL = `https://api.priceobo.com`;

const SaleDetails = () => {
  const { sku } = useParams();
  const [salesData, setSalesData] = useState([]);
  const [scheduleSalesData, setScheduleSalesData] = useState([]);
  const [productData, setProductData] = useState("");
  const [salesChartloading, setSalesChartLoading] = useState(false);
  const [schduleChartLoading, setScheduleChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("day"); // Default view is "By Day"
  const [dateRange, setDateRange] = useState([null, null]); // Store start and end date as a range
  const [startDate, endDate] = dateRange; // Destructure for easy access
  const [copiedSku, setCopiedSku] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showScheduleSalesTable, setShowScheduleSalesTable] = useState(false);
  const [productPrice, setProductPrice] = useState("");

  const location = useLocation();
  const { productInfo, sku1 } = location.state || {};

  console.log("product info", productInfo?.AttributeSets[0]);

  const fetchSalesMetrics = async () => {
    setSalesChartLoading(true);
    setError(null);
    try {
      let url = `${BASE_URL}/sales-metrics/${view}/${sku}`;
      const params = {};

      if (startDate && endDate) {
        url = `${BASE_URL}/sales-metrics/range/${sku}`;
        params.startDate = moment(startDate).format("YYYY-MM-DD");
        params.endDate = moment(endDate).format("YYYY-MM-DD");
      }

      const response = await axios.get(url, { params });
      setSalesData(response.data);
    } catch (err) {
      setError("An error occurred while fetching sales data.");
    } finally {
      setSalesChartLoading(false);
    }
  };
  const fetchScheduleSalesMetrics = async () => {
    setScheduleChartLoading(true);
    setError(null);
    try {
      let url = `${BASE_URL}/api/report/${sku}`;
      const params = {};

      // if (startDate && endDate) {
      //   url = `${BASE_URL}/sales-metrics/range/${sku}`;
      //   params.startDate = moment(startDate).format("YYYY-MM-DD");
      //   params.endDate = moment(endDate).format("YYYY-MM-DD");
      // }

      const response = await axios.get(url);
      console.log("response", response);
      setScheduleSalesData(response.data);
    } catch (err) {
      setError("An error occurred while fetching schedule sales data.");
    } finally {
      setScheduleChartLoading(false);
    }
  };

  const fetchProductPrice = async () => {
    setError(null);
    try {
      const response = await axios.get(`https://api.priceobo.com/list/${sku1}`);
      const price = response?.data?.offerAmount;

      console.log("price", price);

      setProductPrice(price);
    } catch (err) {
      setError("An Error occurred while fetching product price.");
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesMetrics();
    // fetchSalesProductData();
    fetchScheduleSalesMetrics();
  }, [sku, view, startDate, endDate]);

  useEffect(() => {
    fetchProductPrice();
  }, []);

  const handleViewChange = (newView) => {
    setView(newView);
    setDateRange([null, null]); // Reset date range
  };

  const formatDate = (date) => {
    return moment(date, "DD/MM/YYYY").format("MM/DD/YYYY, dddd");
  };

  const handleCopy = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "sku") {
          setCopiedSku(text); // Set the copied SKU
          setTimeout(() => setCopiedSku(null), 2000); // Reset after 2 seconds
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // if (error) {
  //   return <p>{error}</p>;
  // }

  return (
    <div className="">
      {productInfo && (
        <div className="flex max-w-[50%]  px-2 py-2 rounded  mt-[-8px] gap-1">
          <img
            src={productInfo?.AttributeSets[0]?.SmallImage?.URL}
            width="70px"
            height="50px"
            alt="product image"
          />
          <div>
            <h3 className="text-md">{productInfo?.AttributeSets[0]?.Title}</h3>
            <div className="flex items-center justify-start  gap-1 mt-1">
              <p className="px-2 py-1 bg-[#3B82F6] text-white rounded-sm">
                ${productPrice}
              </p>
              <p className="flex items-center justify-center gap-1  text-sm border max-w-[18%] px-2 py-1">
                {sku1}{" "}
                {copiedSku === sku1 ? (
                  <MdCheck
                    style={{
                      marginLeft: "5px",
                      cursor: "pointer",
                      color: "green",
                      fontSize: "16px",
                    }}
                  />
                ) : (
                  <BsClipboardCheck
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(sku1, "sku");
                    }}
                    style={{
                      marginLeft: "5px",
                      cursor: "pointer",
                      fontSize: "16px",
                    }}
                  />
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className=" flex space-x-2  absolute top-[5px] right-[30%] ">
          {/* <div className=" flex space-x-2  absolute top-[0px] right-[30%] "> */}
          <Button
            onClick={() => handleViewChange("day")}
            variant="outline"
            className={`w-[80px] justify-center ${
              view === "day"
                ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
                : ""
            }`}
          >
            By Day
          </Button>
          <Button
            onClick={() => handleViewChange("week")}
            variant="outline"
            className={`w-[80px] justify-center ${
              view === "week"
                ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
                : ""
            }`}
          >
            By Week
          </Button>
          <Button
            onClick={() => handleViewChange("month")}
            variant="outline"
            className={`w-[80px] justify-center ${
              view === "month"
                ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
                : ""
            }`}
          >
            By Month
          </Button>
        </div>
        <div className="absolute top-[5px]  right-[17%]">
          {/* <div className="absolute top-[0px]  right-[17%]"> */}
          <DatePicker
            selected={startDate}
            onChange={(update) => setDateRange(update)}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            isClearable
            placeholderText="Select a date range"
            className="custom-date-input form-control py-[7px]"
          />
        </div>
      </div>

      <div className="mt-5">
        {salesChartloading ? (
          <ChartsLoadingSkeleton></ChartsLoadingSkeleton>
        ) : (
          <PriceVsCount
            view={view}
            salesData={salesData}
            showTable={showTable}
            setShowTable={setShowTable}
            startDate={startDate}
            endDate={endDate}
            formatDate={formatDate}
          ></PriceVsCount>
        )}
      </div>
      <div>
        {schduleChartLoading ? (
          <ChartsLoadingSkeleton></ChartsLoadingSkeleton>
        ) : (
          <ScheduleVsCount
            view={view}
            scheduleSalesData={scheduleSalesData}
            showScheduleSalesTable={showScheduleSalesTable}
            setShowScheduleSalesTable={setShowScheduleSalesTable}
            startDate={startDate}
            endDate={endDate}
            formatDate={formatDate}
          ></ScheduleVsCount>
        )}
      </div>
    </div>
  );
};

export default SaleDetails;