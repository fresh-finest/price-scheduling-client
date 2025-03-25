import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { FaRegStar } from "react-icons/fa";
import { FaStar } from "react-icons/fa";
import { DatePicker, Space, Switch } from "antd";
import { InputGroup, Form } from "react-bootstrap";
import { FaArrowUp } from "react-icons/fa";
import { FaArrowDownLong } from "react-icons/fa6";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import SaleReportPagination from "./SaleReportPagination";

import { HiMagnifyingGlass } from "react-icons/hi2";
import { MdCheck, MdOutlineClose } from "react-icons/md";
import SaleReportLoadingSkeleton from "../LoadingSkeleton/SaleReportLoadingSkeleton";
import { ClipLoader } from "react-spinners";
import SaleReportChart from "./SaleReportChart";
import SaleReportPieChart from "./SaleReportPieChart/SaleReportPieChart";
import { BsClipboardCheck } from "react-icons/bs";
import SaleDetailsModal from "./SaleDetailsModal";
import { RiArrowUpDownFill } from "react-icons/ri";
import { Card } from "../ui/card";

const { RangePicker } = DatePicker;
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://api.priceobo.com";
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
];

const SaleReport = () => {
  const [products, setProducts] = useState([]);
  const [colorMap, setColorMap] = useState({});

  const [searchTerm, setSearchTerm] = useState("");

  const [currentDateRange, setCurrentDateRange] = useState([
    dayjs().subtract(30, "day").startOf("day"),
    dayjs().endOf("day"),
  ]);

  const [previousDateRange, setPreviousDateRange] = useState([
    dayjs().subtract(60, "day").startOf("day"),
    dayjs().subtract(30, "day").endOf("day"),
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
  const [selectedSku, setSelectedSku] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [sortedProducts, setSortedProducts] = useState([]);
  const [isAsinMode, setIsAsinMode] = useState(true);

  useEffect(() => {
    fetchProducts(true);
  }, []);

  // useEffect(() => {
  //   if (!initialLoading) {
  //     fetchProducts(false);
  //   }
  // }, [page, currentDateRange, previousDateRange]);

  useEffect(() => {
    if (!initialLoading) {
      if (searchTerm) {
        fetchSearchResults(searchTerm); // Keep the search filter active
      } else {
        fetchProducts(false); // Otherwise, fetch all products
      }
    }
  }, [page, currentDateRange, previousDateRange]);

  // useEffect(() => {
  //   if (!searchTerm) {
  //     fetchProducts(true);
  //   } else {
  //     fetchSearchResults(searchTerm);
  //   }
  // }, [searchTerm, page]);

  useEffect(() => {
    if (!searchTerm) {
      fetchProducts(true);
    }
  }, [page]);

  useEffect(() => {
    axios
      // .get("/salesReportChartData.json")
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

  // const fetchSearchResults = async (query) => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `${BASE_URL}/api/favourite/find/${query}`
  //     );
  //     setProducts(response.data.data.listings);
  //     setTotalPages(response.data.data.totalPages || 1);
  //   } catch (error) {
  //     console.error("Search API Error:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchSearchResults = async (query, mode = isAsinMode) => {
    setLoading(true);

    const endpoint = mode
      ? `${BASE_URL}/api/favourite/find/${query}`
      : `${BASE_URL}/api/favourite/search/${query}`;

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

  // const fetchProducts = async (isInitialLoad) => {
  //   if (!isInitialLoad) {
  //     setLoading(true);
  //   }

  //   try {
  //     const response = await axios.get(
  //       `${BASE_URL}/api/favourite/report/asins`,
  //       {
  //         params: { page, limit: 20 },
  //       }
  //     );

  //     setProducts(response.data.data.listings);
  //     setTotalPages(response.data.data.totalPages || 1);
  //   } catch (error) {
  //     console.error("Error fetching products:", error);
  //   } finally {
  //     if (!isInitialLoad) {
  //       setLoading(false);
  //     } else {
  //       setInitialLoading(false);
  //     }
  //   }
  // };

  const fetchProducts = async (isInitialLoad, mode = isAsinMode) => {
    if (!isInitialLoad) setLoading(true);

    const endpoint = mode
      ? `${BASE_URL}/api/favourite/report/asins`
      : `${BASE_URL}/api/favourite/report`;

    try {
      const response = await axios.get(endpoint, {
        params: { page, limit: 20 },
      });

      setProducts(response.data.data.listings);
      setTotalPages(response.data.data.totalPages || 1);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      if (!isInitialLoad) setLoading(false);
      else setInitialLoading(false);
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
    setSortOrder(null); // Reset sorting state
    setSortedProducts([]); // Clear sorted products
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      fetchSearchResults(searchTerm);
      setSortOrder(null); // Reset sorting state
      setSortedProducts([]); // Clear sorted products
    }
  };

  const handleSearchButtonClick = () => {
    fetchSearchResults(searchTerm);
    setSortOrder(null); // Reset sorting state
    setSortedProducts([]); // Clear sorted products
  };

  const onChange = (checked) => {
    // console.log(`switch to ${checked}`);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setPage(1);
    setSortOrder(null); // Reset sorting state
    setSortedProducts([]); // Clear sorted products
    setLoading(true);

    fetchProducts(false);
  };

  const handleSaleDetailsModalShow = (sku) => {
    setSelectedSku(sku);
    setSaleDetailsModalShow(true);
  };
  const handleSaleDetailsModalClose = () => {
    setSelectedSku(null);
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
    setSortOrder(order); // Store sorting order in state

    setSortedProducts(() => {
      const sorted = [...products].sort((a, b) => {
        const currentUnitsA = calculateUnits(
          filterMetricsForInterval(
            a.salesMetrics || [],
            currentDateRange[0],
            currentDateRange[1]
          )
        );
        const previousUnitsA = calculateUnits(
          filterMetricsForInterval(
            a.salesMetrics || [],
            previousDateRange[0],
            previousDateRange[1]
          )
        );
        const percentageChangeA = parseFloat(
          calculatePercentageChange(currentUnitsA, previousUnitsA)
        );

        const currentUnitsB = calculateUnits(
          filterMetricsForInterval(
            b.salesMetrics || [],
            currentDateRange[0],
            currentDateRange[1]
          )
        );
        const previousUnitsB = calculateUnits(
          filterMetricsForInterval(
            b.salesMetrics || [],
            previousDateRange[0],
            previousDateRange[1]
          )
        );
        const percentageChangeB = parseFloat(
          calculatePercentageChange(currentUnitsB, previousUnitsB)
        );

        return order === "asc"
          ? percentageChangeB - percentageChangeA
          : percentageChangeA - percentageChangeB;
      });

      return sorted;
    });
  };

  const toggleFavorite = async (sku, currentFavoriteStatus, index) => {
    console.log("Toggling favorite status for SKU:", sku);
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

  const { uniqueMonths } = useMemo(() => {
    if (data.length === 0) return { uniqueMonths: [] };

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
    data.forEach((entry) => {
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

    // Assign colors for consistency
    setColorMap(() => {
      const newColorMap = {};
      sortedMonths.forEach((month, index) => {
        newColorMap[month] = COLORS[index % COLORS.length];
      });
      return newColorMap;
    });

    // Ensure last two months are checked by default
    setVisibleMonths((prev) => {
      if (Object.keys(prev).length === 0) {
        return sortedMonths.reduce(
          (acc, month) => ({ ...acc, [month]: lastTwoMonths.includes(month) }),
          {}
        );
      }
      return prev;
    });

    return { uniqueMonths: sortedMonths };
  }, [data]);

  if (initialLoading) {
    return <SaleReportLoadingSkeleton></SaleReportLoadingSkeleton>;
  }

  return (
    <div className=" mt-5">
      {/* Checkboxes for Months */}

      <div className="flex gap-4">
        {/* Chart Section - 60% */}
        <div className="w-[60%]">
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
        </div>

        {/* Date Selection (Checkbox) - 10% */}
        <Card className="w-[10%]   rounded p-2 overflow-auto flex justify-center items-center">
          <div className="">
            {uniqueMonths.map((month) => (
              <label
                key={month}
                className="flex items-center  text-md space-x-2"
              >
                <input
                  type="checkbox"
                  className="cursor-pointer"
                  checked={visibleMonths[month] ?? false}
                  onChange={() =>
                    setVisibleMonths((prev) => ({
                      ...prev,
                      [month]: !prev[month],
                    }))
                  }
                />
                <span>{month}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Pie Chart Section - 30% */}
        <div className="w-[30%]">
          <SaleReportPieChart
            data={data}
            setData={setData}
            visibleMonths={visibleMonths}
            chartLoading={chartLoading}
            setChartLoading={setChartLoading}
            error={error}
            setError={setError}
            colorMap={colorMap}
          />
        </div>
      </div>

      <div className="flex justify-start items-center mt-[15px] gap-3">
        <InputGroup className="max-w-[500px]  z-0">
          <Form.Control
            type="text"
            placeholder="Search by Product Name, Asin or SKU..."
            value={searchTerm}
            onChange={handleSearch}
            onKeyDown={handleKeyDown}
            style={{ borderRadius: "0px" }}
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
          {/* <Switch defaultChecked onChange={onChange} /> */}
          {/* <Switch
            checkedChildren="Asin Mode"
            unCheckedChildren="SKU Mode"
            defaultChecked
          /> */}
          <Switch
            checkedChildren="Asin Mode"
            unCheckedChildren="SKU Mode"
            checked={isAsinMode}
            onChange={(checked) => {
              setIsAsinMode(checked);
              setLoading(true); // Show spinner
              setPage(1); // Reset to page 1
              if (searchTerm) {
                fetchSearchResults(searchTerm, checked);
              } else {
                fetchProducts(false, checked);
              }
            }}
          />
        </div>
      </div>
      <>
        <div
          style={{
            maxHeight: "91vh",
            overflowY: "auto",
            marginTop: "15px",
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
                    position: "sticky",
                    width: "100px",
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
                    width: "180px",
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
                    width: "400px",
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
                  }}
                >
                  Current Interval Units
                  <div>
                    <Space direction="vertical" size={12}>
                      <RangePicker
                        presets={rangePresets}
                        value={
                          currentDateRange.length === 2
                            ? currentDateRange
                            : null
                        }
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
                        format="YYYY-MM-DD"
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
                  }}
                >
                  Previous Interval Units
                  <div>
                    <Space direction="vertical" size={12}>
                      <RangePicker
                        presets={rangePresets}
                        value={
                          previousDateRange.length === 2
                            ? previousDateRange
                            : null
                        }
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
                        format="YYYY-MM-DD"
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
                    width: "150px",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  <p className="flex justify-center items-center gap-1 ">
                    Change (%)
                    {/* <button>
                      <RiArrowUpDownFill className="text-sm" />
                    </button> */}
                    <button
                      onClick={() => {
                        setSortOrder((prev) => {
                          const newOrder = prev === "asc" ? "desc" : "asc"; // Toggle order
                          sortProducts(newOrder); // Update sorted data
                          return newOrder; // Update state
                        });
                      }}
                    >
                     
                    </button>
                  </p>
                </th>
                <th
                  className="tableHeader"
                  style={{
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    width: "150px",
                    zIndex: 3,
                  }}
                >
                  Details
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
                    className="h-[90vh] text-base"
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "20px",
                      border: "none",
                    }}
                  >
                    <div className="mt-[30vh]">
                      <ClipLoader
                        color="#0E6FFD"
                        loading={true}
                        cssOverride={{
                          margin: "0 auto",
                          borderWidth: "3px",
                        }}
                        size={40}
                        width={100}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </div>
                  </td>
                </tr>
              ) : (
                (sortOrder ? sortedProducts : products).map(
                  (product, index) => {
                    const currentMetrics = filterMetricsForInterval(
                      product.salesMetrics || [],
                      currentDateRange[0],
                      currentDateRange[1]
                    );

                    const previousMetrics = filterMetricsForInterval(
                      product.salesMetrics || [],
                      previousDateRange[0],
                      previousDateRange[1]
                    );

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
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "40px",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
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
                                  style={{
                                    color: "#879618a3",
                                    fontSize: "20px",
                                  }}
                                />
                              ) : (
                                <FaRegStar
                                  style={{ color: "gray", fontSize: "16px" }}
                                />
                              )}
                            </span>
                          </div>
                        </td>
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
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                            }}
                          >
                            <img
                              src={
                                product.imageUrl ||
                                "https://via.placeholder.com/50"
                              }
                              alt="Product"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "contain",
                                borderRadius: "5px",
                                display: "block",
                                imageRendering: "auto",
                              }}
                            />
                          </div>
                        </td>

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
                          {product.itemName || "Unknown Product"}

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
                                    handleCopy(product.asin1, "asin", index);
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
                              {product.sellerSku}{" "}
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
                                    handleCopy(product.sellerSku, "sku", index);
                                  }}
                                  style={{
                                    marginLeft: "10px",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                  }}
                                />
                              )}
                            </span>{" "}
                          </div>
                        </td>
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
                          {currentUnits}
                        </td>
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
                          {previousUnits}
                        </td>
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "40px",
                            textAlign: "center",
                            verticalAlign: "middle",
                            color:
                              percentageChange > 0
                                ? "green"
                                : percentageChange < 0
                                ? "red"
                                : "black",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              height: "100%",
                            }}
                          >
                            {`${percentageChange}%`}
                            {percentageChange !== 0 &&
                              percentageChange !== "0.00" && (
                                <span>
                                  {percentageChange > 0 ? (
                                    <FaArrowUp />
                                  ) : (
                                    <FaArrowDownLong />
                                  )}
                                </span>
                              )}
                          </div>
                        </td>
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "40px",
                            textAlign: "center",
                            verticalAlign: "middle",
                            color:
                              percentageChange > 0
                                ? "green"
                                : percentageChange < 0
                                ? "red"
                                : "black",
                          }}
                        >
                          <button
                            onClick={() =>
                              handleSaleDetailsModalShow(product.sellerSku)
                            }
                            className="bg-[#0662BB] text-white rounded drop-shadow-sm  gap-1  px-2 py-1"
                          >
                            See Details
                          </button>
                        </td>
                      </tr>
                    );
                  }
                )
              )}
            </tbody>
          </table>
          <SaleReportPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </>

      <SaleDetailsModal
        saleDetailsModalShow={saleDetailsModalShow}
        setSaleDetailsModalShow={setSaleDetailsModalShow}
        handleSaleDetailsModalShow={handleSaleDetailsModalShow}
        handleSaleDetailsModalClose={handleSaleDetailsModalClose}
        sku={selectedSku}
      ></SaleDetailsModal>
    </div>
  );
};

export default SaleReport;