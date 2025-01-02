import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Image, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import "./Report.css";
import { BASE_URL } from "@/utils/baseUrl";

const Report = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState("2024-10-01");
  const [endDate, setEndDate] = useState("2024-10-30");
  const [skuData, setSkuData] = useState([]);

  const itemsPerPage = 20;
  const navigate = useNavigate();

  const fetchIntervalSalesData = async (skuList) => {
    console.log("fetch interval sales data", skuList);
    if (!skuList || skuList.length === 0) return;
    // setSalesLoading(true);

    try {
      const response = await axios.get(`${BASE_URL}/api/product/sale`, {
        params: {
          startDate,
          endDate,
          skus: skuList.join(","),
        },
      });
      const salesData = response.data.data;

      // Map and merge data
      setSkuData((prevData) =>
        prevData.map((item) => {
          const matchingSalesData = salesData.find(
            (sales) => sales.sku === item.sku
          );
          const currentUnits = matchingSalesData?.currentIntervalUnits || 0;
          const previousUnits = matchingSalesData?.previousIntervalUnits || 0;
          const difference = currentUnits - previousUnits;
          const percentageChange =
            previousUnits > 0
              ? ((difference / previousUnits) * 100).toFixed(2)
              : currentUnits > 0
              ? 100
              : 0;

          return {
            ...item,
            currentIntervalUnits: currentUnits,
            previousIntervalUnits: previousUnits,
            difference,
            percentageChange,
          };
        })
      );
    } catch (error) {
      console.error("Error fetching interval sales data:", error);
    } finally {
      // setSalesLoading(false);
    }
  };

  // Fetch product data and then interval sales data
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/product/limit?page=${currentPage}`
      );
      const products = response.data.data;

      console.log("products", products);

      setListings(products);
      setLoading(false);

      const skuList = products?.listings?.map((product) => product.sellerSku);

      console.log("skuList", skuList);

      await fetchIntervalSalesData(skuList);
    } catch (error) {
      console.error("Error fetching products:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(); // Fetch products on load and when dependencies change
  }, [currentPage, startDate, endDate]);

  // useEffect(() => {
  //   const fetchListings = async () => {
  //     setLoading(true);
  //     try {
  //       const response = await axios.get(
  //         `${BASE_URL}/api/product/limit?page=${currentPage}&limit=${itemsPerPage}`
  //       );
  //       setListings(response.data.data);
  //       setLoading(false);
  //     } catch (err) {
  //       setError("Error fetching listings data");
  //       setLoading(false);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchListings();
  // }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  //calculate paginated listings

  const totalPages = listings.totalPages;

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
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Current Interval Units
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
              Increase/Decrease
            </th>
            <th
              className="tableHeader"
              style={{
                position: "sticky",
                textAlign: "center",
                verticalAlign: "middle",
              }}
            >
              Percentage Change (%)
            </th>
          </tr>
        </thead>
        <tbody
          style={{
            fontSize: "12px",
            fontFamily: "Arial, sans-serif",
            lineHeight: "1.5",
          }}
        >
          {listings?.listings?.map((listing, index) => (
            <tr key={index}>
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
                  src={listing.imageUrl}
                  alt="product_image"
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
                {listing.itemName}
                <div className="details mt-[5px]">
                  <span
                    className="bubble-text"
                    style={{
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "stretch",
                    }}
                  >
                    {listing.asin1}{" "}
                  </span>{" "}
                  <span
                    className="bubble-text"
                    style={{
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    {listing.sellerSku}{" "}
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
                {listing.currentIntervalUnits || 0}
              </td>
            </tr>
          ))}
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
  );
};

export default Report;
