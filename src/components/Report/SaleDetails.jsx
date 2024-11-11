import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { useParams } from "react-router-dom";
import moment from "moment";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = "http://192.168.0.167:3000";

// const BASE_URL = `https://api.priceobo.com`;

const SaleDetails = () => {
  const { sku } = useParams();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("day"); // Default view is "By Day"
  const [dateRange, setDateRange] = useState([null, null]); // Store start and end date as a range
  const [startDate, endDate] = dateRange; // Destructure for easy access

  const fetchSalesMetrics = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesMetrics();
  }, [sku, view, startDate, endDate]);

  const handleViewChange = (newView) => {
    setView(newView);
    setDateRange([null, null]); // Reset date range
  };

  const formatDate = (date) => {
    return moment(date, "DD/MM/YYYY").format("MM/DD/YYYY, dddd");
  };

  return (
    <div className="">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Sales Details for SKU: {sku}</h3>
        <div className="mr-[17%] flex space-x-2 mt-[-0.5%] mb-[10px">
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
      </div>

      <div className="d-flex justify-end mb-2">
        <DatePicker
          selected={startDate}
          onChange={(update) => setDateRange(update)}
          startDate={startDate}
          endDate={endDate}
          selectsRange
          isClearable
          placeholderText="Select a date range"
          className="custom-date-input form-control"
        />
      </div>

      {loading ? (
        <div
          style={{
            marginTop: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          <img
            style={{ width: "40px", marginRight: "6px" }}
            className="animate-pulse"
            src={priceoboIcon}
            alt="Priceobo Icon"
          />
          <div className="block">
            <p className="text-xl"> Loading...</p>
          </div>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <section
          style={{
            maxHeight: "91vh",
            overflowY: "auto",
            marginTop: "20px",
            boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <table
            style={{
              tableLayout: "fixed",
            }}
            className="reportCustomTable table"
          >
            <thead>
              <tr>
                <th
                  className="tableHeader"
                  style={{
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  {view === "day" || (startDate && endDate)
                    ? "Date"
                    : view === "week"
                    ? "Week"
                    : "Month"}
                </th>
                <th
                  className="tableHeader"
                  style={{
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Price
                </th>
                <th
                  className="tableHeader"
                  style={{
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  Unit
                </th>
              </tr>
            </thead>
            <tbody
              style={{
                fontSize: "13px",
                fontFamily: "Arial, sans-serif",
                lineHeight: "1.5",
              }}
            >
              {salesData.length > 0 ? (
                salesData.map((item, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        height: "40px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {view === "day" || (startDate && endDate)
                        ? formatDate(item.date)
                        : view === "week"
                        ? item.week
                        : item.month}
                    </td>
                    <td
                      style={{
                        height: "40px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {parseFloat(
                        view === "day" || (startDate && endDate)
                          ? item.amount
                          : item.averageAmount
                      ).toFixed(2)}
                    </td>
                    <td
                      style={{
                        height: "40px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {item.unitCount}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="text-center">
                    No Sales Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default SaleDetails;
