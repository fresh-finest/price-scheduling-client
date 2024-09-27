import { useState, useEffect, useCallback } from "react";
import {
  Table,
  Form,
  InputGroup,
  Button,
  Pagination,
  Card,
} from "react-bootstrap";
import { useQuery } from "react-query";
import { MdCheck } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";

import UpdatePriceFromList from "./UpdatePriceFromList";
import axios from "axios";
import { useSelector } from "react-redux";
import { debounce } from "lodash";

import "./ListView.css";
import ProductDetailView from "./ProductDetailView";

import noImage from "../../assets/images/noimage.png";

// const BASE_URL ='http://localhost:3000'

const BASE_URL = `https://api.priceobo.com`;

const BASE_URL_LIST = `https://api.priceobo.com`;
// const BASE_URL_LIST = "http://localhost:3000";

import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { BsClipboardCheck, BsFillInfoSquareFill } from "react-icons/bs";
import { refreshAccessToken } from "@/api/refreshToken";

const fetchProducts = async () => {
  const response = await axios.get(`${BASE_URL_LIST}/fetch-all-listings`);
  return response.data;
};

// const fetchProducts = async () => {
//   try {
//     const response = await axios.get(`${BASE_URL_LIST}/fetch-all-listings`, {
//       withCredentials: true,  
//     });
//     return response.data;
//   } catch (error) {
//     if (error.response.status === 401) {
//       console.error("Unauthorized. Please log in again.");
//     } else {
//       console.error("Error fetching listings:", error.message);
//     }
//   }
// };
/*
const fetchProducts = async () => {
  try {
    const response = await axios.get(`${BASE_URL_LIST}/fetch-all-listings`, {
      withCredentials: true,  // Ensure cookies (access token) are included
    });
    console.log("data:"+response.data)
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log("freshing token")
      // Access token is expired or invalid, attempt to refresh the token
      try {
        await refreshAccessToken();  // Call the refresh token function
        // Retry the original request after refreshing the access token
        const retryResponse = await axios.get(`${BASE_URL_LIST}/fetch-all-listings`, {
          withCredentials: true,  // Ensure cookies are included again
        });
        return retryResponse.data;
      } catch (refreshError) {
        console.error("Failed to refresh access token. Please log in again.");
        // Optionally redirect to the login page or trigger a logout
      }
    } else {
      console.error("Error fetching listings:", error.message);
    }
  }
};

*/
const fetchScheduledData = async () => {
  const response = await axios.get(`${BASE_URL}/api/schedule`);
  return response.data.result;
};

const ListView = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  // const [columnWidths, setColumnWidths] = useState([80, 80, 350, 80, 110]);
  const [columnWidths, setColumnWidths] = useState([
    80, 80, 350, 80, 80, 90, 80, 90,
  ]);

  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAsin, setSelectedAsin] = useState("");
  const [selectedSku, setSelectedSku] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [copiedfnSkuIndex, setCopiedfnSkuIndex] = useState(null);
  const [scheduledData, setScheduledData] = useState([]);
  const [filterScheduled, setFilterScheduled] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 20;

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || "";
 

  const {
    data: productData,
    error,
    isLoading,
  } = useQuery("products", fetchProducts, {
    onSuccess: (data) => {
      if (!filterScheduled) {
        setFilteredProducts(data.listings);
      }
    },
  });

  useEffect(() => {
    const getScheduledData = async () => {
      const result = await fetchScheduledData();
      setScheduledData(result);
      if (productData) {
        filterProducts(
          productData.listings,
          result,
          filterScheduled,
          searchTerm
        );
      }
    };
    getScheduledData();
  }, [productData]);

  // calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // Adjust this for how many pages to show around the current page
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  const debouncedFilterProducts = useCallback(
    debounce((value) => {
      filterProducts(
        productData?.listings || [],
        scheduledData,
        filterScheduled,
        value
      );
    }, 300),
    [productData, scheduledData, filterScheduled]
  );
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Update search term immediately in the input
    debouncedFilterProducts(value); // Apply debounced filtering
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      const value = event.target.value || "";
      setSearchTerm(value);
      filterProducts(
        productData?.listings || [],
        scheduledData,
        filterScheduled,
        value
      ); // Immediate filtering on Enter press
    }
  };
  // const handleSearch = (value) => {
  //   setSearchTerm(value);
  //   filterProducts(
  //     productData?.listings || [],
  //     scheduledData,
  //     filterScheduled,
  //     value
  //   );
  // };

  const filterProducts = (products, scheduled, onlyScheduled, searchValue) => {
    let filtered = products;
    const now = new Date();

    if (onlyScheduled) {
      const scheduledAsins = scheduled

        .filter(
          (item) =>
            item.status !== "deleted" &&
            (item.weekly ||
              item.monthly ||
              item.endDate === null ||
              (item.endDate && new Date(item.endDate) >= now))
        )

        .map((item) => item.asin);

      filtered = products.filter((product) =>
        scheduledAsins.includes(product.asin1)
      );
    }

    if (searchValue) {
      filtered = filtered.filter(
        (product) =>
          product.itemName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          product.asin1?.toLowerCase().includes(searchValue.toLowerCase()) ||
          product.sellerSku
            ?.toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          product.status?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleToggleFilter = () => {
    const newFilterScheduled = !filterScheduled;
    setFilterScheduled(newFilterScheduled);
    filterProducts(
      productData?.listings || [],
      scheduledData,
      newFilterScheduled,
      searchTerm
    );
  };
  /*
  const handleProductSelect = async (asin, index) => {
    if (selectedRowIndex === index) {
      setSelectedRowIndex(null);
      setSelectedProduct(null);
      setSelectedListing(null);
      setSelectedAsin("");
    } else {
      try {
        const [responseone, responsetwo] = await Promise.all([
          axios.get(
            `${BASE_URL}/details/${asin}`
          ),
          axios.get(
            `${BASE_URL}/product/${asin}`
          ),
        ]);




        setSelectedProduct(responseone.data.payload);
        setSelectedListing(responsetwo.data);
        setSelectedAsin(asin);
        setSelectedRowIndex(index);
      } catch (error) {
        console.error("Error fetching product details:", error.message);
      }
    }
  };*/

  const handleProductSelect = async (price, sku1, asin, index) => {
    if (selectedRowIndex === index) {
      setSelectedRowIndex(null);
      setSelectedProduct(null);
      setSelectedListing(null);
      setSelectedAsin("");
      setSelectedSku("");
      setSelectedPrice("");
    } else {
      setSelectedRowIndex(index);
      setSelectedAsin(asin);
      setSelectedSku(sku1);
      setSelectedPrice(price);

      try {
        const [responseOne, responseTwo] = await Promise.all([
          axios.get(`${BASE_URL}/details/${asin}`),
          axios.get(`${BASE_URL}/product/${asin}`),
        ]);

        setSelectedProduct(responseOne.data.payload);
        setSelectedListing(responseTwo.data);
      } catch (error) {
        console.error("Error fetching product details:", error.message);
      }
    }
  };
  
  /*
  const handleUpdate = (asin, e) => {
    e.stopPropagation();
    if (asin) {
      setSelectedAsin(asin);
      setShowUpdateModal(true);
      setSelectedProduct(product);
    } else {
      console.error("ASIN is not provided. Modal will not open.");
    }
  };
*/
  // Fetch product details when Update Price button is clicked
  const handleUpdate = async (price, sku1, asin, index, e) => {
    e.stopPropagation(); // Prevent row click from being triggered

    if (!asin) {
      console.error("ASIN is not provided. Modal will not open.");
      return;
    }

    try {
      setSelectedPrice(price);
      setSelectedSku(sku1);
      setSelectedAsin(asin);
      setShowUpdateModal(true);
      setSelectedRowIndex(index);
      // Fetch product details and set the selected product
      const response = await axios.get(`${BASE_URL}/details/${asin}`);
      setSelectedProduct(response.data.payload);
      const response2 = await axios.get(`${BASE_URL}/product/${asin}`);
      setSelectedListing(response2.data);
    } catch (error) {
      console.error("Error fetching product details:", error.message);
    }
  };
  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleResize = (index, event) => {
    const startX = event.clientX;
    const startWidth = columnWidths[index];

    const doDrag = (e) => {
      const newWidth = Math.max(50, startWidth + (e.clientX - startX));
      setColumnWidths((prevWidths) => {
        const newWidths = [...prevWidths];
        newWidths[index] = newWidth;
        return newWidths;
      });
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const handleCopy = (text, type, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "asin") {
          setCopiedAsinIndex(index);
          setTimeout(() => setCopiedAsinIndex(null), 2000);
        } else if (type === "sku") {
          setCopiedSkuIndex(index);
          setTimeout(() => setCopiedSkuIndex(null), 2000);
        } else {
          setCopiedfnSkuIndex(index);
          setTimeout(() => setCopiedfnSkuIndex(null), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  if (isLoading)
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
        {/* <Spinner animation="border" /> Loading... */}
        <img
          style={{ width: "40px", marginRight: "6px" }}
          className="animate-pulse"
          src={priceoboIcon}
          alt="Priceobo Icon"
        />
        <br />

        <div className="block">
          <p className="text-xl"> Loading...</p>
        </div>
      </div>
    );
  if (error) return <div style={{ marginTop: "100px" }}>{error.message}</div>;

  

  return (
    <>
      <UpdatePriceFromList
        show={showUpdateModal}
        onClose={handleCloseUpdateModal}
        asin={selectedAsin}
        sku1={selectedSku}
      />

      <div>
        <InputGroup
          className="mb-3"
          style={{ maxWidth: "500px", position: "absolute", top: "10px" }}
        >
          <Form.Control
            type="text"
            placeholder="Search Title/ASIN/SKU/FNSKU"
            value={searchTerm}
            // onChange={(e) => handleSearch(e.target.value)}
            onChange={handleSearch}
            onKeyDown={handleKeyPress}
            style={{ borderRadius: "0px" }}
            className="custom-input"
          />
        </InputGroup>

        <Button
          style={{
            borderRadius: "2px",
            // marginTop: "100px",
            backgroundColor: "#0D6EFD",
            border: "none",
            position: "absolute ",
            top: "10px",
            right: "545px",
          }}
          onClick={handleToggleFilter}
        >
          <span style={{ fontSize: "14px" }}>
            {filterScheduled ? "Show All" : "Scheduled"}
          </span>
        </Button>
      </div>

      <section style={{ display: "flex", gap: "10px" }}>
        <div style={{ paddingRight: "3px", width: "70%" }}>
          {filteredProducts.length > 0 ? (
            <div
              className=" rounded-md "
              style={{
                overflowY: "auto",
                // overflowY: "scroll",
                // maxHeight: "calc(100vh - 20px)",
                marginTop: "50px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                maxHeight: "91vh",
              }}
            >
              <Table
                hover
                responsive
                style={{ width: "100%", tableLayout: "fixed" }}
                className="listCustomTable  "
              >
                <thead
                  className=""
                  style={{
                    // backgroundColor: "#f0f0f0",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "13px",
                    position: "sticky",
                    top: 0,
                    fontWeight: 0,
                  }}
                >
                  <tr className="">
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[0]}px`,
                        minWidth: "80px",
                        // position: "relative",
                        position: "sticky", // Sticky header
                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      Status
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(0, e)}
                      />
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[1]}px`,
                        minWidth: "80px",
                        position: "relative",
                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      Image
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(1, e)}
                      />
                    </th>

                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[2]}px`,
                        minWidth: "80px",
                        position: "relative",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      Product details
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(2, e)}
                      />
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[3]}px`,
                        minWidth: "80px",
                        position: "relative",
                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      Price
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(3, e)}
                      />
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[4]}px`,
                        minWidth: "80px",
                        position: "relative",
                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      FBA/FBM
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(4, e)}
                      />
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[5]}px`,
                        minWidth: "80px",
                        position: "relative",
                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      Channel Stock
                      <div
                        style={{
                          width: "150px",
                          height: "100%",
                          position: "absolute",

                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(5, e)}
                      />
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[6]}px`,
                        minWidth: "80px",
                        position: "relative",
                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      Sale
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(6, e)}
                      />
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[7]}px`,
                        minWidth: "80px",
                        position: "relative",
                        textAlign: "right",
                      }}
                    >
                      Update Price
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(7, e)}
                      />
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
                  {currentItems.map((item, index) => (
                    // {filteredProducts.slice(0, 20).map((item, index) => (
                    <tr
                      key={index}
                      onClick={() =>
                        handleProductSelect(
                          item?.price,
                          item.sellerSku,
                          item.asin1,
                          index
                        )
                      }
                      style={{
                        cursor: "pointer",
                        height: "40px",
                        margin: "20px 0",
                        backgroundColor:
                          selectedRowIndex === index ? "#F1F1F2" : "#ccc",
                      }}
                      className="borderless spacer-row"
                    >
                      <td
                        style={{
                          cursor: "pointer",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                        }}
                      >
                        {item.status}
                      </td>
                      <td
                        style={{
                          cursor: "pointer",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                        }}
                      >
                        <img
                          style={{
                            height: "50px",
                            width: "50px",
                            margin: "0 auto",
                            objectFit: "contain",
                          }}
                          src={item?.imageUrl ? item.imageUrl : noImage}
                          alt=""
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
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                        }}
                      >
                        {item.itemName}
                        <div className="details mt-[5px]">
                          <span
                            className="bubble-text"
                            style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "stretch",
                            }}
                          >
                            {item.asin1}{" "}
                            {copiedAsinIndex === index ? (
                              <MdCheck
                                style={{
                                  marginLeft: "10px",
                                  cursor: "pointer",
                                  color: "green",
                                }}
                              />
                            ) : (
                              <BsClipboardCheck
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.asin1, "asin", index);
                                }}
                                style={{
                                  marginLeft: "10px",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                              />
                              // <BsCopy
                              //   onClick={(e) => {
                              //     e.stopPropagation();
                              //     handleCopy(item.asin1, "asin", index);
                              //   }}
                              //   style={{
                              //     marginLeft: "10px",
                              //     cursor: "pointer",
                              //     fontSize: "13px",
                              //   }}
                              // />
                              // <MdContentCopy
                              //   onClick={(e) => {
                              //     e.stopPropagation();
                              //     handleCopy(item.asin1, "asin", index);
                              //   }}
                              //   style={{ marginLeft: "5px", cursor: "pointer" }}
                              // />
                            )}
                          </span>{" "}
                          <span
                            className="bubble-text"
                            style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {item.sellerSku}{" "}
                            {copiedSkuIndex === index ? (
                              <MdCheck
                                style={{
                                  marginLeft: "10px",
                                  cursor: "pointer",
                                  color: "green",
                                }}
                              />
                            ) : (
                              <BsClipboardCheck
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.sellerSku, "sku", index);
                                }}
                                style={{
                                  marginLeft: "10px",
                                  cursor: "pointer",
                                  fontSize: "16px",
                                }}
                              />
                            )}
                          </span>{" "}
                          <span
                            className="bubble-text"
                            style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {item?.fnSku ? item.fnSku : "N/A"}{" "}
                            {item?.fnSku &&
                              (copiedfnSkuIndex === index ? (
                                <MdCheck
                                  style={{
                                    marginLeft: "10px",
                                    cursor: "pointer",
                                    color: "green",
                                  }}
                                />
                              ) : (
                                <BsClipboardCheck
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(item?.fnSku, "fnSku", index);
                                  }}
                                  style={{
                                    marginLeft: "10px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                  }}
                                />
                              ))}
                          </span>
                          {/* <span className="bubble-text">
                            {item.fulfillmentChannel === "DEFAULT"
                              ? "FBM"
                              : "FBA"}{" "}
                            :{" "}
                            {item?.fulfillableQuantity != null &&
                            item?.pendingTransshipmentQuantity != null
                              ? item?.fulfillableQuantity +
                                item?.pendingTransshipmentQuantity
                              : "N/A"}
                          </span> */}
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
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                        }}
                      >
                        ${item?.price}
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
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                        }}
                      >
                        {item.fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA"}
                        {/* {item?.fulfillableQuantity != null &&
                        item?.pendingTransshipmentQuantity != null
                          ? item?.fulfillableQuantity +
                            item?.pendingTransshipmentQuantity
                          : "N/A"} */}
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
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                        }}
                      >
                        <span>
                          {item.fulfillmentChannel === "DEFAULT"
                            ? item?.quantity != null
                              ? item.quantity
                              : "N/A"
                            : item?.fulfillableQuantity != null &&
                              item?.pendingTransshipmentQuantity != null
                            ? item?.fulfillableQuantity +
                              item?.pendingTransshipmentQuantity
                            : "N/A"}
                        </span>
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",
                          cursor: "pointer",
                          height: "40px",
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                        }}
                      >
                        N/A
                      </td>
                      <td
                        style={{
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "#fff",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <Button
                          style={{
                            // backgroundColor: "#0D6EFD",

                            // paddingLeft: "20px",
                            // paddingRight: "20px",
                            padding: "6px 12px",
                            border: "none",
                            backgroundColor: "#0662BB",
                            borderRadius: "2px",
                            // backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#5AB36D",
                          }}
                          onClick={(e) =>
                            handleUpdate(
                              item?.price,
                              item.sellerSku,
                              item.asin1,
                              index,
                              e
                            )
                          }
                          disabled={!currentUser?.permissions?.write}
                        >
                          <IoMdAdd />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
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
            </div>
          ) : (
            filterScheduled && (
              <div
                style={{
                  marginTop: "20px",
                  color: "#888",
                  textAlign: "center",
                }}
              >
                There is no active schedule.
              </div>
            )
          )}
        </div>
        <div
          // className="fixed"
          style={{
            paddingLeft: "0px",
            marginTop: "20px",
            paddingRight: "0px",
            width: "32%",
            // position: "fixed",
            // top: "20px",
            // right: "10px",
            height: "93vh ",
            // overflowX: "auto",
          }}
        >
          {selectedProduct && selectedListing && selectedAsin ? (
            <div
              style={{ marginTop: "20px" }}
              // style={{ marginTop: "20px", position: "fixed", width: "510px" }}
            >
              <ProductDetailView
                product={selectedProduct}
                listing={selectedListing}
                asin={selectedAsin}
                sku1={selectedSku}
                price={selectedPrice}
              />
            </div>
          ) : (
            <div
              style={{
                // marginTop: "20px",
                paddingTop: "30px",
                height: "93vh",
                display: "flex",

                // justifyContent: "center",
                // alignItems: "center",
              }}
            >
              <Card
                style={{
                  // padding: "20px",
                  width: "100%",
                  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p className="text-2xl flex  justify-center">
                  <BsFillInfoSquareFill className="text-[#0D6EFD]" />
                </p>
                <h5 className="text-base">Select a product to see details</h5>
              </Card>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default ListView;