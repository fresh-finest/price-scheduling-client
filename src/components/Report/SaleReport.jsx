import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { DatePicker, Space, Switch } from "antd";
import { InputGroup, Form } from "react-bootstrap";
import dayjs from "dayjs";
import "antd/dist/reset.css";
import SaleReportPagination from "./SaleReportPagination";

import { HiMagnifyingGlass } from "react-icons/hi2";
import { MdCheck, MdOutlineClose } from "react-icons/md";
import SaleReportLoadingSkeleton from "../LoadingSkeleton/SaleReportLoadingSkeleton";
import { ClipLoader } from "react-spinners";
import SaleReportChart from "./SaleReportChart";
import SaleReportPieChart from "./SalesReportPieChart/SaleReportPieChart";
import SaleDetailsModal from "./SaleDetailsModal";
import { RiArrowUpDownFill } from "react-icons/ri";
import { Card } from "../ui/card";
import SaleReportTableRow from "./SaleReportTable/SaleReportTableRow";

const { RangePicker } = DatePicker;
const BASE_URL = "http://192.168.0.26:3000";
// const BASE_URL = "https://api.priceobo.com";
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

  const onChange = (checked) => {
    console.log(`switch to ${checked}`);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setPage(1);
    setSortOrder(null);
    setSortedProducts([]);
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
    setSortOrder(order);

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

    setColorMap(() => {
      const newColorMap = {};
      sortedMonths.forEach((month, index) => {
        newColorMap[month] = COLORS[index % COLORS.length];
      });
      return newColorMap;
    });

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

      {/* <div className="flex gap-4">
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
      </div> */}

      <div className=" absolute top-[11px]">
        <div className="  flex justify-start items-center  gap-3">
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
      </div>

      <section className="flex gap-3">
        {/* sale report table part */}
        <section className="w-[60%]">
          <div
            style={{
              maxHeight: "91vh",
              overflowY: "auto",

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
                      width: "70px",
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
                      width: "120px",
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
                      width: "270px",
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
                          format="DD MMM, YYYY"
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
                          format="DD MMM, YYYY"
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
                      width: "110px",
                    }}
                  >
                    <p className="flex justify-center items-center gap-1 ">
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
                  {/* <th
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
                  </th> */}
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
                        <SaleReportTableRow
                          key={product.sellerSku}
                          product={product}
                          toggleFavorite={toggleFavorite}
                          index={index}
                          handleCopy={handleCopy}
                          copiedAsinIndex={copiedAsinIndex}
                          copiedSkuIndex={copiedSkuIndex}
                          currentUnits={currentUnits}
                          previousUnits={previousUnits}
                          percentageChange={percentageChange}
                          handleSaleDetailsModalShow={
                            handleSaleDetailsModalShow
                          }
                        ></SaleReportTableRow>
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
        </section>

        {/* sale report chart part */}
        <Card className="w-[40%] h-[90vh] p-3">
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

          <div className="flex flex-wrap gap-x-4 gap-y-2 my-4">
            {[...uniqueMonths].reverse().map((month) => (
              <label key={month} className="flex items-center space-x-1">
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
        </Card>
      </section>

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
