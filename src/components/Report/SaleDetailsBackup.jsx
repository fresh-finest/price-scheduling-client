import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { useParams } from "react-router-dom";
import moment from "moment";

const BASE_URL = "http://localhost:3000";
// const BASE_URL = `https://api.priceobo.com`;

const SaleDetails = () => {
  const { sku } = useParams();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [view, setView] = useState("day"); // Default view is "By Day"
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchSalesMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `${BASE_URL}/sales-metrics/${view}/${sku}`;
      const params = {};

      // Use date range API if both startDate and endDate are set
      if (startDate && endDate) {
        url = `${BASE_URL}/sales-metrics/range/${sku}`;
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const response = await axios.get(url, { params });
      setSalesData(response.data);
    } catch (err) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesMetrics();
  }, [sku, view, startDate, endDate]);

  // Handle view change and reset date range if switching views
  const handleViewChange = (newView) => {
    setView(newView);
    setStartDate("");
    setEndDate("");
  };

  // Handle date range change and reset view selection
  const handleDateChange = (type, date) => {
    if (type === "start") setStartDate(date);
    if (type === "end") setEndDate(date);
    setView(""); // Unselect the view when a date range is used
  };

  const formatDate = (date) => {
    return moment(date, "DD/MM/YYYY").format("MM/DD/YYYY, dddd");
  };

  if (loading) {
    return (
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
    );
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Sales Details for SKU: {sku}</h3>
        <div className="mr-[17%] flex space-x-2 mt-[-0.5%] mb-[10px">
          <Button
            onClick={() => handleViewChange("day")}
            // variant={view === "day" ? "primary" : "outline-primary"}
            variant="outline"
            className={`w-[80px]  justify-center ${
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
            className={`w-[80px]  justify-center ${
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
            className={`w-[80px]  justify-center ${
              view === "month"
                ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
                : ""
            }`}
          >
            By Month
          </Button>
        </div>
      </div>

      <div className="d-flex mb-3">
        <Form.Group className="mr-2">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            placeholder="start Date"
            value={startDate}
            onChange={(e) => handleDateChange("start", e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mr-2">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => handleDateChange("end", e.target.value)}
          />
        </Form.Group>
      </div>

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
          className=" reportCustomTable table"
        >
          <thead>
            <tr>
              <th
                className="tableHeader"
                style={{
                  // width: "100px",
                  position: "sticky", // Sticky header
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
                  // width: "100px",
                  position: "sticky", // Sticky header
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
                  // width: "100px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Unit{" "}
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
                      // cursor: "pointer",
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
                      // cursor: "pointer",
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
                      // cursor: "pointer",
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
    </div>
  );
};

export default SaleDetails;
