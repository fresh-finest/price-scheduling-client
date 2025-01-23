import { Modal } from "react-bootstrap";
import "./SaleDetailsModal.css";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
// import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import SalesDetailsBarChart from "../Graph/SalesDetailsBarChart";
import {
  MdArrowBackIos,
  MdCheck,
  MdOutlineArrowBackIos,
  MdOutlineClose,
} from "react-icons/md";
import { BsClipboardCheck,BsFillInfoSquareFill} from "react-icons/bs";
import { Card } from "../ui/card";
import PriceVsCount from "./PriceVsCount";
import ScheduleVsCount from "./ScheduleVsCount";
import ChartsLoadingSkeleton from "../LoadingSkeleton/ChartsLoadingSkeleton";
import { DatePicker, Space } from "antd";
import dayjs from "dayjs";
import "./SaleDetails.css";
import SaleDetailsProductDetailSkeleton from "../LoadingSkeleton/SaleDetailsProductDetailSkeleton";
import AutomatePrice from "../Automation/AutomatePrice";
const { RangePicker } = DatePicker;

const BASE_URL = `https://api.priceobo.com`;
// const BASE_URL = "http://localhost:3000";

const SaleDetailsModal = ({
  saleDetailsModalShow,
  product,
  handleSaleDetailsModalClose,
  handleSaleDetailsModalShow,
  sku,
}) => {
  //   const { sku } = useParams();
  const [salesData, setSalesData] = useState([]);
  const [scheduleSalesData, setScheduleSalesData] = useState([]);
  const [asin, setAsin] = useState([]);
  const [identifierType, setIdentifierType] = useState("sku");
  const [productData, setProductData] = useState("");

  const [salesChartloading, setSalesChartLoading] = useState(false);
  const [schduleChartLoading, setScheduleChartLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("day"); // Default view is "By Day"
  const [dateRange, setDateRange] = useState([null, null]); // Store start and end date as a range
  const [startDate, endDate] = dateRange; // Destructure for easy access
  const [copiedSku, setCopiedSku] = useState(null);
  const [copiedAsin, setCopiedAsin] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showScheduleSalesTable, setShowScheduleSalesTable] = useState(false);
  const [productPrice, setProductPrice] = useState("");
  const [productDetails, setProductDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasAutomation, setHasAutomation] = useState(false);
  const identifier = identifierType === "sku" ? sku : asin;

  const location = useLocation();
  const navigate = useNavigate();

  const fetchAutomationStatus = async (sku) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/active-auto-job/${sku}/sku`
      );

      if (response?.data && response?.data?.job) {
        setHasAutomation(true);
      } else {
        setHasAutomation(false);
      }
    } catch (error) {
      console.error("Error fetching automation status: ", error);
      console.log("automation error", error);
      setHasAutomation(false);
    }
  };

  console.log("has automation", hasAutomation);
  const fetchSalesMetrics = async () => {
    if (!identifier) return;

    setSalesChartLoading(true);
    setError(null);
    const encodedIndentifier = encodeURIComponent(identifier);
    try {
      let url = `${BASE_URL}/sales-metrics/${view}/${encodedIndentifier}`;
      const params = { type: identifierType };

      if (startDate && endDate) {
        url = `${BASE_URL}/sales-metrics/range/${encodedIndentifier}`;
        params.startDate = moment(startDate).add(1,'day').format("YYYY-MM-DD");
        params.endDate = moment(endDate).format("YYYY-MM-DD");
        setView("day");
      }

      // Pass query parameters in the GET request
      const response = await axios.get(url, { params });

      if (startDate && endDate) {
        const sortedData = response.data.sort((a, b) => {
          const dateA = new Date(a.date.split("/").reverse().join("-"));
          const dateB = new Date(b.date.split("/").reverse().join("-"));
          return dateA - dateB;
        });
        setSalesData(sortedData);
      } else {
        setSalesData(response.data);
      }
    } catch (err) {
      setError("An error occurred while fetching sales data.");
    } finally {
      setSalesChartLoading(false);
    }
  };

  const fetchScheduleSalesMetrics = async () => {
    setScheduleChartLoading(true);
    const encodedSku = encodeURIComponent(sku);
    try {
      const response = await axios.get(`${BASE_URL}/api/report/${encodedSku}`);
      const filterStartDate = startDate ? new Date(startDate) : null;
      const filterEndDate = endDate ? new Date(endDate) : null;

      const filteredData = response.data.filter((item) => {
        const itemStartDate = new Date(item.interval.split(" - ")[0]);
        return (
          (!filterStartDate || itemStartDate >= filterStartDate) &&
          (!filterEndDate || itemStartDate <= filterEndDate)
        );
      });

      const sortedData = filteredData.sort((a, b) => {
        return (
          new Date(a.interval.split(" - ")[0]) -
          new Date(b.interval.split(" - ")[0])
        );
      });

      setScheduleSalesData(sortedData);
    } catch (err) {
      console.error("Error fetching schedule sales data:", err);
    } finally {
      setScheduleChartLoading(false);
    }
  };

  const fetchProductPrice = async () => {
    setLoading(true);
    setError(null);
    const encodedSku = encodeURIComponent(sku);
    try {
      const response = await axios.get(
        `${BASE_URL}/list/${encodedSku}`
      );
      const price = response?.data?.offerAmount;

      setProductPrice(price);
      setLoading(false);
    } catch (err) {
      setError("An Error occurred while fetching product price.");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async () => {
    const encodedSku = encodeURIComponent(sku);
    try {
      const response = await axios.get(`${BASE_URL}/image/${encodedSku}`);
      setAsin(response.data?.summaries[0]?.asin);
      setProductDetails(response.data);
    } catch (error) {
      setError("An error occurred while fetching product price.");
    }
  };

  useEffect(() => {
    if (sku) {
      fetchProductPrice();
      fetchProductDetails();
      fetchAutomationStatus(sku);
    }
  }, [sku]); // Dependency array ensures effect runs only when SKU changes

  useEffect(() => {
    fetchSalesMetrics();

    // fetchSalesProductData();
    // fetchScheduleSalesMetrics();
  }, [identifier, view, startDate, endDate]);

  useEffect(() => {
    fetchScheduleSalesMetrics();
  }, [sku, startDate, endDate]);

  const handleViewChange = (newView) => {
    setView(newView);
    setDateRange([null, null]); // Reset date range
  };

  const formatDate = (date) => {
    return moment(date, "DD/MM/YYYY").format("MM/DD/YYYY, dddd");
  };
  const handleIdentifierTypeChange = (type) => {
    // setIdentifierType((prev) => (prev === "sku" ? "asin" : "sku"));
    setIdentifierType(type);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "sku") {
          setCopiedSku(text); // Set the copied SKU
          setTimeout(() => setCopiedSku(null), 2000); // Reset after 2 seconds
        } else if (type === "asin") {
          setCopiedAsin(text); // Set the copied SKU
          setTimeout(() => setCopiedAsin(null), 2000); // Reset after 2 seconds
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  const onRangeChange = (dates) => {
    if (dates) {
      setDateRange([dates[0]?.toDate() || null, dates[1]?.toDate() || null]);
    } else {
      setDateRange([null, null]);
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

  return (
    <div>
      <Modal
        show={saleDetailsModalShow}
        fullscreen={true}
        // dialogClassName="modal-90w"

        onHide={handleSaleDetailsModalClose}
        className="saleDetailsModal"
      >
        {/* <Modal.Header closeButton></Modal.Header> */}
        <Modal.Body className="update-price-list-modal-body">
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
            onClick={handleSaleDetailsModalClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>
          <div className="">
            {productDetails ? (
              <div className="flex max-w-[50%] px-2 py-2 rounded mt-[-8px] gap-2">
                <img
                  className="object-cover"
                  src={productDetails?.summaries[0]?.mainImage?.link}
                  width="70px"
                  height="40px"
                  alt="product image"
                />
                <div>
                  <h3 className="text-md">
                    {productDetails?.summaries[0]?.itemName}
                  </h3>
                  <div className="flex items-center justify-start gap-1 mt-1">
                    <p className="px-2 py-1 bg-[#3B82F6] text-white rounded-sm">
                      ${parseFloat(productPrice).toFixed(2)}
                    </p>
                    <p className="flex items-center justify-center gap-1 text-sm border px-2 py-1.5">
                      {sku}{" "}
                      {copiedSku === sku ? (
                        <MdCheck
                          style={{
                            marginLeft: "5px",
                            cursor: "pointer",
                            color: "green",
                            fontSize: "16px",
                          }}
                        />
                      ) : (
                        <BsClipboardCheck
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(sku, "sku");
                          }}
                          style={{
                            marginLeft: "5px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        />
                      )}
                    </p>
                    <p className="flex items-center justify-center gap-1 text-sm border px-2 py-1.5">
                      {asin}{" "}
                      {copiedAsin === asin ? (
                        <MdCheck
                          style={{
                            marginLeft: "5px",
                            cursor: "pointer",
                            color: "green",
                            fontSize: "16px",
                          }}
                        />
                      ) : (
                        <BsClipboardCheck
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(asin, "asin");
                          }}
                          style={{
                            marginLeft: "5px",
                            cursor: "pointer",
                            fontSize: "16px",
                          }}
                        />
                      )}
                    </p>
                  </div>
                </div>

                <div className="absolute top-[10px] right-[17%]">
                  <RangePicker
                    className="ant-datePicker-input"
                    presets={rangePresets}
                    onChange={onRangeChange}
                  />
                </div>
              </div>
            ) : (
              <SaleDetailsProductDetailSkeleton />
            )}
            <div className="flex  items-center mt-2">
              <Button onClick={handleSaleDetailsModalClose} variant="outline">
                {" "}
                <MdArrowBackIos className="text-xs" /> Back
              </Button>
              <div className="flex-1 flex justify-center mb-2">
                {hasAutomation ? (
                  <span className="flex justify-center items-center gap-1">
                    {" "}
                    <BsFillInfoSquareFill className="text-[#0D6EFD] text-xl" />
                    Automation is running!
                  </span>
                ) : (
                  <AutomatePrice
                    sku={sku}
                    asin={asin}
                    productDetails={productDetails}
                    product={product}
                    productPrice={productPrice}
                  ></AutomatePrice>
                )}
              </div>
            </div>
            <div className="mt-1">
              {salesChartloading ? (
                <ChartsLoadingSkeleton></ChartsLoadingSkeleton>
              ) : (
                <PriceVsCount
                  handleViewChange={handleViewChange}
                  view={view}
                  salesData={salesData}
                  showTable={showTable}
                  setShowTable={setShowTable}
                  startDate={startDate}
                  endDate={endDate}
                  formatDate={formatDate}
                  handleIdentifierTypeChange={handleIdentifierTypeChange}
                  identifierType={identifierType}
                  scheduleSalesData={scheduleSalesData}
                ></PriceVsCount>
              )}
            </div>
            <div>
              {schduleChartLoading ? (
                <ChartsLoadingSkeleton></ChartsLoadingSkeleton>
              ) : (
                <ScheduleVsCount
                  // view={view}
                  scheduleSalesData={scheduleSalesData}
                  showScheduleSalesTable={showScheduleSalesTable}
                  setShowScheduleSalesTable={setShowScheduleSalesTable}
                  startDate={startDate}
                  endDate={endDate}
                  formatDate={formatDate}
                ></ScheduleVsCount>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SaleDetailsModal;