import { useState, useEffect, useCallback, useRef } from "react";
import { Form, InputGroup, Button, Pagination, Card } from "react-bootstrap";
import { useQuery } from "react-query";
import { MdCheck, MdOutlineClose } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";
import UpdatePriceFromList from "../UpdatePriceFromList";
import axios from "axios";
import { useSelector } from "react-redux";
import { debounce } from "lodash";
import { FixedSizeList as List } from "react-window";

import "./ListView.css";
import ProductDetailView from "../ProductDetailView";

import noImage from "../../assets/images/noimage.png";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = "http://192.168.0.141:3000";

// const BASE_URL = `https://api.priceobo.com`;

// const BASE_URL_LIST = `https://api.priceobo.com`;
// const BASE_URL_LIST = "http://localhost:3000";
const BASE_URL_LIST = "http://192.168.0.141:3000";

import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { BsClipboardCheck, BsFillInfoSquareFill } from "react-icons/bs";
import { ListSaleDropdown } from "../../shared/ui/ListSaleDropdown";
import { ListFbaDropdown } from "../../shared/ui/ListFbaDropdown";
import { LuArrowUpDown } from "react-icons/lu";
import ListLoadingSkeleton from "../../LoadingSkeleton/ListLoadingSkeleton";

const fetchProducts = async () => {
  const response = await axios.get(`${BASE_URL_LIST}/fetch-all-listings`);
  return response.data;
};

const fetchScheduledData = async () => {
  const response = await axios.get(`${BASE_URL}/api/schedule`);
  return response.data.result;
};

const ListView = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnWidths, setColumnWidths] = useState([
    80, 80, 350, 80, 90, 110, 90, 90,
  ]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAsin, setSelectedAsin] = useState("");
  const [selectedSku, setSelectedSku] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [selectedFnSku, setSelectedFnSku] = useState("");
  const [channelStockValue, setChannelStockValue] = useState("");
  const [fulfillmentChannel, setFulfillmentChannel] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [copiedfnSkuIndex, setCopiedfnSkuIndex] = useState(null);
  const [scheduledData, setScheduledData] = useState([]);
  const [filterScheduled, setFilterScheduled] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("7 D");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [channelStockSortOrder, setChannelStockSortOrder] = useState(null);
  const [fbaFbmSortOrder, setFbaFbmSortOrder] = useState(null);
  const [statusSortOrder, setStatusSortOrder] = useState("asc");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const itemRefs = useRef([]);

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || "";
  const getUnitCountForTimePeriod = (salesMetrics, timePeriod) => {
    const metric = salesMetrics.find((metric) => metric.time === timePeriod);
    return metric ? metric.totalUnits : "N/A";
  };
  const handleTimePeriodChange = (timePeriod) => {
    setSelectedTimePeriod(timePeriod);
    setShowFilterDropdown(false);
  };

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
    staleTime: 1000 * 60 * 30, // data is fresh for 30 minutes
    cacheTime: 1000 * 60 * 30, // cache for 30 minutes
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
  }, [productData, filterScheduled, searchTerm]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    setSelectedRowIndex(null);
    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");
  };

  const toggleChannelStockSort = () => {
    const newOrder = channelStockSortOrder === "asc" ? "desc" : "asc";
    setChannelStockSortOrder(newOrder);

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const stockA =
        a.fulfillmentChannel === "DEFAULT"
          ? a.quantity ?? 0
          : (a.fulfillableQuantity ?? 0) +
            (a.pendingTransshipmentQuantity ?? 0);
      const stockB =
        b.fulfillmentChannel === "DEFAULT"
          ? b.quantity ?? 0
          : (b.fulfillableQuantity ?? 0) +
            (b.pendingTransshipmentQuantity ?? 0);

      return newOrder === "asc" ? stockA - stockB : stockB - stockA;
    });

    setFilteredProducts(sortedProducts);
  };

  const statusPriority = {
    Active: 1,
    Inactive: 3,
    Incomplete: 2,
  };

  const toggleStatusSort = () => {
    const newOrder = statusSortOrder === "asc" ? "desc" : "asc";
    setStatusSortOrder(newOrder);

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      const statusA = statusPriority[a.status] ?? Number.MAX_VALUE;
      const statusB = statusPriority[b.status] ?? Number.MAX_VALUE;

      return newOrder === "asc" ? statusA - statusB : statusB - statusA;
    });

    setFilteredProducts(sortedProducts);
  };

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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedFilterProducts(value);
    setSelectedRowIndex(null);
    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");
    setCurrentPage(1);
  };

  const debouncedFilterProducts = useCallback(
    debounce(async (value) => {
      setIsSearching(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/product/${value}`);
        const searchResults = response.data;

        setFilteredProducts(searchResults.listings || []);
      } catch (error) {
        console.error("Error fetching search results:", error.message);
        setFilteredProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleClearInput = () => {
    setSearchTerm("");
    debouncedFilterProducts("");
    setCurrentPage(1);
    setSelectedRowIndex(null);
    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");
    setFilteredProducts(productData.listings);
  };

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
        .map((item) => item.sku);

      filtered = products.filter((product) =>
        scheduledAsins.includes(product.sellerSku)
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
    return filtered;
  };

  const handleToggleFilter = () => {
    const newFilterScheduled = !filterScheduled;
    setFilterScheduled(newFilterScheduled);

    setSelectedRowIndex(null);
    setSelectedProduct(null);
    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");

    if (newFilterScheduled) {
      const filtered = filterProducts(
        productData?.listings || [],
        scheduledData,
        newFilterScheduled,
        searchTerm
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(productData?.listings || []);
    }
  };

  const handleSetChannelStockValue = (
    fulfillmentChannel,
    quantity,
    fulfillableQuantity,
    pendingTransshipmentQuantity
  ) => {
    const channelStock =
      fulfillmentChannel === "DEFAULT"
        ? quantity != null
          ? quantity
          : "N/A"
        : fulfillableQuantity != null && pendingTransshipmentQuantity != null
        ? fulfillableQuantity + pendingTransshipmentQuantity
        : "N/A";

    setChannelStockValue(channelStock);
  };

  const handleProductSelect = async (
    price,
    sku1,
    asin,
    fnSku,
    index,
    fulfillmentChannel,
    quantity,
    fulfillableQuantity,
    pendingTransshipmentQuantity,
    item
  ) => {
    if (selectedRowIndex === index) {
      setSelectedRowIndex(null);
      setSelectedProduct(null);
      setSelectedListing(null);
      setSelectedAsin("");
      setSelectedSku("");
      setSelectedFnSku("");
      setSelectedPrice("");
      handleSetChannelStockValue(null);
      setFulfillmentChannel(null);
      setShowFilterDropdown(false);
    } else {
      setSelectedRowIndex(index);
      setSelectedAsin(asin);
      setSelectedSku(sku1);
      setSelectedFnSku(fnSku);
      setSelectedPrice(price);
      setFulfillmentChannel(fulfillmentChannel);
      setShowFilterDropdown(false);
      handleSetChannelStockValue(
        fulfillmentChannel,
        quantity,
        fulfillableQuantity,
        pendingTransshipmentQuantity
      );

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

  const fetchProductsByChannel = async (channel) => {
    // setIsSearching(true); // Show loading indicator
    try {
      let url = `${BASE_URL}/api/product/channel`;

      if (channel === "FBA") {
        url += "/AMAZON_NA"; // Append for FBA
      } else if (channel === "FBM") {
        url += "/DEFAULT"; // Append for FBM
      }

      const response = await axios.get(url);
      const products = response.data;

      setFilteredProducts(products.products || []); // Update displayed products
      sessionStorage.setItem(
        "filteredProducts",
        JSON.stringify(products.products || [])
      ); // Save results in sessionStorage
    } catch (error) {
      console.error("Error fetching products by channel:", error.message);
      setFilteredProducts([]); // Clear products on error
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdate = async (
    price,
    sku1,
    asin,
    fnSku,
    fulfillmentChannel,
    quantity,
    fulfillableQuantity,
    pendingTransshipmentQuantity,
    index,
    e
  ) => {
    e.stopPropagation();

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
      setSelectedFnSku(fnSku);
      setFulfillmentChannel(fulfillmentChannel);
      handleSetChannelStockValue(
        fulfillmentChannel,
        quantity,
        fulfillableQuantity,
        pendingTransshipmentQuantity
      );

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

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      const value = event.target.value || "";
      setSearchTerm(value);
      filterProducts(
        productData?.listings || [],
        scheduledData,
        filterScheduled,
        value
      );
    }
  };

  if (isLoading) {
    return <ListLoadingSkeleton></ListLoadingSkeleton>;
  }

  if (error) return <div style={{ marginTop: "100px" }}>{error.message}</div>;

  return (
    <>
      <UpdatePriceFromList
        product={selectedProduct}
        show={showUpdateModal}
        onClose={handleCloseUpdateModal}
        asin={selectedAsin}
        sku1={selectedSku}
        fnSku={selectedFnSku}
        channelStockValue={channelStockValue}
        fulfillmentChannel={fulfillmentChannel}
        productDetailLoading={productDetailLoading}
        setProductDetailLoading={setProductDetailLoading}
      />

      <div>
        <div className="relative ">
          <InputGroup
            className="mb-3"
            style={{ maxWidth: "500px", position: "absolute", top: "-7px" }}
          >
            <Form.Control
              type="text"
              placeholder="Search Title/ASIN/SKU/FNSKU"
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyPress}
              style={{ borderRadius: "0px" }}
              className="custom-input"
            />
            {searchTerm && (
              <button
                onClick={handleClearInput}
                className="absolute right-2 top-1  p-1 z-10 text-xl rounded transition duration-500 text-black"
              >
                <MdOutlineClose />
              </button>
            )}
          </InputGroup>
        </div>

        <Button
          style={{
            borderRadius: "2px",

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

                marginTop: "50px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
                maxHeight: "91vh",
              }}
            >
              <table
                style={{ width: "100%", tableLayout: "fixed" }}
                className="listCustomTable  table "
              >
                <thead
                  className="tableHeader"
                  style={{
                    fontFamily: "Arial, sans-serif",
                    fontSize: "13px",
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <tr className="">
                    <th
                      className="tableHeader"
                      style={{
                        width: `${columnWidths[0]}px`,

                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      <p className="flex  items-center justify-center gap-1">
                        Status
                      </p>
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

                        textAlign: "center",
                        borderRight: "2px solid #C3C6D4",
                      }}
                    >
                      <p className="flex  items-center justify-center gap-1">
                        FBA/FBM
                        <ListFbaDropdown
                          onChannelChange={fetchProductsByChannel}
                        ></ListFbaDropdown>
                      </p>
                      <div
                        style={{
                          width: "1px",
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
                      <p className="flex  justify-center items-center gap-1">
                        {" "}
                        Channel Stock
                        <LuArrowUpDown
                          className="text-[15px] font-thin cursor-pointer"
                          onClick={toggleChannelStockSort}
                        />{" "}
                      </p>

                      <div
                        style={{
                          width: "5px",
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
                      <p className="flex  items-center justify-center gap-1">
                        Sale
                        <ListSaleDropdown
                          handleTimePeriodChange={handleTimePeriodChange}
                        ></ListSaleDropdown>
                      </p>
                      <div
                        style={{
                          position: "relative",
                          float: "right",
                          marginRight: "10px",
                        }}
                      ></div>
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
                        textAlign: "center",
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
                    <tr
                      key={index}
                      ref={(el) => (itemRefs.current[index] = el)} // Store reference to each row element
                      onClick={() =>
                        handleProductSelect(
                          item?.price,
                          item.sellerSku,
                          item.asin1,
                          item.fnSku,
                          index,
                          item.fulfillmentChannel,
                          item.quantity,
                          item.fulfillableQuantity,
                          item.pendingTransshipmentQuantity,
                          item
                        )
                      }
                      style={{
                        cursor: "pointer",
                        height: "40px",
                        margin: "20px 0",
                      }}
                      className={`borderless spacer-row ${
                        selectedRowIndex === index ? "selected-row" : ""
                      }`}
                    >
                      <td
                        className={` ${
                          selectedRowIndex === index ? "selected-row" : ""
                        }`}
                        style={{
                          cursor: "pointer",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "",
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
                            selectedRowIndex === index ? "#F1F1F2" : "",
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
                            selectedRowIndex === index ? "#F1F1F2" : "",
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
                                  fontSize: "16px",
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
                                  fontSize: "16px",
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
                                    fontSize: "16px",
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
                            selectedRowIndex === index ? "#F1F1F2" : "",
                        }}
                      >
                        ${parseFloat(item?.price).toFixed(2)}
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
                            selectedRowIndex === index ? "#F1F1F2" : "",
                        }}
                      >
                        {item.fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA"}
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
                            selectedRowIndex === index ? "#F1F1F2" : "",
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
                            selectedRowIndex === index ? "#F1F1F2" : "",
                        }}
                      >
                        {item?.salesMetrics
                          ? `${getUnitCountForTimePeriod(
                              item.salesMetrics,
                              selectedTimePeriod
                            )}`
                          : "N/A"}
                      </td>
                      <td
                        style={{
                          backgroundColor:
                            selectedRowIndex === index ? "#F1F1F2" : "",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <Button
                          className="updatePriceBtn"
                          style={{
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "#0662BB",
                            borderRadius: "3px",
                            zIndex: 1,
                          }}
                          onClick={(e) =>
                            handleUpdate(
                              item?.price,
                              item?.sellerSku,
                              item?.asin1,
                              item?.fnSku,
                              item?.fulfillmentChannel,
                              item?.quantity,
                              item?.fulfillableQuantity,
                              item?.pendingTransshipmentQuantity,
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
            </div>
          ) : (
            filterScheduled && (
              <div className="flex justify-center items-center text-[#888] h-[20vh] mt-[10%]">
                There is no active schedule.
              </div>
            )
          )}
        </div>
        <div
          style={{
            paddingLeft: "0px",
            marginTop: "20px",
            paddingRight: "0px",
            width: "32%",

            height: "93vh ",
          }}
        >
          {selectedProduct && selectedListing && selectedAsin ? (
            <div style={{ marginTop: "20px" }}>
              <ProductDetailView
                key={selectedAsin}
                product={selectedProduct}
                listing={selectedListing}
                asin={selectedAsin}
                sku1={selectedSku}
                fnSku={selectedFnSku}
                price={selectedPrice}
                channelStockValue={channelStockValue}
                fulfillmentChannel={fulfillmentChannel}
                productDetailLoading={productDetailLoading}
                setProductDetailLoading={setProductDetailLoading}
              />
            </div>
          ) : (
            <div
              style={{
                paddingTop: "30px",
                height: "93vh",
                display: "flex",
              }}
            >
              <Card
                style={{
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
