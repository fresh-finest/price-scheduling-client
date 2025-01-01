import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:3000";

const SaleReport = () => {
  const [skuData, setSkuData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentIntervalUnits, setCurrentIntervalUnits] = useState([]);
  const [previousIntervalUnits, setPreviousIntervalUnits] = useState([]);

  useEffect(() => {
    // Set default date range to the last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
    setEndDate(now.toISOString().split("T")[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchSkuData();
    }
  }, [startDate, endDate]);

  const fetchSkuData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/product/limit`, {
        params: { page: 1, limit: 20 },
      });
      const { listings } = response.data.data;

      setSkuData(listings);

      // Extract SKUs from listings and fetch sales comparison data
      const skuList = listings.map((item) => item.sellerSku);
      fetchSalesComparison(skuList);
    } catch (error) {
      console.error("Error fetching SKU data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesComparison = async (skuList) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/product/sale`, {
        params: {
          startDate,
          endDate,
          skus: skuList.join(","),
        },
      });

      const salesData = response.data.data;
      console.log("Sales data:", salesData);
      setSkuData((prevData) =>
        prevData.map((item) => {
          const matchingSalesData = salesData.find(
            (sales) => sales.sku === item.sellerSku
          );
          return {
            ...item,
            currentIntervalUnits: matchingSalesData?.currentIntervalUnits || 0,
            previousIntervalUnits: matchingSalesData?.previousIntervalUnits || 0,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching sales comparison data:", error);
    }
  };
 console.log("skudata",skuData)
  return (
    <div className="container">
      <h2>Sales Comparison</h2>
      <div>
        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Image</th>
              <th>SKU</th>
              <th>Title</th>
              <th>Previous Interval Units</th>
              <th>Current Interval Units</th>
            </tr>
          </thead>
          <tbody>
            {skuData.map((item) => (
              <tr key={item.sellerSku}>
                <td>
                  <img
                    src={item.imageUrl}
                    alt={item.itemName}
                    style={{ width: "50px", height: "50px" }}
                  />
                </td>
                <td>{item.sellerSku}</td>
                <td>{item.itemName}</td>
                <td>{item.previousIntervalUnits || 0}</td>
                <td>{item.currentIntervalUnits || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SaleReport;
