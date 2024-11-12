import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Button, ButtonGroup, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import moment from "moment";

const BASE_URL = "http://localhost:3000";
// const BASE_URL ="http://192.168.0.167:3000"
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

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Sales Details for SKU: {sku}</h3>
        <ButtonGroup>
          <Button
            onClick={() => handleViewChange("day")}
            variant={view === "day" ? "primary" : "outline-primary"}
          >
            By Day
          </Button>
          <Button
            onClick={() => handleViewChange("week")}
            variant={view === "week" ? "primary" : "outline-primary"}
          >
            By Week
          </Button>
          <Button
            onClick={() => handleViewChange("month")}
            variant={view === "month" ? "primary" : "outline-primary"}
          >
            By Month
          </Button>
        </ButtonGroup>
      </div>

      <div className="d-flex mb-3">
        <Form.Group className="mr-2">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
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

      {loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "60vh" }}
        >
          <Spinner animation="border" />
          <span className="ml-3">Loading...</span>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Table striped bordered hover responsive className="mt-3">
          <thead>
            <tr>
              <th>
                {view === "day" || (startDate && endDate)
                  ? "Date"
                  : view === "week"
                  ? "Week"
                  : "Month"}
              </th>
              <th>
               Price
              </th>
              <th>Unit </th>
            </tr>
          </thead>
          <tbody>
            {salesData.length > 0 ? (
              salesData.map((item, index) => (
                <tr key={index}>
                  <td>
                    {view === "day" || (startDate && endDate)
                      ? formatDate(item.date)
                      : view === "week"
                      ? item.week
                      : item.month}
                  </td>
                  <td>
                    {parseFloat(
                      view === "day" || (startDate && endDate)
                        ? item.amount
                        : item.averageAmount
                    ).toFixed(2)}
                  </td>
                  <td>{item.unitCount}</td>
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
        </Table>
      )}
    </div>
  );
};

export default SaleDetails;
