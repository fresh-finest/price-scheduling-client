import { useState, useEffect, useCallback, useRef } from "react";
import { Form, InputGroup, Button, Pagination, Card } from "react-bootstrap";
import ClipLoader from "react-spinners/ClipLoader";
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
import { Button as ShadcdnBtn } from "@/components/ui/button";

import noImage from "../../../assets/images/noimage.png";


const BASE_URL = `https://api.priceobo.com`;

import { BsDashCircle, BsFillInfoSquareFill } from "react-icons/bs";

import { ListFbaDropdown } from "../../shared/ui/ListFbaDropdown";

import ListLoadingSkeleton from "../../LoadingSkeleton/ListLoadingSkeleton";
import ListViewTable from "./ListViewTable";
import ListViewPagination from "./ListViewPagination";

import ListSalePopover from "../../../components/shared/ui/ListSalePopover";
import ListChannelStockPopover from "../../../components/shared/ui/ListChannelStockPopever";

import { IoClose } from "react-icons/io5";
import ListTagsDropdown from "../../shared/ui/ListTagsDropDown";
import ActionsDropdown from "../Actions/ActionsDropdown";
import Swal from "sweetalert2";
import { FaSync } from "react-icons/fa";

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
  const [customFilterMode, setCustomFilterMode] = useState(false);
  const [columnWidths, setColumnWidths] = useState([
    70, 70, 80, 350, 80, 90, 90, 120, 70, 90,
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

  const [filterScheduled, setFilterScheduled] = useState(false);

  const [selectedTimePeriod, setSelectedTimePeriod] = useState("7 D");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const [productDetailLoading, setProductDetailLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFbaFbmOption, setSelectedFbaFbmOption] = useState("");

  const [inputValue, setInputValue] = useState("");
  const [channelStockInputValue, setChannelStockInputValue] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const [ChannelStockBetweenMinValue, setChannelStockBetweenMinValue] =
    useState("");
  const [saleBetweenMinValue, setSaleBetweenMinValue] = useState("");
  const [ChannelStockBetweenMaxValue, setChannelStockBetweenMaxValue] =
    useState("");
  const [saleBetweenMaxValue, setSaleBetweenMaxValue] = useState("");
  const [tagsUpdated, setTagsUpdated] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectAllTags, setSelectAllTags] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [filters, setFilters] = useState({
    fulfillmentChannel: null,
    stockCondition: null,
    salesCondition: null,
    uid: null,
    tags: [],
  });

  const itemsPerPage = 20;
  const itemRefs = useRef([]);
  const isFirstRender = useRef(true);
  const { currentUser } = useSelector((state) => state.user);

  const isFilterActive = Object.values(filters).some(
    (value) =>
      value !== null &&
      value !== undefined &&
      !(Array.isArray(value) && value.length === 0)
  );

  console.log("isFilterActive", isFilterActive);
  console.log("filters", filters);

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
    { value: "!=", label: "Does not equal" },
    { value: ">", label: "Greater than" },
    { value: ">=", label: "Greater than or equal to" },
    { value: "<", label: "Less than" },
    { value: "<=", label: "Less than or equal to" },
    { value: "between", label: "Between" },
  ];

  const [selectedDay, setSelectedDay] = useState(dayOptions[1]);
  const [selectedUnit, setSelectedUnit] = useState(unitOptions[2]);
  const [selectedChannelStockUnit, setSelectedChannelStockUnit] = useState(
    unitOptions[2]
  );

  const getUnitCountForTimePeriod = (salesMetrics, timePeriod) => {
    const metric = salesMetrics.find((metric) => metric.time === timePeriod);
    return metric ? metric.totalUnits : "N/A";
  };

  const buildApiUrl = (page) => {
    const baseUrl = `${BASE_URL}/api/product/sale-stock`;

    const params = new URLSearchParams({
      page: page || 1,
      limit: 50,
    });

    if (filters.fulfillmentChannel) {
      params.append("fulfillmentChannel", filters.fulfillmentChannel);
    }
    if (filters.stockCondition) {
      params.append("stockCondition", JSON.stringify(filters.stockCondition));
    }
    if (filters.salesCondition) {
      params.append("salesCondition", JSON.stringify(filters.salesCondition));
    }
    if (filters.uid) {
      params.append("uid", filters.uid);
    }

    if (filters.tags && filters.tags.length > 0) {
      const tagNames = filters.tags.join(",");
      params.append("tags", tagNames);
    }

    const finalUrl = `${baseUrl}?${params.toString()}`;

    console.log("final url", finalUrl);

    return finalUrl;
  };

  const fetchProducts = async (page) => {
    try {
      setIsSearching(true);
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

      setFilteredProducts(response.data.data);
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  console.log("filtered products", filteredProducts);

  const fetchData = async (page) => {
    setIsSearching(true);
    try {
      const url = buildApiUrl(page);

      const response = await axios.get(url);

      setFilteredProducts(response.data.metadata);
    } catch (error) {
      console.error("Error fetching data:", error.message);
      setFilteredProducts([]);
    } finally {
      setIsSearching(false);
    }
  };

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
    if (
      filters.fulfillmentChannel ||
      filters.salesCondition ||
      filters.stockCondition ||
      filters.uid ||
      filters?.tags?.length > 0
    ) {
      fetchData(1);
    }
  }, [filters]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setIsLoading(true);
      fetchProducts(1);
      return;
    }

    if (isSearchMode && searchTerm.trim()) {
      debouncedFilterProducts(searchTerm, currentPage);
    } else if (isScheduleSearchMode) {
      fetchAllSchedule(currentPage);
    } else if (isAllProductSearchMode) {
      fetchProducts(currentPage);
    } else if (isSaleSearchMode) {
      fetchListSalesProduct(currentPage);
    } else if (isChannelStockSearchMode) {
      fetchListChannelStock(currentPage);
    } else if (customFilterMode) {
      fetchData(currentPage);
    } else {
      fetchProducts(currentPage);
    }
  }, [
    currentPage,
    isSearchMode,

    isScheduleSearchMode,
    isAllProductSearchMode,
    isSaleSearchMode,
    isChannelStockSearchMode,
    customFilterMode,
  ]);

  useEffect(() => {
    const handleTagsUpdate = async () => {
      if (tagsUpdated) {
        try {
          if (customFilterMode) {
            fetchData(currentPage);
          } else {
            fetchProducts(currentPage);
          }

          if (selectedAsin) {
            const [responseOne, responseTwo] = await Promise.all([
              axios.get(`${BASE_URL}/details/${selectedAsin}`),
              axios.get(`${BASE_URL}/product/${selectedAsin}`),
            ]);

            setSelectedProduct({
              ...responseOne.data.payload,
              tags: responseOne.data.payload.tags,
            });
            setSelectedListing(responseTwo.data);
          }
        } catch (error) {
          console.error(
            "Error refetching data after tags update:",
            error.message
          );
        } finally {
          // Reset the state
          setTagsUpdated(false);
        }
      }
    };

    handleTagsUpdate();
    setTagsUpdated(false);
  }, [tagsUpdated]);

  const totalPages = Math.ceil(filteredProducts.totalProducts / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);

    setSelectedRowIndex(null);

    setSelectedAsin("");
    setSelectedSku("");
    setSelectedFnSku("");
    setSelectedPrice("");
  };

  const handleTagSelection = (tagNames) => {
    let updatedTags = [];

    if (Array.isArray(tagNames)) {
      updatedTags = tagNames;
    } else {
      updatedTags = selectedTags.includes(tagNames)
        ? selectedTags.filter((tag) => tag !== tagNames)
        : [...selectedTags, tagNames];
    }

    setSelectedTags(updatedTags);

    setFilters((prev) => ({
      ...prev,
      tags: updatedTags,
    }));
    setCustomFilterMode(true);
    setCurrentPage(1);
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;

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

  const handleSearch = (value) => {
    if (!value.trim()) {
      setFilters((prev) => {
        const updatedFilters = { ...prev };
        delete updatedFilters.uid;
        return updatedFilters;
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        uid: value,
      }));
    }

    setCustomFilterMode(true);

    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setIsSearchMode(false);
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters.uid;
      return updatedFilters;
    });

    setCurrentPage(1);
    fetchProducts(1);
  };

  const handleClearFbaFbmSearch = () => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters.fulfillmentChannel;
      return updatedFilters;
    });

    setCurrentPage(1);
  };
  const handleClearTagsSearch = () => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      tags: [],
    }));
    setSelectedTags([]);
    setSelectAllTags(false);
  };

  const handleClearChannelStockSearch = () => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters.stockCondition;
      return updatedFilters;
    });
    setChannelStockInputValue("");

    setCurrentPage(1);
  };
  const handleClearSalesSearch = () => {
    setFilters((prev) => {
      const updatedFilters = { ...prev };
      delete updatedFilters.salesCondition;
      return updatedFilters;
    });

    setInputValue("");
    setSaleBetweenMinValue("");
    setSaleBetweenMaxValue("");
    setCurrentPage(1);
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

  const handleProductSync = async () => {
    try {
      setIsSyncing(true);
      const response = await axios.get(`${BASE_URL}/api/sync`);
      const { success, message } = response.data;
      if (success) {
        // Swal.fire({
        //   title: "Success!",
        //   text: message,
        //   icon: "success",
        //   showConfirmButton: false,
        //   timer: 2000,
        // });
        fetchProducts(1);
      } else {
        // Swal.fire({
        //   title: "Error!",
        //   text: "Failed to sync products.",
        //   icon: "error",
        //   showConfirmButton: false,
        //   timer: 2000,
        // });
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Something went wrong!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleFilter = async () => {
    const newFilterScheduled = !filterScheduled;
    setFilterScheduled(newFilterScheduled);
    setFilters({
      fulfillmentChannel: null,
      stockCondition: null,
      salesCondition: null,
    });
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

        setSelectedProduct({
          ...responseOne.data.payload,
          tags: item.tags,
        });
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

  const handleFbaFbmSearch = (option) => {
    let channel = "";

    if (option === "FBA") {
      channel = "AMAZON_NA";
    } else if (option === "FBM") {
      channel = "DEFAULT";
    } else if (option === "All") {
      channel = null;
    }

    setFilters((prev) => ({
      ...prev,
      fulfillmentChannel: channel,
    }));

    setCustomFilterMode(true);
    setIsAllProductSearchMode(false);

    setCurrentPage(1);
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

  const handleListSalePopoverSubmit = (event) => {
    event.preventDefault();

    let salesCondition = {};

    if (selectedUnit.value === "between") {
      const minValue = Number(saleBetweenMinValue);
      const maxValue = Number(saleBetweenMaxValue);

      salesCondition = {
        time: selectedDay.value,
        condition: "between",
        value: [minValue, maxValue],
      };
    } else if (selectedUnit.value === ">=") {
      const salesValue = Number(inputValue);

      salesCondition = {
        time: selectedDay.value,
        condition: ">=",
        value: salesValue,
      };
    } else if (selectedUnit.value === "<=") {
      const salesValue = Number(inputValue);

      salesCondition = {
        time: selectedDay.value,
        condition: "<=",
        value: salesValue,
      };
    } else if (selectedUnit.value === "!=") {
      const salesValue = Number(inputValue);

      salesCondition = {
        time: selectedDay.value,
        condition: "!=",
        value: salesValue,
      };
    } else {
      const salesValue = Number(inputValue);

      salesCondition = {
        time: selectedDay.value,
        condition: selectedUnit.value,
        value: salesValue,
      };
    }

    setFilters((prev) => ({
      ...prev,
      salesCondition,
    }));

    setCustomFilterMode(true);
    setCurrentPage(1);
  };

  const handleChannelStockPopoverSubmit = (event) => {
    event.preventDefault();

    let stockCondition = {};

    if (selectedChannelStockUnit.value === "between") {
      const minValue = Number(ChannelStockBetweenMinValue);
      const maxValue = Number(ChannelStockBetweenMaxValue);

      stockCondition = {
        condition: "between",
        value: [minValue, maxValue],
      };
    } else if (selectedChannelStockUnit.value === ">=") {
      const stockValue = Number(channelStockInputValue);

      stockCondition = {
        condition: ">=",
        value: stockValue,
      };
    } else if (selectedChannelStockUnit.value === "<=") {
      const stockValue = Number(channelStockInputValue);

      stockCondition = {
        condition: "<=",
        value: stockValue,
      };
    } else if (selectedChannelStockUnit.value === "!=") {
      const stockValue = Number(channelStockInputValue);

      stockCondition = {
        condition: "!=",
        value: stockValue,
      };
    } else {
      const stockValue = Number(channelStockInputValue);

      stockCondition = {
        condition: selectedChannelStockUnit.value,
        value: stockValue,
      };
    }

    setFilters((prev) => ({
      ...prev,
      stockCondition,
    }));

    setCustomFilterMode(true);
    setCurrentPage(1);
  };

  if (isLoading) {
    return <ListLoadingSkeleton></ListLoadingSkeleton>;
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h3 className="text-red-400">Something went wrong</h3>
        <p>{error}</p>
      </div>
    );
  }

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
              placeholder="Search Title/ASIN/SKU/Title"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

        <div className=" absolute top-[10px] right-[650px]">
          <ActionsDropdown
            filteredProducts={filteredProducts}
            handleProductSync={handleProductSync}
          ></ActionsDropdown>
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

        {isSyncing && (
          <button
            className=" border-[0.5px] border-blue-500 px-3 py-1 text-blue-500"
            style={{
              position: "absolute",
              top: "10px",
              right: "410px",
            }}
          >
            <span style={{ fontSize: "14px" }}> Syncing...</span>
          </button>
        )}
      </div>

      {isFilterActive && (
        <div className="absolute top-4 right-[42%]">
          <button
            onClick={() => {
              setFilters({
                fulfillmentChannel: null,
                stockCondition: null,
                salesCondition: null,
                uid: null,
                tags: [],
              });
              setSelectedTags([]);
              setSelectAllTags(false);

              setSearchTerm("");
              setInputValue("");
              setChannelStockInputValue("");
              setSaleBetweenMinValue("");
              setSaleBetweenMaxValue("");
              setChannelStockBetweenMinValue("");
              setChannelStockBetweenMaxValue("");
              setCurrentPage(1);
              setCustomFilterMode(false);
              fetchProducts(1);
            }}
            className="  rounded-full  bg-gray-400 px-3 text-white py-1 flex justify-start gap-1"
          >
            <span className="text-sm"> Clear All</span>{" "}
            <span className="text-base hover:text-gray-800 transition-all duration-300">
              <IoClose className="" />
            </span>
          </button>
        </div>
      )}
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
                      Favourite
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
                      onMouseDown={(e) => handleResize(1, e)}
                    />
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: `${columnWidths[2]}px`,

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
                      onMouseDown={(e) => handleResize(2, e)}
                    />
                  </th>

                  <th
                    className="tableHeader"
                    style={{
                      width: `${columnWidths[3]}px`,
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
                      onMouseDown={(e) => handleResize(4, e)}
                    />
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: `${columnWidths[5]}px`,

                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex items-center justify-center gap-1">
                      {filters.fulfillmentChannel && (
                        <span>
                          <BsDashCircle
                            onClick={handleClearFbaFbmSearch}
                            className="cursor-pointer text-sm text-red-400"
                          />
                        </span>
                      )}
                      FBA/FBM
                      <ListFbaDropdown
                        selectedFbaFbmOption={filters.fulfillmentChannel}
                        onChannelChange={handleFbaFbmSearch}
                      />
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
                      onMouseDown={(e) => handleResize(5, e)}
                    />
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: `${columnWidths[6]}px`,

                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex items-center justify-center gap-1">
                      {filters?.tags?.length > 0 && (
                        <span>
                          <BsDashCircle
                            onClick={handleClearTagsSearch}
                            className="cursor-pointer text-sm text-red-400"
                          />
                        </span>
                      )}
                      Tags
                      <ListTagsDropdown
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        selectAllTags={selectAllTags}
                        setSelectAllTags={setSelectAllTags}
                        handleTagSelection={handleTagSelection}
                        // setSelectedTags={handleTagSelection}
                      ></ListTagsDropdown>
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
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  justify-center items-center gap-1">
                      {filters.stockCondition && (
                        <span>
                          <BsDashCircle
                            onClick={handleClearChannelStockSearch}
                            className="cursor-pointer text-sm text-red-400"
                          />
                        </span>
                      )}
                      Channel Stock
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
                        filters={filters}
                        ChannelStockBetweenMinValue={
                          ChannelStockBetweenMinValue
                        }
                        ChannelStockBetweenMaxValue={
                          ChannelStockBetweenMaxValue
                        }
                        setChannelStockBetweenMinValue={
                          setChannelStockBetweenMinValue
                        }
                        setChannelStockBetweenMaxValue={
                          setChannelStockBetweenMaxValue
                        }
                      ></ListChannelStockPopover>
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
                      onMouseDown={(e) => handleResize(7, e)}
                    />
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: `${columnWidths[8]}px`,
                      minWidth: "80px",
                      position: "relative",
                      textAlign: "center",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    <p className="flex  items-center justify-center gap-1">
                      {filters.salesCondition && (
                        <span>
                          <BsDashCircle
                            onClick={handleClearSalesSearch}
                            className="cursor-pointer text-sm text-red-400"
                          />
                        </span>
                      )}
                      Sale
                      <ListSalePopover
                        handleListSalePopoverSubmit={
                          handleListSalePopoverSubmit
                        }
                        filters={filters}
                        dayOptions={dayOptions}
                        unitOptions={unitOptions}
                        selectedDay={selectedDay}
                        setSelectedDay={setSelectedDay}
                        selectedUnit={selectedUnit}
                        setSelectedUnit={setSelectedUnit}
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        saleBetweenMinValue={saleBetweenMinValue}
                        setSaleBetweenMinValue={setSaleBetweenMinValue}
                        saleBetweenMaxValue={saleBetweenMaxValue}
                        setSaleBetweenMaxValue={setSaleBetweenMaxValue}
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
                      onMouseDown={(e) => handleResize(8, e)}
                    />
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: `${columnWidths[9]}px`,
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
                      onMouseDown={(e) => handleResize(9, e)}
                    />
                  </th>
                </tr>
              </thead>
              {isSearching ? (
                <tbody>
                  <tr>
                    <td
                      className="h-[83vh] text-base"
                      colSpan="8"
                      // style={{
                      //   display: "flex",
                      //   justifyContent: "center",
                      //   alignItems: "center",
                      //   border: "1px solid red",
                      //   width: "100%",
                      // }}

                      style={{
                        textAlign: "center",
                        padding: "20px",
                        border: "none",
                      }}
                    >
                      {/* <div className="spinner mt-[30vh]"></div> */}
                      {/* <Spinner animation="border" variant="primary" /> */}

                      <div className="mt-[30vh]">
                        <ClipLoader
                          color="#0E6FFD"
                          loading={true}
                          cssOverride={{
                            margin: "0 auto",
                            borderWidth: "3px",
                          }}
                          size={40}
                          // thickness={5}
                          width={100}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : filteredProducts?.listings?.length > 0 ? (
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
                        selectedDay={selectedDay}
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
                    No data to show
                  </td>
                </tr>
              )}
            </table>

            {!isSearching && filteredProducts?.listings?.length > 0 && (
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
                tags={selectedProduct?.tags}
                tagsUpdated={tagsUpdated}
                setTagsUpdated={setTagsUpdated}
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
