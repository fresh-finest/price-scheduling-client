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
import { HiMagnifyingGlass } from "react-icons/hi2";
import "./ListView.css";
import ProductDetailView from "../ProductDetailView";

import noImage from "../../../assets/images/noimage.png";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.141:3000";

const BASE_URL = `https://api.priceobo.com`;

// const BASE_URL_LIST = "http://localhost:3000";
// const BASE_URL_LIST = "http://192.168.0.141:3000";

import { BsClipboardCheck, BsFillInfoSquareFill } from "react-icons/bs";
import { ListSaleDropdown } from "../../shared/ui/ListSaleDropdown";
import { ListFbaDropdown } from "../../shared/ui/ListFbaDropdown";
import { LuArrowUpDown } from "react-icons/lu";
import ListLoadingSkeleton from "../../LoadingSkeleton/ListLoadingSkeleton";
import ListViewTable from "./ListViewTable";
import ListViewPagination from "./ListViewPagination";
import ListSearchLoadingSkeleton from "../../LoadingSkeleton/ListSearchLoadingSkeleton";
import ListSalePopover from "../../../components/shared/ui/ListSalePopover";
import ListChannelStockPopover from "../../../components/shared/ui/ListChannelStockPopever";
const fetchScheduledData = async () => {
  const response = await axios.get(`${BASE_URL}/api/schedule`);

  return response.data.result;
};

const ListView = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isFbaFbmSearchMode, setIsFbaFbmSearchMode] = useState(false);
  const [isScheduleSearchMode, setIsScheduleSearchMode] = useState(false);
  const [isAllProductSearchMode, setIsAllProductSearchMode] = useState(false);
  const [isSaleSearchMode, setIsSaleSearchMode] = useState(false);
  const [isChannelStockSearchMode, setIsChannelStockSearchMode] =
    useState(false);
  const [isLoadingMode, setIsLoadingMode] = useState(false);
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
  const [filteredProducts, setFilteredProducts] = useState("");
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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFbaFbmOption, setSelectedFbaFbmOption] = useState("");

  const [inputValue, setInputValue] = useState("");
  const [channelStockInputValue, setChannelStockInputValue] = useState("");

  const itemsPerPage = 20;
  const itemRefs = useRef([]);

  const { currentUser } = useSelector((state) => state.user);

  const dayOptions = [
    { value: "1 D", label: "Yesterday" },
    { value: "7 D", label: "Last 7 Days" },
    { value: "15 D", label: "Last 15 Days" },
    { value: "30 D", label: "Last 30 Days" },
    { value: "60 D", label: "Last 60 Days" },
    { value: "90 D", label: "Last 90 Days" },
    { value: "6 M", label: "Last 6 Months" },
    { value: "1 Y", label: "Last 1 Year" },
  ];

  const unitOptions = [
    { value: "==", label: "Equals" },
    { value: ">", label: "Greater than" },
    { value: "<", label: "Less than" },
  ];

  const [selectedDay, setSelectedDay] = useState(dayOptions[0]);
  const [selectedUnit, setSelectedUnit] = useState(unitOptions[1]);
  const [selectedChannelStockUnit, setSelectedChannelStockUnit] = useState(
    unitOptions[1]
  );

  const userName = currentUser?.userName || "";
  const getUnitCountForTimePeriod = (salesMetrics, timePeriod) => {
    const metric = salesMetrics.find((metric) => metric.time === timePeriod);
    return metric ? metric.totalUnits : "N/A";
  };
  const handleTimePeriodChange = (timePeriod) => {
    setSelectedTimePeriod(timePeriod);
    setShowFilterDropdown(false);
  };

  const fetchProducts = async (page) => {
    try {
      setIsLoading(true);
      setIsLoadingMode(true);
      setIsSearchMode(false);
      setIsFbaFbmSearchMode(false);
      setIsScheduleSearchMode(false);
      setIsAllProductSearchMode(false);
      setIsSaleSearchMode(false);
      setIsChannelStockSearchMode(false);
      setError(null);
      const response = await axios.get(
        `${BASE_URL}/api/product/limit?page=${page}`
      );
      console.log(response.data);
      setFilteredProducts(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // const {
  //   data: productData,
  //   error,
  //   isLoading,
  //   refetch,
  // } = useQuery(["products", currentPage], () => fetchProducts(currentPage), {
  //   keepPreviousData: true,
  //   staleTime: 1000 * 60 * 5,
  //   refetchOnWindowFocus: true,
  //   onSuccess: (data) => {
  //     console.log(data);
  //     if (!filterScheduled) {
  //       setFilteredProducts(data.listings);
  //     }
  //   },
  // });

  // useEffect(() => {
  //   fetchProducts(currentPage);

  // }, [currentPage]);

  const debouncedFilterProducts = useCallback(
    debounce(async (value, page) => {
      setIsSearching(true);

      try {
        const response = await axios.get(
          `${BASE_URL}/api/product/${value}?page=${page}`
        );
        const searchResults = response.data;

        setFilteredProducts(searchResults.data);
        setIsSearching(false);
      } catch (error) {
        console.error("Error fetching search results:", error.message);
        setFilteredProducts([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    // Handle data fetching based on the mode
    if (isSearchMode && searchTerm.trim()) {
      debouncedFilterProducts(searchTerm, currentPage);
    } else if (isFbaFbmSearchMode) {
      console.log(isFbaFbmSearchMode);
      fetchProductsByChannel(selectedFbaFbmOption, currentPage);
    } else if (isScheduleSearchMode) {
      console.log("schedule search hits here");
      fetchAllSchedule(currentPage);
    } else if (isAllProductSearchMode) {
      fetchAllProducts(currentPage);
    } else if (isSaleSearchMode) {
      fetchListSalesProduct(currentPage);
    } else if (isChannelStockSearchMode) {
      fetchListChannelStock(currentPage);
    } else if (
      !isSearchMode &&
      !isFbaFbmSearchMode &&
      !isScheduleSearchMode &&
      !isAllProductSearchMode &&
      !isSaleSearchMode &&
      !isChannelStockSearchMode
    ) {
      console.log("hiits here");
      fetchProducts(currentPage);
    }
  }, [currentPage, isSearchMode]);

  useEffect(() => {
    // Initial data load
    fetchProducts(1); // Start with the first page of default data
  }, []);
  // useEffect(() => {
  //   if (!isSearchMode) {
  //     fetchProducts(currentPage);

  //   }
  // }, []);

  // useEffect(() => {
  //   if (isSearchMode && searchTerm.trim()) {
  //     handleSearch(searchTerm, currentPage);
  //   } else {
  //     fetchProducts(currentPage);
  //   }
  // }, [currentPage, isSearchMode, searchTerm, handleSearch]);

  // calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts?.listings?.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(filteredProducts.totalProducts / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    setSelectedRowIndex(null);
    // setSelectedProduct(null);
    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");
  };

  const toggleChannelStockSort = () => {
    const newOrder = channelStockSortOrder === "asc" ? "desc" : "asc";
    setChannelStockSortOrder(newOrder);

    // Sort displayedProducts based on channel stock value
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

      if (newOrder === "asc") {
        return stockA - stockB;
      } else {
        return stockB - stockA;
      }
    });

    setFilteredProducts(sortedProducts);
  };

  const fetchProductsByChannel = async (channel, page) => {
    setIsSearching(true);
    setIsFbaFbmSearchMode(true);
    setIsSearchMode(false);
    setIsScheduleSearchMode(false);
    setIsAllProductSearchMode(false);
    setIsSaleSearchMode(false);
    setIsChannelStockSearchMode(false);
    setIsLoadingMode(false);
    setSearchTerm("");
    try {
      console.log("channel", channel);
      let url = `${BASE_URL}/api/product/channel`;

      if (channel === "FBA") {
        url += "/AMAZON_NA"; // Append for FBA
      } else if (channel === "FBM") {
        url += "/DEFAULT"; // Append for FBM
      } else if (channel === "All") {
        url = `${BASE_URL}/api/product/limit`;
      }

      url += `?page=${page}`; // Append the page query at the end

      const response = await axios.get(url);
      const products = response.data;
      console.log("products", products);

      setFilteredProducts(products.data);
      setIsSearching(false);
    } catch (error) {
      console.error("Error fetching products by channel:", error.message);
      setFilteredProducts([]); // Handle error by clearing the filtered products
    } finally {
      setIsSearching(false); // Ensure loading state is cleared
    }
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
      const statusA =
        statusPriority[
          a.status.trim().toLowerCase().charAt(0).toUpperCase() +
            a.status.slice(1)
        ] ?? Number.MAX_VALUE;
      const statusB =
        statusPriority[
          b.status.trim().toLowerCase().charAt(0).toUpperCase() +
            b.status.slice(1)
        ] ?? Number.MAX_VALUE;

      if (newOrder === "asc") {
        return statusA - statusB;
      } else {
        return statusB - statusA;
      }
    });

    // setFilteredProducts(sortedProducts);
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;
    // const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    // const totalPages = Math.ceil(filteredProducts.totalProducts / itemsPerPage);
    const totalPages = filteredProducts.totalPages;

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

  const handleSearch = (value, currentPage) => {
    if (!value.trim()) return;
    setIsSearching(true);
    setIsSearchMode(true);
    setIsFbaFbmSearchMode(false);
    setIsScheduleSearchMode(false);
    setIsAllProductSearchMode(false);
    setIsSaleSearchMode(false);
    setIsChannelStockSearchMode(false);
    setIsLoadingMode(false);
    setSelectedFbaFbmOption("");
    setIsLoadingMode(false);
    setSearchTerm(value);
    setFilteredProducts([]);

    debouncedFilterProducts(value, currentPage);

    setSelectedRowIndex(null);
    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");

    setCurrentPage(1);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setIsSearchMode(false);

    debouncedFilterProducts("");
    setCurrentPage(1);

    setSelectedRowIndex(null);

    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");

    // setFilteredProducts(productData.listings);
    fetchProducts(currentPage);
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearch(searchTerm, currentPage);
    }
  };

  const fetchAllSchedule = async (page) => {
    setIsScheduleSearchMode(true);
    setIsSearchMode(false);
    setIsFbaFbmSearchMode(false);
    setIsAllProductSearchMode(false);
    setIsSaleSearchMode(false);
    setIsChannelStockSearchMode(false);
    setIsLoadingMode(false);
    try {
      setIsSearching(true);
      const url = `${BASE_URL}/api/product/schedule?page=${page}`;
      const response = await axios.get(url);
      setFilteredProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching scheduled products:", error.message);
      setFilteredProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchAllProducts = async (page) => {
    setIsAllProductSearchMode(true);
    setIsSearchMode(false);
    setIsFbaFbmSearchMode(false);
    setIsScheduleSearchMode(false);
    setIsSaleSearchMode(false);
    setIsChannelStockSearchMode(false);
    setIsScheduleSearchMode(false);
    setIsLoadingMode(false);
    try {
      setIsSearching(true);
      const url = `${BASE_URL}/api/product/limit?page=${page}`;
      const response = await axios.get(url);
      setFilteredProducts(response.data.data || []);
    } catch (error) {
      console.error("Error fetching all products:", error.message);
      setFilteredProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleToggleFilter = async () => {
    const newFilterScheduled = !filterScheduled;
    setFilterScheduled(newFilterScheduled);

    setSelectedRowIndex(null);
    setSelectedProduct(null);
    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");
    setCurrentPage(1);
    setSearchTerm("");
    if (newFilterScheduled) {
      fetchAllSchedule(1);
    } else {
      fetchAllProducts(1);
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
    const scrollPosition =
      document.documentElement.scrollTop || document.body.scrollTop;

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
  const handleChannelChange = (option) => {
    setSelectedFbaFbmOption(option);
    setCurrentPage(1);
    setSearchTerm("");
    fetchProductsByChannel(option, currentPage); // Call the API to fetch the filtered data
  };

  const fetchListSalesProduct = async (page) => {
    try {
      setIsLoading(true);
      setIsSaleSearchMode(true);
      setIsSearchMode(false);
      setIsFbaFbmSearchMode(false);
      setIsScheduleSearchMode(false);
      setIsAllProductSearchMode(false);
      setIsChannelStockSearchMode(false);
      setIsLoadingMode(false);
      const response = await axios.get(
        `${BASE_URL}/api/product/filter/unit?days=${selectedDay.value}&condition=${selectedUnit.value}&units=${inputValue}&page=${page}`
      );
      const searchResults = response.data;
      setFilteredProducts(searchResults.data);
    } catch (err) {
      console.error("Error while calling the API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchListChannelStock = async (page) => {
    try {
      setIsLoading(true);
      setIsChannelStockSearchMode(true);
      setIsSearchMode(false);
      setIsFbaFbmSearchMode(false);
      setIsScheduleSearchMode(false);
      setIsAllProductSearchMode(false);
      setIsSaleSearchMode(false);
      setIsLoadingMode(false);

      const response = await axios.get(
        `${BASE_URL}/api/product/stock?condition=${selectedChannelStockUnit.value}&stock=${channelStockInputValue}&page=${page}`
      );
      const searchResults = response.data;
      setFilteredProducts(searchResults.data);
    } catch (err) {
      console.error("Error while calling the API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleListSalePopoverSubmit = async (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setSearchTerm("");
    fetchListSalesProduct(currentPage);
  };

  const handleChannelStockPopoverSubmit = async (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setSearchTerm("");
    fetchListChannelStock(currentPage);
  };

  // if (isLoading)
  //   return (
  //     <div
  //       style={{
  //         marginTop: "100px",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "60vh",
  //       }}
  //     >
  //       {/* <Spinner animation="border" /> Loading... */}
  //       <img
  //         style={{ width: "40px", marginRight: "6px" }}
  //         className="animate-pulse"
  //         src={priceoboIcon}
  //         alt="Priceobo Icon"
  //       />
  //       <br />

  //       <div className="block">
  //         <p className="text-xl"> Loading...</p>
  //       </div>
  //     </div>
  //   );

  if (isLoading) {
    return <ListLoadingSkeleton></ListLoadingSkeleton>;
  }

  if (isSearching) {
    return (
      <ListSearchLoadingSkeleton
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        currentPage={currentPage}
        handleSearch={handleSearch}
        handleKeyPress={handleKeyPress}
        handleClearInput={handleClearInput}
      ></ListSearchLoadingSkeleton>
    );
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
            {/* <Form.Control
              type="text"
              placeholder="Search Title/ASIN/SKU/FNSKU"
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyPress}
              style={{ borderRadius: "0px" }}
              className="custom-input"
            />
            <button className="px-3 py-2 bg-gray-300">
              <HiMagnifyingGlass />
            </button> */}

            <Form.Control
              type="text"
              placeholder="Search Title/ASIN/SKU/FNSKU"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.trim())}
              onKeyDown={handleKeyPress}
              style={{ borderRadius: "0px" }}
              className="custom-input"
            />
            <button
              className="px-3 py-2 bg-gray-300"
              onClick={() => handleSearch(searchTerm, currentPage)}
            >
              <HiMagnifyingGlass />
            </button>

            {searchTerm && (
              <button
                onClick={handleClearInput}
                className="absolute right-12 top-1  p-1 z-10 text-xl rounded transition duration-500 text-black"
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
                        // onChannelChange={fetchProductsByChannel}
                        selectedFbaFbmOption={selectedFbaFbmOption}
                        onChannelChange={handleChannelChange}
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
                      <ListChannelStockPopover
                        handleChannelStockPopoverSubmit={
                          handleChannelStockPopoverSubmit
                        }
                        unitOptions={unitOptions}
                        selectedChannelStockUnit={selectedChannelStockUnit}
                        setSelectedChannelStockUnit={
                          setSelectedChannelStockUnit
                        }
                        channelStockInputValue={channelStockInputValue}
                        setChannelStockInputValue={setChannelStockInputValue}
                      ></ListChannelStockPopover>
                      Channel Stock
                      {/* <LuArrowUpDown
                          className="text-[15px] font-thin cursor-pointer"
                          // onClick={toggleChannelStockSort}
                        />{" "} */}
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
                      {/* <ListSaleDropdown
                          handleTimePeriodChange={handleTimePeriodChange}
                        ></ListSaleDropdown> */}
                      <ListSalePopover
                        handleListSalePopoverSubmit={
                          handleListSalePopoverSubmit
                        }
                        dayOptions={dayOptions}
                        unitOptions={unitOptions}
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                        selectedUnit={selectedUnit}
                        setSelectedUnit={setSelectedUnit}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                      ></ListSalePopover>
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
              {filteredProducts?.listings?.length > 0 ? (
                <tbody
                  style={{
                    fontSize: "12px",
                    fontFamily: "Arial, sans-serif",
                    lineHeight: "1.5",
                  }}
                >
                  {filteredProducts.listings.map((item, index) => {
                    return (
                      <ListViewTable
                        key={item._id}
                        index={index}
                        itemRefs={itemRefs}
                        handleProductSelect={handleProductSelect}
                        item={item}
                        selectedRowIndex={selectedRowIndex}
                        noImage={noImage}
                        handleCopy={handleCopy}
                        copiedSkuIndex={copiedSkuIndex}
                        copiedAsinIndex={copiedAsinIndex}
                        copiedfnSkuIndex={copiedfnSkuIndex}
                        handleUpdate={handleUpdate}
                        currentUser={currentUser}
                        selectedTimePeriod={selectedTimePeriod}
                        getUnitCountForTimePeriod={getUnitCountForTimePeriod}
                      ></ListViewTable>
                    );
                  })}
                </tbody>
              ) : (
                <tr>
                  <td
                    className="h-[83vh] text-base"
                    colSpan="8"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      border: "none",
                    }}
                  >
                    {/* <span className="text-2xl flex  justify-center">
                    </span>{" "} */}
                    {/* <p>  <BsFillInfoSquareFill className="text-[#0D6EFD]  text-2xl " /> </p> */}
                    No data to show
                  </td>
                </tr>
              )}
            </table>

            {filteredProducts?.listings?.length > 0 && (
              <ListViewPagination
                handlePageChange={handlePageChange}
                currentPage={currentPage}
                totalPages={totalPages}
                renderPaginationButtons={renderPaginationButtons}
              ></ListViewPagination>
            )}
          </div>
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