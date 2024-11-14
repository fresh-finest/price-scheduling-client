import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Image, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import "./Report.css";

// const BASE_URL = "http://localhost:3000";

const BASE_URL = `https://api.priceobo.com`;
// const BASE_URL = "http://192.168.0.167:3000";

const Report = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/fetch-all-listings`);
        setListings(response.data.listings);
      } catch (err) {
        setError("Error fetching listings data");
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const handleSkuClick = (sku) => {
    navigate(`/details/${sku}`);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  //calculate paginated listings

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentListings = listings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(listings.length / itemsPerPage);

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
                position: "sticky", // Sticky header
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
                // width: "180px",
                position: "sticky", // Sticky header
                textAlign: "center",
                verticalAlign: "middle",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              SKU
            </th>
            <th
              className="tableHeader"
              style={{
                // width: "455px",
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
              Unit Count
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
          {currentListings.map((listing) => (
            <tr key={listing._id}>
              <td
                style={{
                  // cursor: "pointer",
                  //   height: "40px",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                <img
                  style={{
                    width: "40px",
                    height: "40px",
                    objectFit: "contain",
                    margin: "0 auto",
                  }}
                  src={listing.imageUrl}
                  alt={listing.itemName}
                  width={30}
                  height={30}
                />
              </td>
              <td
                className="text-blue-600 underline cursor-pointer"
                style={{
                  padding: "15px 0",
                  textAlign: "center",
                  verticalAlign: "middle",
                  color: "  #2563eb ",
                  //   cursor: "pointer",
                }}
                onClick={() => handleSkuClick(listing.sellerSku)}
              >
                {listing.sellerSku}
              </td>
              <td
                style={{
                  padding: "15px 0",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                ${listing.price ? listing.price.toFixed(2) : "N/A"}
              </td>
              <td
                style={{
                  padding: "15px 0",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                {listing.salesMetrics && listing.salesMetrics.length > 0 ? (
                  <>
                    <div> {listing.salesMetrics[0].totalUnits}</div>
                  </>
                ) : (
                  "No Sales Data"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Pagination className="flex mb-3 justify-center">
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
