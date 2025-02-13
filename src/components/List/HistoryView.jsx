import { useState, useEffect } from "react";
import { Table, Form, InputGroup, Spinner, Pagination } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import { MdContentCopy, MdCheck, MdOutlineClose } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";
// import { FaArrowRight } from "react-icons/fa"; // Example arrow icon
import "react-datepicker/dist/react-datepicker.css";
import "./HistoryView.css";
import { useSelector } from "react-redux";
import { daysOptions, datesOptions } from "../../utils/staticValue";
import moment from "moment-timezone";

import { useQuery, useQueryClient } from "react-query";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { Card } from "../ui/card";
import { FaArrowRightLong } from "react-icons/fa6";
import { IoIosArrowForward } from "react-icons/io";
import { ListTypeDropdown } from "../shared/ui/ListTypeDropdown";
import { HistoryUserFilterDropdown } from "../shared/ui/HistoryUserFilterDropdown";
import HistoryLoadingSkeleton from "../LoadingSkeleton/HistoryLoadingSkeleton";



// const BASE_URL = "http://localhost:3000";

const BASE_URL = `https://api.priceobo.com`;

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dateNames = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
  "18th",
  "19th",
  "20th",
  "21st",
  "22nd",
  "23rd",
  "24th",
  "25th",
  "26th",
  "27th",
  "28th",
  "29th",
  "30th",
  "31st",
];

function addHoursToTime(timeString, hoursToAdd) {
  let [hours, minutes] = timeString.split(":").map(Number);

  // Add hours and calculate new hours and AM/PM
  hours = (hours + hoursToAdd) % 24;
  const amOrPm = hours >= 12 ? "PM" : "AM";

  // Convert 24-hour format to 12-hour format
  const formattedHours = hours % 12 === 0 ? 12 : hours % 12; // Handle midnight (0 -> 12) and noon (12 -> 12)
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero to minutes if necessary

  return `${formattedHours}:${formattedMinutes} ${amOrPm}`;
}

const getDayLabelFromNumber = (dayNumber) => {
  return dayNames[dayNumber] || "";
};
const getDateLabelFromNumber = (dateNumber) => {
  return dateNames[dateNumber - 1] || `Day ${dateNumber}`; // Fallback if dateNumber is out of range
};

const displayTimeSlotsWithDayLabels = (
  timeSlots,
  addHours = 0,
  isWeekly = false
) => {
  if (!timeSlots || Object.keys(timeSlots).length === 0) {
    return <p>No time slots available</p>; // Handle undefined or null timeSlots
  }

  return (
    <Card className="px-2 py-1 inline-block  ">
      <div className="flex flex-wrap gap-1">
        {Object.entries(timeSlots).map(([key, slots]) => (
          <div className="flex " key={key}>
            <span className="px-2 py-1 bg-gray-100 rounded-md ">
              {isWeekly
                ? getDayLabelFromNumber(Number(key))
                : getDateLabelFromNumber(Number(key))}
            </span>
            {/* 
      
          <div className="flex flex-wrap gap-1">
            {slots.map((slot, index) => (
              <p key={index} className="flex-none">
                {addHoursToTime(slot.startTime, addHours)} -{" "}
                {addHoursToTime(slot.endTime, addHours)} New Price: {slot?.newPrice}{" "}
                - End Price: {slot?.revertPrice}
              </p>
            ))}
          </div> 
          */}
          </div>
        ))}
      </div>
    </Card>
  );
};

const displayWeekdays = (timeSlots) => {
  if (!timeSlots || Object.keys(timeSlots).length === 0) {
    return <p>No time slots available</p>; // Handle undefined or null timeSlots
  }

  // Array of weekdays to display based on your desired keys
  // const weekdaysToDisplay = [0, 1, 2, 3, 4, 5, 6];
  const weekdaysToDisplay = Object.entries(timeSlots)
    .filter(([, slots]) => slots.length > 0) // Filter out empty slots
    .map(([day]) => Number(day)); // Convert keys back to numbers

  // Get the labels for the days with non-empty time slots
  const displayedWeekdays = weekdaysToDisplay.map((day) =>
    getDayLabelFromNumber(day)
  );

  // const displayedWeekdays = weekdaysToDisplay
  //   .filter((day) => day in timeSlots)
  //   .map((day) => getDayLabelFromNumber(day));

  return (
    <Card className=" px-2 py-2 inline-block">
      <div className="flex justify-center flex-wrap gap-2">
        {displayedWeekdays.map((dayLabel, index) => (
          <div key={index} className="flex">
            <p className="p-1 bg-[#F5F5F5] rounded-sm">{dayLabel}</p>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default function HistoryView() {
  // const [data, setData] = useState([]);
  // const [users, setUsers] = useState([]);
  const [nestedData, setNestedData] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  // const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  // const [loading, setLoading] = useState(true);
  const [loadingNested, setLoadingNested] = useState(false);
  // const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(null); // Date range filter start date
  const [filterEndDate, setFilterEndDate] = useState(null); // Date range filter end date
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [lengthNested, setLengthNested] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSingleType, setShowSingleType] = useState(false);
  const [showWeeklyType, setShowWeeklyType] = useState(false);
  const [showMonthlyType, setShowMonthlyType] = useState(false);
  const [selectedUser, setSelectedUser] = useState("");

  const queryClient = useQueryClient();

  const itemsPerPage = 20;

  const baseUrl = useSelector((state) => state.baseUrl.baseUrl);
/*
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user`);
        setUsers(response.data.result);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Fetch the main data
        const mainUrl = selectedUser
          ? `${BASE_URL}/api/schedule/${selectedUser}/list`
          : `${BASE_URL}/api/history`;

        const mainResponse = await axios.get(mainUrl);
        const mainData = mainResponse.data.result || [];

        // Sort and filter main data
        const sortedData = mainData
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .filter((item) => item.action === "created");
        setData(sortedData);
       
      } catch (error) {
        console.error("Data fetch error:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "An error occurred while fetching data."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []); // Add selectedUser as a dependency if the data should refresh when it changes

  console.log("nested length" + JSON.stringify(lengthNested));

  const fetchNestedData = async (scheduleId) => {
    setLoadingNested(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/history/${scheduleId}`);
      setNestedData((prevData) => ({
        ...prevData,
        [scheduleId]: response.data,
      }));

      console.log("len" + response.data.length);
    } catch (err) {
      console.error("Error fetching nested data: ", err);
    } finally {
      setLoadingNested(false);
    }
  };
  */
  /*
  const handleRowClick = (scheduleId) => {
    if (expandedRow === scheduleId) {
      setExpandedRow(null); // Collapse the row if it's already expanded
    } else {
      setExpandedRow(scheduleId);
      if (!nestedData[scheduleId]) {
        fetchNestedData(scheduleId);
      }
    }
  };
*/
 // Fetch users
 const { data: users = [] } = useQuery("users", async () => {
  const response = await axios.get(`${BASE_URL}/api/user`);
  return response.data.result;
}, {
  staleTime: 1000 * 60 * 60 * 3, // Cache data for 3 hours
  cacheTime: 1000 * 60 * 60 * 6, // Keep unused data in cache for 6 hours
});

// Fetch and process main data
const { data: data = [], isLoading: loading, error } = useQuery(
  ["history"],
  async () => {
    const response = await axios.get(`${BASE_URL}/api/history`);
    const mainData = response.data.result || [];
    
    // Sort and filter main data
    return mainData
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter((item) => item.action === "created");
  },
  {
    staleTime: 1000 * 60 * 60 * 3, // Cache data for 3 hours
    cacheTime: 1000 * 60 * 60 * 6, // Keep unused data in cache for 6 hours
  }
);
  const handleRowClick = async (scheduleId) => {
    if (expandedRow === scheduleId) {
      setExpandedRow(null); // Collapse the row if it's already expanded
    } else {
      setExpandedRow(scheduleId);

      // Fetch nested data only if it hasn't been fetched before
      if (!nestedData[scheduleId]) {
        setLoadingNested(true);
        try {
          const nestedResponse = await axios.get(
            `${BASE_URL}/api/history/${scheduleId}`
          );
          setNestedData((prevData) => ({
            ...prevData,
            [scheduleId]: nestedResponse.data,
          }));
        } catch (err) {
          console.error(
            `Error fetching nested data for scheduleId ${scheduleId}:`,
            err
          );
          setNestedData((prevData) => ({
            ...prevData,
            [scheduleId]: [], // Default to empty array if there's an error
          }));
        } finally {
          setLoadingNested(false);
        }
      }
    }
  };
  const handleSearch = (e) => {
    setCurrentPage(1);
    setSearchTerm(e.target.value);
  };
  const handleClearInput = () => {
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleFilterDateChange = (dates) => {
    const [start, end] = dates;
    setFilterStartDate(start);
    setFilterEndDate(end);
  };
  // const formatDateTime = (dateString,timeZone) => {
  //   const options = {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //     hour: "numeric",
  //     minute: "numeric",
  //     hour12: true,
  //     timeZone: timeZone
  //   };
  //   return new Date(dateString).toLocaleString("en-US", options);
  // };
  const formatDateTime = (dateString,timeZone) => {
   
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: timeZone, 
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const formatDateTimeCreated = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
      timeZone: "America/New_York", // Set timezone to EDT (Eastern Time Zone)
    };

    return new Date(dateString).toLocaleString("en-US", options);
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

  const getDisplayData = (item) => {
    if (item.action === "updated") {
      return item.updatedState || item.previousState || {};
    }
    return item;
  };

  const getDayLabels = (daysOfWeek) => {
    return daysOfWeek
      .map((day) => daysOptions.find((option) => option.value === day)?.label)
      .join(", ");
  };

  const getDateLabels = (datesOfMonth) => {
    return datesOfMonth
      .map(
        (date) => datesOptions.find((option) => option.value === date)?.label
      )
      .join(", ");
  };

  const filteredData = data
    .filter((item) => {
      const displayData = getDisplayData(item);
      // Filter by search term
      return (
        displayData.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayData.asin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        displayData.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .filter((item) => {
      const displayData = getDisplayData(item);
      const itemStartDate = displayData.startDate
        ? new Date(displayData.startDate)
        : null;
      const itemEndDate = displayData.endDate
        ? new Date(displayData.endDate)
        : null;

      // Date range filter
      if (filterStartDate && filterEndDate) {
        const adjustedEndDate = new Date(filterEndDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        return (
          (itemStartDate &&
            itemStartDate >= filterStartDate &&
            itemStartDate <= adjustedEndDate) ||
          (itemEndDate &&
            itemEndDate >= filterStartDate &&
            itemEndDate <= adjustedEndDate)
        );
      } else if (filterStartDate) {
        return (
          (itemStartDate && itemStartDate >= filterStartDate) ||
          (itemEndDate && itemEndDate >= filterStartDate)
        );
      } else if (filterEndDate) {
        const adjustedEndDate = new Date(filterEndDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        return (
          (itemStartDate && itemStartDate <= adjustedEndDate) ||
          (itemEndDate && itemEndDate <= adjustedEndDate)
        );
      }
      return true;
    })
    .filter((item) => {
      const displayData = getDisplayData(item);

      // Type filter logic
      const isSingleTypeMatch =
        showSingleType &&
        displayData.weekly === false &&
        displayData.monthly === false;
      const isWeeklyTypeMatch = showWeeklyType && displayData.weekly === true;
      const isMonthlyTypeMatch =
        showMonthlyType && displayData.monthly === true;

      // If all are unchecked, show all types
      if (!showSingleType && !showWeeklyType && !showMonthlyType) {
        return true;
      }

      return isSingleTypeMatch || isWeeklyTypeMatch || isMonthlyTypeMatch;
    })
    .filter((item) => {
      // User filter logic
      if (selectedUser === "") {
        return true; // Show all users if "All Users" is selected
      }
      return item.userName === selectedUser;
    });



  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // Adjust this for how many pages to show around the current page
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

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

  if (loading) return <HistoryLoadingSkeleton></HistoryLoadingSkeleton>;
  if (error) return <div style={{ marginTop: "100px" }}>{error}</div>;

  return (
    <div>
      <div className="">
        <InputGroup className="max-w-[500px] absolute top-[11px] ">
          <Form.Control
            type="text"
            placeholder="Search by Product Name, ASIN or SKU..."
            value={searchTerm}
            onChange={handleSearch}
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
        {/* <div className="absolute top-[7px] right-[25%]">
          <Form.Control
            as="select"
            value={selectedUser}
            onChange={handleUserChange}
            style={{ borderRadius: "4px" }}
            className="custom-input"
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user._id} value={user.userName}>
                Price Updated By {user.userName}
              </option>
            ))}
          </Form.Control>
        </div> */}
        <div className="absolute top-[11px] right-[15.5%]">
          <DatePicker
            className="custom-date-input"
            selected={filterStartDate}
            onChange={handleFilterDateChange}
            startDate={filterStartDate}
            endDate={filterEndDate}
            selectsRange
            isClearable
            placeholderText="Select a date range"
            // className="form-control"
            style={{ borderRadius: "4px" }}
          />
        </div>
      </div>

      <section
        style={{
          maxHeight: "91vh",
          overflowY: "auto",
          marginTop: "50px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table
          // hover
          // responsive
          style={{
            tableLayout: "fixed",
          }}
          className=" historyCustomTable table"
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
                  width: "20px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              ></th>
              <th
                className="tableHeader"
                style={{
                  width: "60px",
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
                  width: "255px",
                  position: "sticky", // Sticky header
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
                  width: "60px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                <p className="flex justify-center items-center gap-1">
                  <span>Type</span>{" "}
                  <ListTypeDropdown
                    showSingleType={showSingleType}
                    setShowSingleType={setShowSingleType}
                    showWeeklyType={showWeeklyType}
                    setShowWeeklyType={setShowWeeklyType}
                    showMonthlyType={showMonthlyType}
                    setShowMonthlyType={setShowMonthlyType}
                  ></ListTypeDropdown>
                </p>
              </th>
              <th
                className="tableHeader"
                style={{
                  width: "200px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Duration
              </th>
              <th
                className="tableHeader"
                style={{
                  width: "90px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                {/* User  */}
                <HistoryUserFilterDropdown
                  users={users}
                  value={selectedUser}
                  onSelect={setSelectedUser}
                ></HistoryUserFilterDropdown>
              </th>
              <th
                className="tableHeader"
                style={{
                  width: "60px",
                  position: "sticky", // Sticky header
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Action
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
            {filteredData.length > 0 ? (
              currentItems.map((item, index) => {
                const displayData = getDisplayData(item);

                const weeklyLabel = displayData?.weekly
                  ? displayWeekdays(displayData?.weeklyTimeSlots)
                  : null;

                const monthlyLabel = displayData?.monthly
                  ? displayTimeSlotsWithDayLabels(
                      displayData?.monthlyTimeSlots,
                      6,
                      false
                    )
                  : null;

                return (
                  <>
                    <tr
                      key={index}
                      className={`${
                        lengthNested[item.scheduleId] > 1
                          ? "cursor-pointer"
                          : ""
                      }`}
                      style={{
                        height: "50px",
                        // cursor: "pointer",
                        margin: "20px 0",
                      }}
                      onClick={() => handleRowClick(item.scheduleId)}
                      // className="borderless spacer-row"
                    >
                      {/* arrow sign */}
                      <td
                        style={{
                          // cursor: "pointer",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {
                        (item.weekly || item.monthly) ? (
                          <IoIosArrowForward
                            className={`text-base transition-all cursor-pointer duration-300 ${
                              expandedRow === item.scheduleId ? "rotate-90" : ""
                            }`}
                          />
                        ) : null}

                        {/* {lengthNested[item.scheduleId] > 1 &&
                        expandedRow === item.scheduleId ? (
                          <IoIosArrowForward className="text-base" />
                        ) : null} */}
                      </td>
                      {/* image  */}
                      <td
                        style={{
                          // cursor: "pointer",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <img
                          src={displayData?.imageURL || "placeholder-image-url"}
                          alt=""
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                            margin: "0 auto",
                          }}
                        />
                      </td>
                      {/* product details */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          // cursor: "pointer",
                          height: "40px",
                          textAlign: "start",
                          verticalAlign: "middle",
                        }}
                      >
                        {displayData?.title || "N/A"}
                        <div>
                          <span
                            className="bubble-text"
                            style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {displayData?.asin || "N/A"}
                            {copiedAsinIndex === index ? (
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
                                  handleCopy(displayData.asin, "asin", index);
                                }}
                                style={{ marginLeft: "5px", cursor: "pointer", fontSize: "16px", }}
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
                            {displayData?.sku || "N/A"}
                            {copiedSkuIndex === index ? (
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
                                  handleCopy(displayData.sku, "sku", index);
                                }}
                                style={{ marginLeft: "5px", cursor: "pointer", fontSize: "16px", }}
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
                          textAlign: "center",
                          verticalAlign: "middle",
                          // cursor: "pointer",
                          height: "40px",
                        }}
                      >
                        {displayData.weekly ? (
                          <h2>Weekly</h2>
                        ) : displayData.monthly ? (
                          <h2>Monthly</h2>
                        ) : (
                          <h2>Single</h2>
                        )}
                      </td>
                      {/* duration */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",
                          // cursor: "pointer",
                          // height: "40px",
                          width: "50px",
                        }}
                      >
                        <div>
                          {displayData?.weekly ? (
                            <>
                              <p className=" ">{weeklyLabel}</p>
                            </>
                          ) : displayData?.monthly ? (
                            <>
                              <span>{monthlyLabel}</span>
                            </>
                          ) : (
                            <>
                              {/* Single Entry Display */}
                              <Card className="flex justify-between items-center p-2 mb-2 border ">
                                <div className="w-full flex gap-2">
                                  <h3 className="flex text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                    {displayData?.startDate
                                      ? formatDateTime(displayData.startDate, displayData?.timeZone)
                                      : "N/A"}
                                    {displayData.price && (
                                      <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                        ${displayData?.price?.toFixed(2)}
                                      </span>
                                    )}
                                  </h3>
                                  <span className="flex justify-center items-center text-gray-400">
                                    <FaArrowRightLong />
                                  </span>

                                  {displayData.endDate ? (
                                    <div className="w-full">
                                      <h3 className="flex justify-between gap-2 text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                        {formatDateTime(displayData.endDate, displayData?.timeZone)}
                                        {displayData.currentPrice && (
                                          <span className="bg-red-700  text-[12px] text-white p-1 rounded-sm">
                                            $
                                            {displayData?.currentPrice?.toFixed(
                                              2
                                            )}
                                          </span>
                                        )}
                                      </h3>
                                    </div>
                                  ) : (
                                    <div className="w-full">
                                      <h3 className="text-red-400  text-[12px]  text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                        <span className="">
                                          Until change back
                                        </span>
                                      </h3>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            </>
                          )}
                        </div>
                      </td>

                      {/* user */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",
                          // cursor: "pointer",
                          height: "40px",
                        }}
                      >
                        {item.userName}{" "}
                        <p>{formatDateTimeCreated(item.timestamp)}</p>
                      </td>

                      {/* action */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          textAlign: "center",
                          verticalAlign: "middle",
                          // cursor: "pointer",
                          // height: "40px",
                        }}
                      >
                        {item.action === "deleted" ? (
                          <span style={{ color: "red" }}>Deleted</span>
                        ) : item.action === "updated" ? (
                          <span style={{ color: "orange" }}>Updated</span>
                        ) : (
                          <span className="bg-green-100 px-2 py-2 text-green-700 text-xs font-semibold rounded-sm">
                            Created
                          </span>
                        )}
                      </td>
                    </tr>

                    {expandedRow === item.scheduleId &&
                      ((nestedData[item.scheduleId] &&
                        nestedData[item.scheduleId].length > 1) ||
                        displayData.weekly ||
                        displayData.monthly) && (
                        <tr>
                          <td colSpan="6" className="">
                            {loadingNested && <Spinner animation="border" />}
                            {!loadingNested && nestedData[item.scheduleId] && (
                              <Table className="ml-[9%] " size="sm">
                                <thead>
                                  <tr>
                                    {/* <th>Image</th> */}
                                    {/* <th>Duration</th> */}
                                    {/* <th>User</th> */}
                                    {/* <th>Action</th> */}
                                    {/* <th>Product Details</th> */}
                                  </tr>
                                </thead>
                                <tbody
                                  style={{
                                    fontSize: "12px",
                                    fontFamily: "Arial, sans-serif",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  {nestedData[item.scheduleId]
                                    .filter(
                                      (nestedItem) =>
                                        !(
                                          nestedItem.action === "created" &&
                                          !nestedItem.weekly &&
                                          !nestedItem.monthly
                                        )
                                    )
                                    .map((nestedItem) => {
                                      // console.log(nestedItem);
                                      // Return JSX
                                      return (
                                        <tr
                                          key={nestedItem._id}
                                          className="transition-all duration-500"
                                        >
                                          {/* duration */}
                                          {/* <td>
                                        {formatDateTime(nestedItem.timestamp)}
                                      </td> */}
                                          {/* <td width="80px">image</td>
                                      <td width="300px">Description</td>
                                      <td>Type</td> */}

                                          <td
                                            style={{
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              textAlign: "center",
                                              verticalAlign: "middle",
                                            }}
                                          >
                                            <div>
                                              {nestedItem?.action ===
                                              "deleted" ? (
                                                // Display previousState data when action is deleted
                                                <>
                                                  {nestedItem?.previousState
                                                    ?.weekly ? (
                                                    <div className="grid grid-cols-3 gap-1">
                                                      {Object.entries(
                                                        nestedItem
                                                          ?.previousState
                                                          ?.weeklyTimeSlots ||
                                                          {}
                                                      ).map(
                                                        ([day, timeSlots]) => (
                                                          <div
                                                            key={day}
                                                            className=" border rounded shadow-md bg-white"
                                                          >
                                                            <div className="bg-[#DCDCDC] border-0 m-0 p-0 rounded-t-sm">
                                                              {/* Array of day names */}
                                                              <h4 className=" text-black text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                                {` ${
                                                                  [
                                                                    "Sunday",
                                                                    "Monday",
                                                                    "Tuesday",
                                                                    "Wednesday",
                                                                    "Thursday",
                                                                    "Friday",
                                                                    "Saturday",
                                                                  ][
                                                                    parseInt(
                                                                      day
                                                                    )
                                                                  ]
                                                                }`}
                                                              </h4>
                                                            </div>
                                                            {timeSlots.length >
                                                            0 ? (
                                                              <div className="flex flex-col gap-1">
                                                                {timeSlots.map(
                                                                  (
                                                                    slot,
                                                                    index
                                                                  ) => (
                                                                    <Card
                                                                      key={
                                                                        index
                                                                      }
                                                                      className="flex justify-between items-center p-2  border "
                                                                    >
                                                                      <div className="flex justify-between w-full gap-1">
                                                                        <div className="w-full">
                                                                          <h3 className="flex  text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                            {addHoursToTime(
                                                                              slot.startTime,
                                                                              0
                                                                            )}

                                                                            <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                              $
                                                                              {slot?.newPrice?.toFixed(
                                                                                2
                                                                              )}
                                                                            </span>
                                                                          </h3>
                                                                        </div>
                                                                        <span className="flex justify-center items-center text-gray-400">
                                                                          <FaArrowRightLong />
                                                                        </span>

                                                                        {slot.endTime ? (
                                                                          <div className="w-full">
                                                                            <h3 className="flex justify-between gap-2 text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                              {addHoursToTime(
                                                                                slot.endTime,
                                                                                0
                                                                              )}

                                                                              <span className="bg-red-700  text-[12px] text-white p-1 rounded-sm">
                                                                                $
                                                                                {slot?.revertPrice?.toFixed(
                                                                                  2
                                                                                ) ||
                                                                                  "N/A"}
                                                                              </span>
                                                                            </h3>
                                                                          </div>
                                                                        ) : (
                                                                          <div className="w-full">
                                                                            <h3 className="text-red-400  text-[12px]  text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                              <span className="">
                                                                                Until
                                                                                change
                                                                                back
                                                                              </span>
                                                                            </h3>
                                                                          </div>
                                                                        )}
                                                                      </div>
                                                                    </Card>
                                                                  )
                                                                )}
                                                              </div>
                                                            ) : (
                                                              <p className="text-gray-500 italic">
                                                                No time slots
                                                                available for
                                                                this day.
                                                              </p>
                                                            )}
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  ) : nestedItem?.previousState
                                                      ?.monthly ? (
                                                    <div className="grid grid-cols-3 gap-1">
                                                      {Object.entries(
                                                        nestedItem
                                                          ?.previousState
                                                          ?.monthlyTimeSlots ||
                                                          {}
                                                      ).map(
                                                        ([date, timeSlots]) => (
                                                          <div
                                                            key={date}
                                                            className="border rounded shadow-md bg-white "
                                                          >
                                                            <div className="bg-[#DCDCDC] border-0 m-0 p-0 rounded-t-sm">
                                                              <h4 className="text-black text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                                {date}th
                                                              </h4>
                                                            </div>
                                                            <div className="flex flex-col gap-1">
                                                              {timeSlots.map(
                                                                (
                                                                  slot,
                                                                  index
                                                                ) => (
                                                                  <Card
                                                                    key={index}
                                                                    className="flex justify-between items-center p-2 border"
                                                                  >
                                                                    <div className="flex justify-between w-full">
                                                                      <div className="w-full">
                                                                        <h3 className="flex text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                          {addHoursToTime(
                                                                            slot.startTime,
                                                                            0
                                                                          )}

                                                                          <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                            $
                                                                            {slot?.newPrice?.toFixed(
                                                                              2
                                                                            )}
                                                                          </span>
                                                                        </h3>
                                                                      </div>

                                                                      <span className="flex justify-center items-center text-gray-400">
                                                                        <FaArrowRightLong />
                                                                      </span>
                                                                      {slot.endTime ? (
                                                                        <div className="w-full">
                                                                          <div className="w-full">
                                                                            <h3 className="flex justify-between gap-2 text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                              {addHoursToTime(
                                                                                slot.endTime,
                                                                                0
                                                                              )}
                                                                              <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                                $
                                                                                {slot?.revertPrice?.toFixed(
                                                                                  2
                                                                                ) ||
                                                                                  "N/A"}
                                                                              </span>
                                                                            </h3>
                                                                          </div>
                                                                        </div>
                                                                      ) : (
                                                                        <div className="w-full">
                                                                          <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                            <span>
                                                                              Until
                                                                              change
                                                                              back
                                                                            </span>
                                                                          </h3>
                                                                        </div>
                                                                      )}
                                                                    </div>
                                                                  </Card>
                                                                )
                                                              )}
                                                            </div>
                                                          </div>
                                                        )
                                                      )}
                                                    </div>
                                                  ) : (
                                                    // single delete

                                                    <Card className="flex flex-col  p-2 border rounded-lg w-[420px]">
                                                      <div className="flex justify-center gap-1 items-center mb-2">
                                                        <h3 className="flex items-center text-[12px] gap-2 bg-[#F5F5F5] rounded px-2 py-1">
                                                          {nestedItem
                                                            ?.previousState
                                                            ?.startDate
                                                            ? formatDateTime(
                                                                nestedItem
                                                                  .previousState
                                                                  .startDate, nestedItem?.previousState?.timeZone
                                                              )
                                                            : "N/A"}
                                                          {nestedItem
                                                            ?.previousState
                                                            ?.price && (
                                                            <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                              $
                                                              {nestedItem?.previousState.price?.toFixed(
                                                                2
                                                              )}
                                                            </span>
                                                          )}
                                                        </h3>
                                                        <span className="flex justify-center items-center text-gray-400">
                                                          <FaArrowRightLong />
                                                        </span>
                                                        {nestedItem
                                                          ?.previousState
                                                          ?.endDate ? (
                                                          <h3 className="flex items-center justify-between text-[12px] gap-2 bg-[#F5F5F5] rounded px-2 py-1">
                                                            {formatDateTime(
                                                              nestedItem
                                                                .previousState
                                                                .endDate, nestedItem?.previousState?.timeZone
                                                            )}
                                                            {nestedItem
                                                              .previousState
                                                              .currentPrice && (
                                                              <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                $
                                                                {nestedItem.previousState.currentPrice?.toFixed(
                                                                  2
                                                                )}
                                                              </span>
                                                            )}
                                                          </h3>
                                                        ) : (
                                                          <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                            <span>
                                                              Until change back
                                                            </span>
                                                          </h3>
                                                        )}
                                                      </div>
                                                    </Card>
                                                  )}
                                                </>
                                              ) : nestedItem?.updatedState
                                                  ?.weekly ? (
                                                // Display updatedState data when action is not deleted
                                                <>
                                                  {nestedItem?.updatedState
                                                    ?.weekly ? (
                                                    <div className="grid grid-cols-3 gap-1">
                                                      {Object.entries(
                                                        nestedItem?.updatedState
                                                          ?.weeklyTimeSlots ||
                                                          {}
                                                      )
                                                        .filter(
                                                          ([, timeSlots]) =>
                                                            timeSlots.length > 0
                                                        ) // Filter out empty time slots
                                                        .map(
                                                          ([
                                                            day,
                                                            timeSlots,
                                                          ]) => (
                                                            <div
                                                              key={day}
                                                              className="border rounded shadow-md bg-white"
                                                            >
                                                              <div className="bg-[#DCDCDC] border-0 m-0 p-0 rounded-t-sm">
                                                                <h4 className="text-black text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                                  {
                                                                    [
                                                                      "Sunday",
                                                                      "Monday",
                                                                      "Tuesday",
                                                                      "Wednesday",
                                                                      "Thursday",
                                                                      "Friday",
                                                                      "Saturday",
                                                                    ][
                                                                      parseInt(
                                                                        day
                                                                      )
                                                                    ]
                                                                  }
                                                                </h4>
                                                              </div>
                                                              {timeSlots.length >
                                                              0 ? (
                                                                <div className="flex flex-col gap-1">
                                                                  {timeSlots.map(
                                                                    (
                                                                      slot,
                                                                      index
                                                                    ) => (
                                                                      <Card
                                                                        key={
                                                                          index
                                                                        }
                                                                        className="flex justify-between items-center p-2 border"
                                                                      >
                                                                        <div className="flex justify-between w-full">
                                                                          <div className="w-full">
                                                                            <h3 className="flex text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                              {addHoursToTime(
                                                                                slot.startTime,
                                                                                0
                                                                              )}
                                                                              <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                                $
                                                                                {slot?.newPrice?.toFixed(
                                                                                  2
                                                                                )}
                                                                              </span>
                                                                            </h3>
                                                                          </div>

                                                                          <span className="flex justify-center items-center text-gray-400">
                                                                            <FaArrowRightLong />
                                                                          </span>
                                                                          {slot.endTime ? (
                                                                            <div className="w-full">
                                                                              <h3 className="flex justify-between gap-2 text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                                {addHoursToTime(
                                                                                  slot.endTime,
                                                                                  0
                                                                                )}
                                                                                <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                                  $
                                                                                  {slot?.revertPrice?.toFixed(
                                                                                    2
                                                                                  ) ||
                                                                                    "N/A"}
                                                                                </span>
                                                                              </h3>
                                                                            </div>
                                                                          ) : (
                                                                            <div className="w-full">
                                                                              <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                                <span>
                                                                                  Until
                                                                                  change
                                                                                  back
                                                                                </span>
                                                                              </h3>
                                                                            </div>
                                                                          )}
                                                                        </div>
                                                                      </Card>
                                                                    )
                                                                  )}
                                                                </div>
                                                              ) : (
                                                                <p className="text-gray-500 italic">
                                                                  No time slots
                                                                  available for
                                                                  this day.
                                                                </p>
                                                              )}
                                                            </div>
                                                          )
                                                        )}
                                                    </div>
                                                  ) : (
                                                    <p>
                                                      No updated time slots
                                                      available.
                                                    </p>
                                                  )}
                                                </>
                                              ) : nestedItem?.updatedState
                                                  ?.monthly ? (
                                                <div className="grid grid-cols-3 gap-1">
                                                  {Object.entries(
                                                    nestedItem?.updatedState
                                                      ?.monthlyTimeSlots || {}
                                                  ).map(([date, timeSlots]) => (
                                                    <div
                                                      key={date}
                                                      className="border rounded shadow-md bg-white "
                                                    >
                                                      <div className="bg-[#DCDCDC] border-0 m-0 p-0 rounded-t-sm">
                                                        <h4 className="text-black text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                          {date}th
                                                        </h4>
                                                      </div>
                                                      <div className="flex flex-col gap-1">
                                                        {timeSlots.map(
                                                          (slot, index) => (
                                                            <Card
                                                              key={index}
                                                              className="flex justify-between items-center p-2 border"
                                                            >
                                                              <div className="flex justify-between w-full">
                                                                <div className="w-full">
                                                                  <h3 className="flex text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                    {addHoursToTime(
                                                                      slot.startTime,
                                                                      0
                                                                    )}
                                                                    <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                      $
                                                                      {slot?.newPrice?.toFixed(
                                                                        2
                                                                      )}
                                                                    </span>
                                                                  </h3>
                                                                </div>

                                                                <span className="flex justify-center items-center text-gray-400">
                                                                  <FaArrowRightLong />
                                                                </span>
                                                                {slot.endTime ? (
                                                                  <div className="w-full">
                                                                    <h3 className="flex justify-between gap-2 text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                      {addHoursToTime(
                                                                        slot.endTime,
                                                                        0
                                                                      )}
                                                                      <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                        $
                                                                        {slot?.revertPrice?.toFixed(
                                                                          2
                                                                        ) ||
                                                                          "N/A"}
                                                                      </span>
                                                                    </h3>
                                                                  </div>
                                                                ) : (
                                                                  <div className="w-full">
                                                                    <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                      <span>
                                                                        Until
                                                                        change
                                                                        back
                                                                      </span>
                                                                    </h3>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </Card>
                                                          )
                                                        )}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : nestedItem?.monthly ? (
                                                <div className="grid grid-cols-3 gap-1">
                                                  {Object.entries(
                                                    nestedItem?.monthlyTimeSlots ||
                                                      {}
                                                  ).map(([date, timeSlots]) => (
                                                    <div
                                                      key={date}
                                                      className="border rounded shadow-md bg-white "
                                                    >
                                                      <div className="bg-[#DCDCDC] border-0 m-0 p-0 rounded-t-sm">
                                                        <h4 className="text-black text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                          {date}th
                                                        </h4>
                                                      </div>
                                                      <div className="flex flex-col gap-1">
                                                        {timeSlots.map(
                                                          (slot, index) => (
                                                            <Card
                                                              key={index}
                                                              className="flex justify-between items-center p-2 border"
                                                            >
                                                              <div className="flex justify-between w-full">
                                                                <div className="w-full">
                                                                  <h3 className="flex text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                    {addHoursToTime(
                                                                      slot.startTime,
                                                                      0
                                                                    )}
                                                                    <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                      $
                                                                      {slot?.newPrice?.toFixed(
                                                                        2
                                                                      )}
                                                                    </span>
                                                                  </h3>
                                                                </div>

                                                                <span className="flex justify-center items-center text-gray-400">
                                                                  <FaArrowRightLong />
                                                                </span>
                                                                {slot.endTime ? (
                                                                  <div className="w-full">
                                                                    <h3 className="flex justify-between gap-2 text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                      {addHoursToTime(
                                                                        slot.endTime,
                                                                        0
                                                                      )}
                                                                      <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                        $
                                                                        {slot?.revertPrice?.toFixed(
                                                                          2
                                                                        ) ||
                                                                          "N/A"}
                                                                      </span>
                                                                    </h3>
                                                                  </div>
                                                                ) : (
                                                                  <div className="w-full">
                                                                    <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                      <span>
                                                                        Until
                                                                        change
                                                                        back
                                                                      </span>
                                                                    </h3>
                                                                  </div>
                                                                )}
                                                              </div>
                                                            </Card>
                                                          )
                                                        )}
                                                      </div>
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : nestedItem?.weekly ? (
                                                <div className="grid grid-cols-3 gap-1">
                                                  {Object.entries(
                                                    nestedItem?.weeklyTimeSlots ||
                                                      {}
                                                  )
                                                    .filter(
                                                      ([, timeSlots]) =>
                                                        timeSlots.length > 0
                                                    ) // Filter out empty time slots
                                                    .map(([day, timeSlots]) => (
                                                      <div
                                                        key={day}
                                                        className="border rounded shadow-md bg-white "
                                                      >
                                                        <div className="bg-[#DCDCDC] border-0 m-0 p-0 rounded-t-sm">
                                                          <h4 className="text-black text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                            {
                                                              [
                                                                "Sunday",
                                                                "Monday",
                                                                "Tuesday",
                                                                "Wednesday",
                                                                "Thursday",
                                                                "Friday",
                                                                "Saturday",
                                                              ][parseInt(day)]
                                                            }
                                                          </h4>
                                                        </div>
                                                        <div className="flex flex-col gap-1">
                                                          {timeSlots.map(
                                                            (slot, index) => (
                                                              <Card
                                                                key={index}
                                                                className="flex justify-between items-center p-2 border"
                                                              >
                                                                <div className="flex justify-between w-full">
                                                                  <div className="w-full">
                                                                    <h3 className="flex text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                      {addHoursToTime(
                                                                        slot.startTime,
                                                                        0
                                                                      )}
                                                                      <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                        $
                                                                        {slot?.newPrice?.toFixed(
                                                                          2
                                                                        )}
                                                                      </span>
                                                                    </h3>
                                                                  </div>

                                                                  <span className="flex justify-center items-center text-gray-400">
                                                                    <FaArrowRightLong />
                                                                  </span>
                                                                  {slot.endTime ? (
                                                                    <div className="w-full">
                                                                      <h3 className="flex justify-between gap-2 text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                        {addHoursToTime(
                                                                          slot.endTime,
                                                                          0
                                                                        )}
                                                                        <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                          $
                                                                          {slot?.revertPrice?.toFixed(
                                                                            2
                                                                          ) ||
                                                                            "N/A"}
                                                                        </span>
                                                                      </h3>
                                                                    </div>
                                                                  ) : (
                                                                    <div className="w-full">
                                                                      <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                        <span>
                                                                          Until
                                                                          change
                                                                          back
                                                                        </span>
                                                                      </h3>
                                                                    </div>
                                                                  )}
                                                                </div>
                                                              </Card>
                                                            )
                                                          )}
                                                        </div>
                                                      </div>
                                                    ))}
                                                </div>
                                              ) : (
                                                // single update and created

                                                <Card className="flex flex-col p-2 border rounded-lg w-[420px]">
                                                  <div className="flex justify-center gap-1 items-center mb-2">
                                                    {/* Start Date and Start Price */}
                                                    <h3 className="flex items-center text-[12px] gap-2 bg-[#F5F5F5] rounded px-2 py-1">
                                                      {nestedItem?.updatedState
                                                        ?.startDate
                                                        ? formatDateTime(
                                                            nestedItem
                                                              .updatedState
                                                              .startDate, nestedItem?.previousState?.timeZone
                                                          )
                                                        : nestedItem?.startDate
                                                        ? formatDateTime(
                                                            nestedItem.startDate,nestedItem?.timeZone
                                                          )
                                                        : "N/A"}
                                                      {nestedItem?.updatedState
                                                        ?.price && (
                                                        <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                          $
                                                          {nestedItem?.updatedState?.price?.toFixed(
                                                            2
                                                          )}
                                                        </span>
                                                      )}
                                                      {nestedItem?.price && (
                                                        <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                          $
                                                          {nestedItem?.price?.toFixed(
                                                            2
                                                          )}
                                                        </span>
                                                      )}
                                                    </h3>

                                                    {/* Arrow Icon */}
                                                    <span className="flex justify-center items-center text-gray-400">
                                                      <FaArrowRightLong />
                                                    </span>

                                                    {/* End Date and End Price */}
                                                    {nestedItem?.updatedState
                                                      ?.endDate ? (
                                                      <h3 className="flex items-center justify-between text-[12px] gap-2 bg-[#F5F5F5] rounded px-2 py-1">
                                                        {formatDateTime(
                                                          nestedItem
                                                            .updatedState
                                                            .endDate,nestedItem?.updatedState?.timeZone
                                                        )}
                                                        {nestedItem
                                                          ?.updatedState
                                                          ?.currentPrice && (
                                                          <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                            $
                                                            {nestedItem?.updatedState?.currentPrice?.toFixed(
                                                              2
                                                            )}
                                                          </span>
                                                        )}
                                                      </h3>
                                                    ) : nestedItem?.endDate ? (
                                                      <h3 className="flex items-center justify-between text-[12px] gap-2 bg-[#F5F5F5] rounded px-2 py-1">
                                                        {formatDateTime(
                                                          nestedItem.endDate, nestedItem.timeZone
                                                        )}
                                                        {nestedItem?.currentPrice && (
                                                          <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                            $
                                                            {nestedItem?.currentPrice?.toFixed(
                                                              2
                                                            )}
                                                          </span>
                                                        )}
                                                      </h3>
                                                    ) : (
                                                      <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                        <span>
                                                          Until Changed
                                                        </span>
                                                      </h3>
                                                    )}
                                                  </div>
                                                </Card>
                                              )}
                                            </div>
                                          </td>
                                          {/* user */}
                                          <td
                                            style={{
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              textAlign: "center",
                                              verticalAlign: "middle",
                                            }}
                                          >
                                            <h2>
                                              {nestedItem.userName} -{" "}
                                              {formatDateTimeCreated(
                                                nestedItem.timestamp
                                              )}
                                            </h2>
                                          </td>
                                          {/* action */}
                                          <td
                                            style={{
                                              whiteSpace: "nowrap",
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              textAlign: "center",
                                              verticalAlign: "middle",
                                            }}
                                          >
                                            {nestedItem.action === "deleted" ? (
                                              <span className="bg-red-100 px-2 py-2 text-red-700 text-xs font-semibold rounded-sm">
                                                {nestedItem.action}
                                              </span>
                                            ) : nestedItem.action ===
                                              "updated" ? (
                                              <span className="bg-blue-100 px-2 py-2 text-blue-700 text-xs font-semibold rounded-sm">
                                                {nestedItem.action}
                                              </span>
                                            ) : (
                                              <span className="bg-green-100 px-2 py-2 text-green-700 text-xs font-semibold rounded-sm">
                                                {nestedItem.action}
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                </tbody>
                              </Table>
                            )}
                          </td>
                        </tr>
                      )}
                  </>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filteredData.length > 0 && (
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
        )}
      </section>
    </div>
  );
}