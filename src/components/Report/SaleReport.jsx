import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { DatePicker, Space, Switch } from "antd";
import { InputGroup, Form } from "react-bootstrap";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import "antd/dist/reset.css";

import { HiMagnifyingGlass } from "react-icons/hi2";
import { MdOutlineClose } from "react-icons/md";
import SaleReportLoadingSkeleton from "../LoadingSkeleton/SaleReportLoadingSkeleton";
import { ClipLoader } from "react-spinners";
import SaleReportChart from "./SaleReportChart";
import SaleReportPieChart from "./SalesReportPieChart/SaleReportPieChart";
import { RiArrowUpDownFill } from "react-icons/ri";
import { Card } from "../ui/card";
import SaleReportTableRow from "./SaleReportTable/SaleReportTableRow";
import SaleReportSelectedLineChart from "./SaleReportSelectedLineChart/SaleReportSelectedLineChart";
import SaleReportSelectedPieChart from "./SaleReportSelectedPieChart/SaleReportSelectedPieChart";
import CurrentPreviousIntervalUnitsPieChart from "./CurrentPreviousIntervalUnitsPieChart/CurrentPreviousIntervalUnitsPieChart";
import SaleDetailsModal from "./SaleDetailsModal";

import "./SaleReport.css";
import ReportChangeFilterPopover from "./ReportChangeFilterPopover/ReportChangeFilterPopover";
import { BsDashCircle } from "react-icons/bs";
import ReportCurrentIntervalUnitsFilter from "./ReportCurrentIntervalUnitsFilter/ReportCurrentIntervalUnitsFilter";
import ReportPreviousIntervalUnitsFilter from "./ReportPreviousIntervalUnitsFilter/ReportPreviousIntervalUnitsFilter";
import CurrentPreviousIntervalUnitsLineChart from "./CurrentPreviousIntervalUnitsLineChart/CurrentPreviousIntervalUnitsLineChart";

const { RangePicker } = DatePicker;
const BASE_URL = "http://192.168.0.26:3000";
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
const MONTH_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const COLORS = [
  "#E76E50",
  "#2A9D90",
  "#E8C468",
  "#F4A462",
  "#C1CFA1",
  "#EC7FA9",
  "#3ABEF9",
  "#2DAA9E",
  "#D84040",
  "#80CBC4",
  "#578FCA",
  "#C7C0A4", 
  "#615E22",
  "#A47E5B",
  "#5B6366",
  "#2382A9", 
  "#2F6B9A", 
  "#C86A27"



];


const SaleReport = () => {
  const [products, setProducts] = useState([]);
  const [colorMap, setColorMap] = useState({});

  const [searchTerm, setSearchTerm] = useState("");

  const [currentDateRange, setCurrentDateRange] = useState([
    dayjs().subtract(30, "day").startOf("day"),
    dayjs().subtract(1,"day").endOf("day"),
  ]);

  const [previousDateRange, setPreviousDateRange] = useState([
    dayjs().subtract(60, "day").startOf("day"),
    dayjs().subtract(31, "day").endOf("day"),
  ]);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [data, setData] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleMonths, setVisibleMonths] = useState({});
  const [saleDetailsModalShow, setSaleDetailsModalShow] = useState(false);
  const [sortOrder, setSortOrder] = useState(null);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [isAsinMode, setIsAsinMode] = useState(true);

  const [selectedValue, setSelectedValue] = useState(null);
  const [selectedChartData, setSelectedChartData] = useState([]);
  const [isDetailChartLoading, setIsDetailChartLoading] = useState(false);
  const [showDefaultCharts, setShowDefaultCharts] = useState(true);
  const [lastSelected, setLastSelected] = useState(null);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [reportChangeFilter, setReportChangeFilter] = useState({
    unit: "",
    value: "",
  });
  const [unitsFilter, setUnitsFilter] = useState({
    unit: "",
    value: "",
    minValue: "",
    maxValue: "",
  });
  const [previousUnitsFilter, setPreviousUnitsFilter] = useState({
    unit: "",
    value: "",
    minValue: "",
    maxValue: "",
  });

  const [filteredProducts, setFilteredProducts] = useState([]);

  const initialFetchDoneRef = useRef(false);


  const unitOptions = [
    { value: "between", label: "Between" },
    { value: "!=", label: "Does not equal" },
    { value: ">", label: "Greater than" },
    { value: ">=", label: "Greater than or equal to" },
    { value: "<", label: "Less than" },
    { value: "<=", label: "Less than or equal to" },
    { value: "==", label: "Equals" },
  ];

  useEffect(() => {
    if (initialLoading) {
      fetchProducts(true);
    }
  }, [initialLoading]);

  useEffect(() => {
    if (!initialLoading) {
      if (searchTerm) {
        fetchSearchResults(searchTerm, isAsinMode);
      } else {
        fetchProducts(false, isAsinMode, true);
      }
    }
  }, [page, currentDateRange, previousDateRange]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/total-sales`)
      .then((response) => {
     

        setData(response.data.payload);
        setChartLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching sales data:", error);
        setError(error);
        setChartLoading(false);
      });
  }, []);

  const applyPreviousUnitsFilter = (items) => {
    const { unit, value, minValue, maxValue } = previousUnitsFilter;
    if (!unit) return items;

    return items.filter((item) => {
      const units = parseFloat(item.previousUnits ?? 0);
      const numVal = Number(value);
      const min = Number(minValue);
      const max = Number(maxValue);

      switch (unit) {
        case "==":
          return units === numVal;
        case "!=":
          return units !== numVal;
        case ">":
          return units > numVal;
        case ">=":
          return units >= numVal;
        case "<":
          return units < numVal;
        case "<=":
          return units <= numVal;
        case "between":
          if (isNaN(min) || isNaN(max)) return true;
          return units >= min && units <= max;
        default:
          return true;
      }
    });
  };

  const applyChangeFilter = (items) => {
    const { unit, value, minValue, maxValue } = reportChangeFilter;

    if (!unit) return items;

    return items.filter((item) => {
      const pct = parseFloat(item.percentageChange ?? 0);
      const numVal = Number(value);
      const min = Number(minValue);
      const max = Number(maxValue);

      switch (unit) {
        case "==":
          return pct === numVal;
        case "!=":
          return pct !== numVal;
        case ">":
          return pct > numVal;
        case ">=":
          return pct >= numVal;
        case "<":
          return pct < numVal;
        case "<=":
          return pct <= numVal;
        case "between":
          if (isNaN(min) || isNaN(max)) return true;
          return pct >= min && pct <= max;
        default:
          return true;
      }
    });
  };

  const applyUnitsFilter = (items) => {
    const { unit, value, minValue, maxValue } = unitsFilter;
    if (!unit) return items;

    return items.filter((item) => {
      const units = parseFloat(item.currentUnits ?? 0);
      const numVal = Number(value);
      const min = Number(minValue);
      const max = Number(maxValue);

      switch (unit) {
        case "==":
          return units === numVal;
        case "!=":
          return units !== numVal;
        case ">":
          return units > numVal;
        case ">=":
          return units >= numVal;
        case "<":
          return units < numVal;
        case "<=":
          return units <= numVal;
        case "between":
          if (isNaN(min) || isNaN(max)) return true;
          return units >= min && units <= max;
        default:
          return true;
      }
    });
  };
  const handlePreviousUnitsFilterSubmit = () => {
    if (
      !previousUnitsFilter.unit ||
      (previousUnitsFilter.unit !== "between" &&
        previousUnitsFilter.value === "") ||
      (previousUnitsFilter.unit === "between" &&
        (previousUnitsFilter.minValue === "" ||
          previousUnitsFilter.maxValue === ""))
    ) {
      setFilteredProducts([]);
      return;
    }
    let source = sortOrder ? sortedProducts : products;
    source = applyChangeFilter(source);
    source = applyUnitsFilter(source);
    const result = applyPreviousUnitsFilter(source);
    setFilteredProducts(result);
  };

  const isPreviousUnitsFilterActive =
    !!previousUnitsFilter.unit &&
    ((previousUnitsFilter.unit === "between" &&
      previousUnitsFilter.minValue !== "" &&
      previousUnitsFilter.maxValue !== "") ||
      (previousUnitsFilter.unit !== "between" &&
        previousUnitsFilter.value !== ""));

  const handleClearPreviousUnitsFilter = () => {
    setPreviousUnitsFilter({ unit: "", value: "", minValue: "", maxValue: "" });
    setFilteredProducts([]);
  };

  const handleChangeFilterSubmit = () => {
    if (
      !reportChangeFilter.unit ||
      (reportChangeFilter.unit !== "between" &&
        reportChangeFilter.value === "") ||
      (reportChangeFilter.unit === "between" &&
        (reportChangeFilter.minValue === "" ||
          reportChangeFilter.maxValue === ""))
    ) {
      setFilteredProducts([]);
      return;
    }
    const source = sortOrder ? sortedProducts : products;
    const result = applyChangeFilter(source);
    setFilteredProducts(result);
  };

  const fetchSearchResults = async (query, mode = isAsinMode) => {
    setLoading(true);

    const startDate = currentDateRange[0]?.format("YYYY-MM-DD");
    const endDate = currentDateRange[1]?.format("YYYY-MM-DD");
    const prevStartDate = previousDateRange[0]?.format("YYYY-MM-DD");
    const prevEndDate = previousDateRange[1]?.format("YYYY-MM-DD");

    const endpoint = mode
      ? `${BASE_URL}/api/favourite/find/${query}?startDate=${startDate}&endDate=${endDate}&prevStartDate=${prevStartDate}&prevEndDate=${prevEndDate}`
      : `${BASE_URL}/api/favourite/search/${query}?startDate=${startDate}&endDate=${endDate}&prevStartDate=${prevStartDate}&prevEndDate=${prevEndDate}`;

    try {
      const response = await axios.get(endpoint);
      setProducts(response.data.data.listings);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error("Search API Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async (
    isInitialLoad = false,
    mode = isAsinMode,
    isDateChange = false
  ) => {
    if (isInitialLoad && initialFetchDoneRef.current) return;

    if (isInitialLoad) {
      initialFetchDoneRef.current = true;
    } else {
      setLoading(true);
    }

    const startDate = dayjs(currentDateRange[0]).format("YYYY-MM-DD");
    const endDate = dayjs(currentDateRange[1]).format("YYYY-MM-DD");
    const prevStartDate = dayjs(previousDateRange[0]).format("YYYY-MM-DD");
    const prevEndDate = dayjs(previousDateRange[1]).format("YYYY-MM-DD");

    const endpoint = isDateChange
      ? mode
        ? `${BASE_URL}/api/favourite/report/byasins`
        : `${BASE_URL}/api/favourite/report/skus`
      : mode
      ? `${BASE_URL}/api/favourite/report/asin-mode`
      : `${BASE_URL}/api/favourite/report/sku-mode`;

    const params = { startDate, endDate, prevStartDate, prevEndDate };

    try {
      const response = await axios.get(endpoint, { params });
      setProducts(response.data.data.listings);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      if (!isInitialLoad) {
        setLoading(false);
      } else {
        setInitialLoading(false);
      }
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
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSortOrder(null);
    setSortedProducts([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchSearchResults(searchTerm);
      setSortOrder(null);
      setSortedProducts([]);
    }
  };

  const handleSearchButtonClick = () => {
    fetchSearchResults(searchTerm);
    setSortOrder(null);
    setSortedProducts([]);
  };

  const handleClearFilter = () => {
    setReportChangeFilter({ unit: "", value: "", minValue: "", maxValue: "" });
    setFilteredProducts([]);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setPage(1);
    setSortOrder(null);
    setSortedProducts([]);
    setLoading(true);
    fetchProducts(false);
  };

  const handleSaleDetailsModalShow = () => {
    setSaleDetailsModalShow(true);
  };
  const handleSaleDetailsModalClose = () => {
    setSaleDetailsModalShow(false);
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
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
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

  const sortProducts = (order) => {
    setSortOrder(order);

    const baseList = isFilterActive ? filteredProducts : products;

    const sorted = [...baseList].sort((a, b) => {
      const valA = parseFloat(a.percentageChange ?? 0);
      const valB = parseFloat(b.percentageChange ?? 0);
      return order === "asc" ? valA - valB : valB - valA;
    });

    setSortedProducts(sorted);

    if (isFilterActive) {
      setFilteredProducts(sorted);
    }
  };

  const handleUnitsFilterSubmit = () => {
    if (
      !unitsFilter.unit ||
      (unitsFilter.unit !== "between" && unitsFilter.value === "") ||
      (unitsFilter.unit === "between" &&
        (unitsFilter.minValue === "" || unitsFilter.maxValue === ""))
    ) {
      setFilteredProducts([]);
      return;
    }
    let source = sortOrder ? sortedProducts : products;
    source = applyChangeFilter(source);
    const result = applyUnitsFilter(source);
    setFilteredProducts(result);
  };
  const isUnitsFilterActive =
    !!unitsFilter.unit &&
    ((unitsFilter.unit === "between" &&
      unitsFilter.minValue !== "" &&
      unitsFilter.maxValue !== "") ||
      (unitsFilter.unit !== "between" && unitsFilter.value !== ""));

  const handleClearUnitsFilter = () => {
    setUnitsFilter({ unit: "", value: "", minValue: "", maxValue: "" });
    setFilteredProducts([]);
  };

  const toggleFavorite = async (sku, currentFavoriteStatus, index) => {
    try {
      await axios.put(`${BASE_URL}/api/favourite/${sku}`, {
        isFavourite: !currentFavoriteStatus,
      });

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

  const handleRowClick = async (product) => {
    const value = isAsinMode ? product.asin1 : product.sellerSku;
    const type = isAsinMode ? "asin" : "sku";

    const endDate = dayjs().format("YYYY-MM-DD");
    // const startDate = dayjs()
    //   .subtract(18, "month")
    //   .startOf("day")
    //   .format("YYYY-MM-DD");

  const startDate =   dayjs().subtract(17, "month").startOf("month").format("YYYY-MM-DD");


    const url = `${BASE_URL}/api/favourite/sale-units?type=${type}&value=${value}&startDate=${startDate}&endDate=${endDate}`;
  

    setIsDetailChartLoading(true);
    setSelectedValue(value);
    setLastSelected(value);
    setShowDefaultCharts(false);
    setSelectedProductDetails(product);

    try {
      const response = await axios.get(url);
      setSelectedChartData(response.data.data.entries || []);
    } catch (error) {
      console.error("Error fetching selected chart data", error);
      setSelectedChartData([]);
    } finally {
      setIsDetailChartLoading(false);
    }
  };



  // const handleShowAllToggle = async (checked) => {
  //   setShowDefaultCharts(checked);

  //   if (!checked && lastSelected) {
  //     setSelectedValue(lastSelected);

  //     const type = isAsinMode ? "asin" : "sku";
  //     const endDate = dayjs().format("YYYY-MM-DD");
  //     const startDate = dayjs()
  //       .subtract(6, "month")
  //       .startOf("day")
  //       .format("YYYY-MM-DD");

  //     const url = `${BASE_URL}/api/favourite/sale-units?type=${type}&value=${lastSelected}&startDate=${startDate}&endDate=${endDate}`;
  //     setIsDetailChartLoading(true);
  //     try {
  //       const response = await axios.get(url);
  //       setSelectedChartData(response.data.data.entries || []);
  //     } catch (error) {
  //       console.error("Error re-fetching selected chart data", error);
  //       setSelectedChartData([]);
  //     } finally {
  //       setIsDetailChartLoading(false);
  //     }
  //   } else {
  //     setSelectedValue(null);
  //     setSelectedChartData([]);
  //   }
  // };

  const handleShowAllToggle = async (checked) => {
    setShowDefaultCharts(checked);
  
    if (!checked && lastSelected) {
      setSelectedValue(lastSelected);
  
      const type = isAsinMode ? "asin" : "sku";
      const endDate = dayjs().format("YYYY-MM-DD");
      const startDate = dayjs()
        .subtract(17, "month")
        .startOf("day")
        .format("YYYY-MM-DD");
  
      const url = `${BASE_URL}/api/favourite/sale-units?type=${type}&value=${lastSelected}&startDate=${startDate}&endDate=${endDate}`;
      setIsDetailChartLoading(true);
      try {
        const response = await axios.get(url);
        const entries = response.data.data.entries || [];
        setSelectedChartData(entries);
  
        // 🆕 Refresh visibleMonths when entering selected mode
        const monthsSet = new Set();
        entries.forEach((entry) => {
          const startDate = new Date(entry.interval.split("--")[0]);
          const month = startDate.toLocaleString("en-US", { month: "short" });
          const year = startDate.getFullYear();
          monthsSet.add(`${month} ${year}`);
        });
  
        const sortedMonths = [...monthsSet].sort((a, b) => {
          const [monthA, yearA] = a.split(" ");
          const [monthB, yearB] = b.split(" ");
          if (yearA !== yearB) return yearA - yearB;
          return MONTH_ORDER.indexOf(monthA) - MONTH_ORDER.indexOf(monthB);
        });
  
        setVisibleMonths((prev) =>
          sortedMonths.reduce(
            (acc, month) => ({
              ...acc,
              [month]: prev[month] ?? false, // retain existing checked state
            }),
            {}
          )
        );
        
      } catch (error) {
        console.error("Error re-fetching selected chart data", error);
        setSelectedChartData([]);
      } finally {
        setIsDetailChartLoading(false);
      }
    } else {
      // back to default view
      setSelectedValue(null);
      setSelectedChartData([]);
    }
  };
  

  const rangePresets = [
    {
      label: "Today",
      value: [dayjs().startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "Last 7 Days",
      value: [dayjs().subtract(7, "day").startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "This Week",
      value: [dayjs().startOf("week"), dayjs().endOf("week")],
    },
    {
      label: "Last Week",
      value: [
        dayjs().subtract(1, "week").startOf("week"),
        dayjs().subtract(1, "week").endOf("week"),
      ],
    },
    {
      label: "Last 30 Days",
      value: [dayjs().subtract(30, "day").startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "Last 90 Days",
      value: [dayjs().subtract(90, "day").startOf("day"), dayjs().endOf("day")],
    },
    {
      label: "This Month",
      value: [dayjs().startOf("month"), dayjs().endOf("month")],
    },
    {
      label: "Last Month",
      value: [
        dayjs().subtract(1, "month").startOf("month"),
        dayjs().subtract(1, "month").endOf("month"),
      ],
    },
    {
      label: "Last 6 Months",
      value: [
        dayjs().subtract(6, "month").startOf("month"),
        dayjs().endOf("month"),
      ],
    },
    {
      label: "Year to Date",
      value: [dayjs().startOf("year"), dayjs().endOf("day")],
    },
  ];

  // const { uniqueMonths } = useMemo(() => {
  //   if (data.length === 0) return { uniqueMonths: [] };

  //   const today = new Date();
  //   const currentYear = today.getFullYear();
  //   const currentMonthIndex = today.getMonth();

  //   const lastTwoMonths = [];
  //   for (let i = 2; i > 0; i--) {
  //     let monthIndex = (currentMonthIndex - i + 12) % 12;
  //     let year = currentYear;
  //     if (monthIndex > currentMonthIndex) {
  //       year -= 1;
  //     }
  //     lastTwoMonths.push(`${MONTH_ORDER[monthIndex]} ${year}`);
  //   }

  //   const monthsSet = new Set();
  //   data.forEach((entry) => {
  //     const startDate = new Date(entry.interval.split("--")[0]);
  //     const month = startDate.toLocaleString("en-US", { month: "short" });
  //     const year = startDate.getFullYear();
  //     monthsSet.add(`${month} ${year}`);
  //   });

  //   const sortedMonths = [...monthsSet].sort((a, b) => {
  //     const [monthA, yearA] = a.split(" ");
  //     const [monthB, yearB] = b.split(" ");
  //     if (yearA !== yearB) return yearA - yearB;
  //     return MONTH_ORDER.indexOf(monthA) - MONTH_ORDER.indexOf(monthB);
  //   });

  //   setColorMap(() => {
  //     const newColorMap = {};
  //     sortedMonths.forEach((month, index) => {
  //       newColorMap[month] = COLORS[index % COLORS.length];
  //     });
  //     return newColorMap;
  //   });

  //   setVisibleMonths((prev) => {
  //     if (Object.keys(prev).length === 0) {
  //       return sortedMonths.reduce(
  //         (acc, month) => ({ ...acc, [month]: lastTwoMonths.includes(month) }),
  //         {}
  //       );
  //     }
  //     return prev;
  //   });

  //   return { uniqueMonths: sortedMonths };
  // }, [data]);

  const { uniqueMonths } = useMemo(() => {
    const monthSource = selectedChartData.length ? selectedChartData : data;
    if (monthSource.length === 0) return { uniqueMonths: [] };

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonthIndex = today.getMonth();

    const lastTwoMonths = [];
    for (let i = 2; i > 0; i--) {
      let monthIndex = (currentMonthIndex - i + 12) % 12;
      let year = currentYear;
      if (monthIndex > currentMonthIndex) {
        year -= 1;
      }
      lastTwoMonths.push(`${MONTH_ORDER[monthIndex]} ${year}`);
    }

    const monthsSet = new Set();
    monthSource.forEach((entry) => {
      const startDate = new Date(entry.interval.split("--")[0]);
      const month = startDate.toLocaleString("en-US", { month: "short" });
      const year = startDate.getFullYear();
      monthsSet.add(`${month} ${year}`);
    });

    const sortedMonths = [...monthsSet].sort((a, b) => {
      const [monthA, yearA] = a.split(" ");
      const [monthB, yearB] = b.split(" ");
      if (yearA !== yearB) return yearA - yearB;
      return MONTH_ORDER.indexOf(monthA) - MONTH_ORDER.indexOf(monthB);
    });

    setColorMap(() => {
      const newColorMap = {};
      sortedMonths.forEach((month, index) => {
        newColorMap[month] = COLORS[index % COLORS.length];
      });
      return newColorMap;
    });

    setVisibleMonths((prev) => {
      // only initialize once (keep user toggles)
      if (Object.keys(prev).length === 0) {
        return sortedMonths.reduce(
          (acc, month) => ({
            ...acc,
            [month]: lastTwoMonths.includes(month),
          }),
          {}
        );
      }
      return prev;
    });

    return { uniqueMonths: sortedMonths };
  }, [data, selectedChartData]);

  const selectedProduct = (sortOrder ? sortedProducts : products).find(
    (product) =>
      isAsinMode
        ? product.asin1 === selectedValue
        : product.sellerSku === selectedValue
  );

  const ROW_HEIGHT = 100;
  const BUFFER_ROWS = 5;
  const containerHeight = 820;

  const handleScroll = (e) => setScrollTop(e.target.scrollTop);

  const isFilterActive =
    !!reportChangeFilter.unit &&
    ((reportChangeFilter.unit === "between" &&
      reportChangeFilter.minValue !== "" &&
      reportChangeFilter.maxValue !== "") ||
      (reportChangeFilter.unit !== "between" &&
        reportChangeFilter.value !== ""));

  const activeProducts =
    isFilterActive || isUnitsFilterActive || isPreviousUnitsFilterActive
      ? applyPreviousUnitsFilter(
          applyUnitsFilter(
            applyChangeFilter(sortOrder ? sortedProducts : products)
          )
        )
      : sortOrder
      ? sortedProducts
      : products;

  const visibleStartIndex = Math.max(
    0,
    Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS
  );
  const visibleEndIndex = Math.min(
    activeProducts.length,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + BUFFER_ROWS
  );

  const visibleProducts = activeProducts.slice(
    visibleStartIndex,
    visibleEndIndex
  );


  const currentIntervalMetrics = selectedChartData.filter((entry) => {
    const [start] = entry.interval.split("--");
    const startDate = dayjs(start).startOf("day");
    return (
      startDate.isSameOrAfter(dayjs(currentDateRange[0])) &&
      startDate.isSameOrBefore(dayjs(currentDateRange[1]))
    );
  });

  const previousIntervalMetrics = selectedChartData.filter((entry) => {
    const [start] = entry.interval.split("--");
    const startDate = dayjs(start).startOf("day");
    return (
      startDate.isSameOrAfter(dayjs(previousDateRange[0])) &&
      startDate.isSameOrBefore(dayjs(previousDateRange[1]))
    );
  });

  return (
    <div className=" mt-5">
      <div className=" absolute top-[11px]">
        <div className=" flex justify-start items-center  gap-3">
          <InputGroup className=" z-0">
            <Form.Control
              type="text"
              placeholder="Search by Product Name, Asin or SKU..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              style={{ borderRadius: "0px", width: "300px" }}
              className="custom-input"
            />
            {searchTerm && (
              <button
                onClick={handleClearInput}
                className="absolute right-12 top-1  p-1 z-10 text-xl rounded transition duration-500 text-black"
              >
                <MdOutlineClose />
              </button>
            )}
            <button
              className="px-3 py-2 bg-gray-300"
              onClick={handleSearchButtonClick}
            >
              <HiMagnifyingGlass />
            </button>
          </InputGroup>
          <div className="flex flex-col items-center">
            <Switch
              checkedChildren="Asin Mode"
              unCheckedChildren="SKU Mode"
              checked={isAsinMode}
              style={{ width: 100 }}
              onChange={(checked) => {
                setIsAsinMode(checked);
                setLoading(true);
                setPage(1);
                setSelectedChartData([]);
                setSelectedValue(null);
                if (searchTerm) {
                  fetchSearchResults(searchTerm, checked);
                } else {
                  fetchProducts(false, checked);
                }
              }}
            />
          </div>
        </div>
      </div>
      <div className="absolute top-[15px] right-[29%] ">
        <Switch
          checkedChildren="Show Previous"
          unCheckedChildren="Show All"
          checked={!showDefaultCharts}
          style={{ width: 120 }}
          onChange={(checked) => handleShowAllToggle(!checked)}
        />
      </div>

      <section className="flex gap-3">
        {/* sale report table part */}
        <section className="w-[64%]">
          <div
            className="sale-report-table-scroll"
            onScroll={handleScroll}
            style={{
              // maxHeight: "91vh",
              maxHeight: `${containerHeight}px`,
              overflowY: "auto",

              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            {initialLoading ? (
              <SaleReportLoadingSkeleton></SaleReportLoadingSkeleton>
            ) : (
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
                        position: "sticky",
                        width: "65px",
                        textAlign: "center",
                        verticalAlign: "middle",
                        borderRight: "2px solid #C3C6D4",
                        zIndex: 3,
                      }}
                    >
                      Favorite
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        position: "sticky",
                        width: "70px",
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
                        position: "sticky",
                        textAlign: "center",
                        width: "320px",
                        verticalAlign: "middle",
                        borderRight: "2px solid #C3C6D4",
                        zIndex: 3,
                      }}
                    >
                      Title
                    </th>
                    <th
                      className="tableHeader"
                      style={{
                        position: "sticky",
                        textAlign: "center",
                        verticalAlign: "middle",
                        borderRight: "2px solid #C3C6D4",
                        width: "225px",
                      }}
                    >
                      <div className="flex justify-center items-center gap-1">
                        {isUnitsFilterActive && (
                          <BsDashCircle
                            onClick={handleClearUnitsFilter}
                            className="cursor-pointer text-sm text-red-400"
                          />
                        )}
                        <ReportCurrentIntervalUnitsFilter
                          unitOptions={unitOptions}
                          unitsFilter={unitsFilter}
                          setUnitsFilter={setUnitsFilter}
                          onSubmitUnitsFilter={handleUnitsFilterSubmit}
                        />
                        Current Interval Units
                      </div>
                      <div>
                        <Space direction="vertical" size={12}>
                          <RangePicker
                            presets={rangePresets}
                            value={
                              currentDateRange.length === 2
                                ? currentDateRange
                                : null
                            }
                            style={{ minWidth: 150 }}
                            onChange={(dates) => {
                              if (dates && dates.length === 2) {
                                setCurrentDateRange([dates[0], dates[1]]);
                              } else {
                                setCurrentDateRange([
                                  dayjs().subtract(30, "day").startOf("day"),
                                  dayjs().endOf("day"),
                                ]);
                              }
                            }}
                            format="DD MMM, YY"
                          />
                        </Space>
                      </div>
                    </th>

                    <th
                      className="tableHeader"
                      style={{
                        position: "sticky",
                        textAlign: "center",
                        verticalAlign: "middle",
                        borderRight: "2px solid #C3C6D4",
                        width: "225px",
                      }}
                    >
                      <div className="flex justify-center items-center gap-1">
                        {isPreviousUnitsFilterActive && (
                          <BsDashCircle
                            onClick={handleClearPreviousUnitsFilter}
                            className="cursor-pointer text-sm text-red-400"
                          />
                        )}
                        <ReportPreviousIntervalUnitsFilter
                          unitOptions={unitOptions}
                          unitsFilter={previousUnitsFilter}
                          setUnitsFilter={setPreviousUnitsFilter}
                          onSubmitUnitsFilter={handlePreviousUnitsFilterSubmit}
                        />
                        Previous Interval Units
                      </div>
                      <div>
                        <Space direction="vertical" size={12}>
                          <RangePicker
                            presets={rangePresets}
                            value={
                              previousDateRange.length === 2
                                ? previousDateRange
                                : null
                            }
                            style={{ minWidth: 150 }}
                            onChange={(dates) => {
                              if (dates && dates.length === 2) {
                                setPreviousDateRange([dates[0], dates[1]]);
                              } else {
                                setPreviousDateRange([
                                  dayjs().subtract(60, "day").startOf("day"),
                                  dayjs().subtract(30, "day").endOf("day"),
                                ]);
                              }
                            }}
                            format="DD MMM, YY"
                          />
                        </Space>
                      </div>
                    </th>

                    <th
                      className="tableHeader"
                      style={{
                        position: "sticky",
                        textAlign: "center",
                        verticalAlign: "middle",
                        width: "140px",
                      }}
                    >
                      <p className="flex justify-center items-center gap-1 ">
                        {isFilterActive && (
                          <BsDashCircle
                            onClick={handleClearFilter}
                            className="cursor-pointer text-sm text-red-400"
                          />
                        )}
                        <ReportChangeFilterPopover
                          unitOptions={unitOptions}
                          reportChangeFilter={reportChangeFilter}
                          setReportChangeFilter={setReportChangeFilter}
                          onSubmitFilter={handleChangeFilterSubmit}
                        />
                        Change (%)
                        <button
                          onClick={() => {
                            setSortOrder((prev) => {
                              const newOrder = prev === "asc" ? "desc" : "asc";
                              sortProducts(newOrder);
                              return newOrder;
                            });
                          }}
                        >
                          <RiArrowUpDownFill className="text-sm" />
                        </button>
                      </p>
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
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="h-[90vh] text-center text-base"
                      >
                        <div className="mt-[30vh]">
                          <ClipLoader
                            color="#0E6FFD"
                            loading={true}
                            size={40}
                          />
                        </div>
                      </td>
                    </tr>
                  ) : visibleProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center py-10 text-gray-500 text-sm"
                      >
                        No products found matching the filter.
                      </td>
                    </tr>
                  ) : (
                    <>
                      <tr
                        style={{
                          height: `${visibleStartIndex * ROW_HEIGHT}px`,
                        }}
                      />
                      {visibleProducts.map((product, index) => (
                        <SaleReportTableRow
                          key={product.sellerSku}
                          product={product}
                          toggleFavorite={toggleFavorite}
                          index={visibleStartIndex + index}
                          handleCopy={handleCopy}
                          copiedAsinIndex={copiedAsinIndex}
                          copiedSkuIndex={copiedSkuIndex}
                          currentUnits={product.currentUnits ?? 0}
                          previousUnits={product.previousUnits ?? 0}
                          percentageChange={product.percentageChange ?? 0}
                          handleSaleDetailsModalShow={
                            handleSaleDetailsModalShow
                          }
                          handleRowClick={handleRowClick}
                          selectedValue={selectedValue}
                          isAsinMode={isAsinMode}
                        />
                      ))}
                      <tr
                        style={{
                          height: `${
                            (activeProducts.length - visibleEndIndex) *
                            ROW_HEIGHT
                          }px`,
                        }}
                      />
                    </>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>

        <Card className="w-[40%] h-[90vh] overflow-y-auto  p-2">
          {showDefaultCharts || !selectedValue ? (
            <>
              <SaleReportPieChart
                data={data}
                visibleMonths={visibleMonths}
                chartLoading={chartLoading}
                colorMap={colorMap}
                error={error}
              />
            </>
          ) : (
            <>
              <button
                onClick={() => handleSaleDetailsModalShow()}
                className="bg-[#0662BB] text-white text-sm rounded drop-shadow-sm  gap-1  px-2 py-1 mb-1"
              >
                See Details
              </button>

              <CurrentPreviousIntervalUnitsLineChart
                currentMetrics={currentIntervalMetrics}
                previousMetrics={previousIntervalMetrics}
              ></CurrentPreviousIntervalUnitsLineChart>
              <div className="grid grid-cols-2 gap-1">
                <CurrentPreviousIntervalUnitsPieChart
                  currentUnits={selectedProduct?.currentUnits ?? 0}
                  previousUnits={selectedProduct?.previousUnits ?? 0}
                />
                <SaleReportSelectedPieChart
                  entries={selectedChartData}
                  visibleMonths={visibleMonths}
                  loading={isDetailChartLoading}
                  error={error}
                  colorMap={colorMap}
                />
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-x-2 justify-center gap-y-2 my-3">
            {[...uniqueMonths].reverse().map((month) => {
              const isChecked = visibleMonths[month] ?? false;
              const color = colorMap[month] ?? "black";

              return (
                <label key={month} className="flex items-center space-x-1 cursor-pointer">
                <span
                 className={`relative w-[14px] h-[14px] inline-block  rounded-[1px] ${
                  isChecked ? '' : 'border border-black'
                }`}
                  style={{ backgroundColor: isChecked ? color : "white" }}
                >
                  {isChecked && (
                    <svg
                      className="absolute inset-0   text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={3}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      setVisibleMonths((prev) => ({
                        ...prev,
                        [month]: !prev[month],
                      }))
                    }
                    className="absolute w-[14px] h-[14px] opacity-0 cursor-pointer"
                  />
                </span>
                <span style={{ color: isChecked ? color : "black" }}>{month}</span>
              </label>
              
              );
            })}

            

            
          </div>

          {showDefaultCharts || !selectedValue ? (
            <SaleReportChart
              data={data}
              setData={setData}
              chartLoading={chartLoading}
              setChartLoading={setChartLoading}
              visibleMonths={visibleMonths}
              error={error}
              setError={setError}
              colorMap={colorMap}
            />
          ) : (
            <SaleReportSelectedLineChart
              entries={selectedChartData}
              loading={isDetailChartLoading}
              visibleMonths={visibleMonths}
              colorMap={colorMap}
            />
          )}
        </Card>
      </section>

      <SaleDetailsModal
        saleDetailsModalShow={saleDetailsModalShow}
        setSaleDetailsModalShow={setSaleDetailsModalShow}
        handleSaleDetailsModalShow={handleSaleDetailsModalShow}
        handleSaleDetailsModalClose={handleSaleDetailsModalClose}
        sku={selectedProductDetails?.sellerSku}
      ></SaleDetailsModal>
    </div>
  );
}; 

export default SaleReport;


