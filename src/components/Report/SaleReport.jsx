import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { DatePicker, Space } from "antd";
import { Table, Spinner, Row, Col } from "react-bootstrap";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";
import SaleReportPagination from "./SaleReportPagination";
import "antd/dist/reset.css"; // Ant Design styles
import moment from "moment";

const { RangePicker } = DatePicker;
const BASE_URL = "http://localhost:3000";

const SaleReport = () => {
  const [products, setProducts] = useState([]);
  const [currentDateRange, setCurrentDateRange] = useState([]);
  const [previousDateRange, setPreviousDateRange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1); // Current page
  const [totalPages, setTotalPages] = useState(1); // Total pages
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    fetchProducts();
  }, [page, currentDateRange, previousDateRange]); // Recalculate when dates or page changes

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/favourite/report`, {
        params: {
          page,
          limit: 20, // Limit results to 20 per page
        },
      });
      const listings = response.data.data.listings;
      setProducts(listings);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterMetricsForInterval = (
    salesMetrics,
    intervalStart,
    intervalEnd
  ) => {
    const start = new Date(intervalStart).getTime();
    const end = new Date(intervalEnd).getTime();

    return salesMetrics.filter((metric) => {
      const intervalParts = metric.interval.split("--");
      const metricStart = new Date(intervalParts[0]).getTime();
      const metricEnd = new Date(intervalParts[1]).getTime();
      return metricStart >= start && metricEnd <= end;
    });
  };

  const calculateUnits = (salesMetrics) => {
    return salesMetrics.reduce(
      (total, metric) => total + (metric.units || 0),
      0
    );
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) {
      return current > 0 ? 100 : 0;
    }
    if (current === 0) {
      return previous > 0 ? -100 : 0;
    }

    return current > previous
      ? (((current - previous) / current) * 100).toFixed(2)
      : (((current - previous) / previous) * 100).toFixed(2);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const toggleFavorite = async (sku, currentFavoriteStatus, index) => {
    console.log("Toggling favorite status for SKU:", sku);
    try {
      // Update favorite status in the backend
      await axios.put(`${BASE_URL}/api/favourite/${sku}`, {
        isFavourite: !currentFavoriteStatus,
      });

      // Optimistically update the UI
      setProducts((prevProducts) =>
        prevProducts.map((product, i) =>
          i === index
            ? { ...product, isFavourite: !currentFavoriteStatus }
            : product
        )
      );
    } catch (error) {
      console.error("Error updating favorite status:", error.message);
    }
  };
  const tableContainerStyle = {
    maxHeight: "1000px", // Adjust height as needed
    overflowY: "auto", // Enable vertical scrolling
    position: "relative",
  };

  const stickyHeaderStyle = {
    position: "sticky",
    top: "0",
    background: "white",
    zIndex: "100",
    boxShadow: "0px 2px 5px rgba(0,0,0,0.1)",
  };

  const boxStyle = (backgroundColor) => ({
    backgroundColor,
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "150px",
    borderRadius: "8px",
    fontSize: "24px",
  });
  const circleStyle = (backgroundColor) => ({
    backgroundColor,
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "200px",
    width: "200px",
    borderRadius: "50%",
    fontSize: "24px",
    margin: "0 auto", // Center the circle horizontally
  });
  return (
    <div className="container mt-5">
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <>
        <div style={tableContainerStyle}>
          <Table striped bordered hover>
            <thead style={stickyHeaderStyle}>
              <tr>
                <th>Favourite</th>
                <th>Image</th>
                <th>SKU</th>
                <th>Title</th>
                <th>
                  Current Interval Units
                  <div>
                    <Space direction="vertical" size={12}>
                      <RangePicker
                        value={
                          currentDateRange.length === 2
                            ? [
                                moment(currentDateRange[0], "YYYY-MM-DD"),
                                moment(currentDateRange[1], "YYYY-MM-DD"),
                              ]
                            : null
                        }
                        onChange={(dates) => {
                          if (dates && dates.length === 2) {
                            const formattedStart =
                              dates[0].format("YYYY-MM-DD");
                            const formattedEnd = dates[1].format("YYYY-MM-DD");

                            console.log(
                              "Selected Current Date Range:",
                              formattedStart,
                              formattedEnd
                            ); // Debugging log

                            setCurrentDateRange([formattedStart, formattedEnd]);
                          } else {
                            setCurrentDateRange([]);
                          }
                        }}
                        format="YYYY-MM-DD"
                      />
                    </Space>
                  </div>
                </th>
                <th>
                  Previous Interval Units
                  <div>
                    <Space direction="vertical" size={12}>
                      <RangePicker
                        value={
                          previousDateRange.length === 2
                            ? [
                                moment(previousDateRange[0]),
                                moment(previousDateRange[1]),
                              ]
                            : null
                        }
                        onChange={(dates) =>
                          setPreviousDateRange(
                            dates
                              ? [dates[0].toISOString(), dates[1].toISOString()]
                              : []
                          )
                        }
                        format="YYYY-MM-DD"
                      />
                    </Space>
                  </div>
                </th>
                <th>Change (%)</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const currentMetrics =
                  currentDateRange.length === 2
                    ? filterMetricsForInterval(
                        product.salesMetrics || [],
                        currentDateRange[0],
                        currentDateRange[1]
                      )
                    : [];

                const previousMetrics =
                  previousDateRange.length === 2
                    ? filterMetricsForInterval(
                        product.salesMetrics || [],
                        previousDateRange[0],
                        previousDateRange[1]
                      )
                    : [];

                const currentUnits = calculateUnits(currentMetrics);
                const previousUnits = calculateUnits(previousMetrics);
                const percentageChange = calculatePercentageChange(
                  currentUnits,
                  previousUnits
                );

                return (
                  <tr key={product.sellerSku}>
                    <td
                      style={{
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "none",
                        padding: "0",
                        height: "85px",
                      }}
                    >
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(
                            product.sellerSku,
                            product.isFavourite,
                            index
                          );
                        }}
                        style={{
                          textAlign: "center",
                          cursor: "pointer",
                          transition: "transform 0.2s ease-in-out",
                          transform: product.isFavourite
                            ? "scale(1.1)"
                            : "scale(1)",
                        }}
                      >
                        {product.isFavourite ? (
                          <FaStar
                            style={{ color: "#879618a3", fontSize: "20px" }}
                          />
                        ) : (
                          <FaRegStar
                            style={{ color: "gray", fontSize: "16px" }}
                          />
                        )}
                      </span>
                    </td>
                    <td>
                      <img
                        src={
                          product.imageUrl || "https://via.placeholder.com/50"
                        }
                        alt={"No Image"}
                        width={50}
                      />
                    </td>
                    <td>{product.sellerSku}</td>
                    <td>{product.itemName || "Unknown Product"}</td>
                    <td>{currentUnits}</td>
                    <td>{previousUnits}</td>
                    <td>
                      {`${percentageChange}%`}
                      <span>
                        {percentageChange > 0 ? (
                          <FaArrowUp />
                        ) : (
                          <FaArrowDownLong />
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          </div>
          <SaleReportPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default SaleReport;
