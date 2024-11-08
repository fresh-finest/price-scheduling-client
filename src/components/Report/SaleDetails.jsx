import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Spinner, Button } from "react-bootstrap";
import { useParams } from "react-router-dom";

const BASE_URL = "http://localhost:3000";

const SaleDetails = () => {
  const { sku } = useParams();
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isWeekly, setIsWeekly] = useState(false);

  const fetchSalesMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${BASE_URL}/sales-metrics/${isWeekly ? "week" : "day"}/${sku}`
      );
      setSalesData(response.data);
    } catch (err) {
      setError("Error fetching sales data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesMetrics();
  }, [sku, isWeekly]);

  const toggleView = () => {
    setIsWeekly((prev) => !prev);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Sales Details for SKU: {sku}</h3>
        <Button onClick={toggleView} variant="primary">
          {isWeekly ? "By Day" : "By Week"}
        </Button>
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
              <th>{isWeekly ? "Week" : "Date"}</th>
              <th>{isWeekly ? "Average Amount ($)" : "Amount ($)"}</th>
              <th>Unit Count</th>
            </tr>
          </thead>
          <tbody>
            {salesData.length > 0 ? (
              salesData.map((item, index) => (
                <tr key={index}>
                  <td>{isWeekly ? item.week : item.date}</td>
                  <td>{parseFloat(isWeekly ? item.averageAmount : item.amount).toFixed(2)}</td>
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
