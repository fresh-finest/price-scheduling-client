import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table, Form, Button, Spinner, Pagination } from "react-bootstrap";

import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
import "./Report.css";

// const BASE_URL = `https://api.priceobo.com`;
const BASE_URL = "http://192.168.0.102:3000";
const Report = () => {
  const [products, setProducts] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState([null, null]);
  const [loading, setLoading] = useState(false);

  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  };

  const getDefaultEndDate = () => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  };

  const [selectedRange, setSelectedRange] = useState({
    startDate: getDefaultStartDate(),
    endDate: getDefaultEndDate(),
  });

  const itemsPerPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/favourite/limit?page=${currentPage}&limit=${itemsPerPage}`
        );
        console.log("report response", response.data.data);
        setProducts(response.data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [currentPage]);

  const fetchSalesComparison = async (
    startDate = selectedRange.startDate,
    endDate = selectedRange.endDate,
    page = currentPage
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/favourite/limit`, {
        params: {
          page,
          limit: itemsPerPage,
        },
      });

      const skuArray = response.data.data.listings.map(
        (product) => product.sellerSku
      );
      const queryString = new URLSearchParams({
        startDate,
        endDate,
        skus: skuArray.join(","),
      }).toString();

      const fullURL = `${BASE_URL}/api/product/sale?${queryString}`;
      console.log("API Request URL:", fullURL);

      const salesResponse = await axios.get(fullURL);
      const salesMap = {};
      salesResponse.data.data.forEach((sale) => {
        salesMap[sale.sku] = sale;
      });
      setSalesData(salesMap);
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching sales comparison:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    fetchSalesComparison(
      selectedRange.startDate,
      selectedRange.endDate,
      pageNumber
    );
  };

  const onRangeChange = (dates) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0].format("YYYY-MM-DD");
      const endDate = dates[1].format("YYYY-MM-DD");

      setSelectedRange({ startDate, endDate });

      fetchSalesComparison(startDate, endDate);
    }
  };

  console.log("start Date,", startDate);
  console.log("end Date,", endDate);

  const totalPages = products.totalPages;

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i <= maxPagesToShow ||
        i >= totalPages - maxPagesToShow ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
        pageNumbers.push("...");
      }
    }

    return pageNumbers.map((page, index) => (
      <Pagination.Item
        key={index}
        active={page === currentPage}
        onClick={() => typeof page === "number" && handlePageChange(page)}
      >
        {page}
      </Pagination.Item>
    ));
  };

  const rangePresets = [
    {
      label: "Last 7 Days",
      value: [dayjs().subtract(7, "day"), dayjs()],
    },
    {
      label: "Last 30 Days",
      value: [dayjs().subtract(30, "day"), dayjs()],
    },
    {
      label: "This Month",
      value: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
  ];

  return (
    <div className="">
      <Form className="mb-4">
        <Form.Group controlId="startDate">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group controlId="endDate">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>
        <Button
          variant="primary"
          onClick={fetchSalesComparison}
          className="mt-3"
        >
          Fetch Sales Data
        </Button>
      </Form>

      <div className="absolute top-[10px] right-[17%]">
        <RangePicker
          className="ant-datePicker-input"
          presets={rangePresets}
          onChange={onRangeChange}
        />
      </div>
      <section
        style={{
          maxHeight: "91vh",
          overflowY: "auto",
          marginTop: "50px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table
          style={{
            tableLayout: "fixed",
          }}
          className="reportCustomTable table"
        >
          <thead
            style={{
              backgroundColor: "#f0f0f0",
              color: "#333",
              fontFamily: "Arial, sans-serif",
              fontSize: "14px",
            }}
          >
            <tr>
              <th
                className="tableHeader"
                style={{
                  width: "100px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Image
              </th>
              <th
                className="tableHeader"
                style={{
                  width: "500px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Product Details
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
                Previous Interval Units
              </th>
              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Current Interval Units
              </th>
            </tr>
          </thead>
          <tbody>
            {products?.listings?.map((product) => {
              const sale = salesData[product.sellerSku] || {};
              return (
                <tr key={product.sellerSku}>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    <img
                      style={{
                        height: "50px",
                        width: "50px",
                        margin: "0 auto",
                        objectFit: "contain",
                      }}
                      src={product.imageUrl}
                      alt={product.itemName || "No Image"}
                      width={50}
                    />
                  </td>

                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {product.itemName}

                    <div className="details mt-[5px]">
                      <span
                        className="bubble-text"
                        style={{
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "stretch",
                        }}
                      >
                        {product.asin1}{" "}
                      </span>{" "}
                      <span
                        className="bubble-text"
                        style={{
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                        }}
                      >
                        {product.sellerSku}{" "}
                      </span>{" "}
                    </div>
                  </td>

                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      sale.previousIntervalUnits || 0
                    )}
                  </td>
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                      height: "40px",
                      textAlign: "center",
                      verticalAlign: "middle",
                    }}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" />
                    ) : (
                      sale.currentIntervalUnits || 0
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <Pagination className=" flex mb-3 justify-center">
          <Pagination.First onClick={() => handlePageChange(1)} />
          <Pagination.Prev
            onClick={() =>
              handlePageChange(currentPage > 1 ? currentPage - 1 : 1)
            }
          />
          {renderPaginationButtons()}
          <Pagination.Next
            onClick={() =>
              handlePageChange(
                currentPage < totalPages ? currentPage + 1 : totalPages
              )
            }
          />
          <Pagination.Last onClick={() => handlePageChange(totalPages)} />
        </Pagination>
      </section>
    </div>
  );
};
export default Report;
