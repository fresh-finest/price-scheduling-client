import { useState, useEffect } from "react";
import { Table, Form, InputGroup, Spinner } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import { MdContentCopy, MdCheck, MdOutlineClose } from "react-icons/md";
import { FaArrowRight } from 'react-icons/fa'; // Example arrow icon

import "react-datepicker/dist/react-datepicker.css";
import "./HistoryView.css";
import { useSelector } from "react-redux";
import { daysOptions, datesOptions } from "../../utils/staticValue";

import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { Card } from "../ui/card";
import { FaArrowRightLong } from "react-icons/fa6";
const BASE_URL = "http://localhost:3000";

// const BASE_URL = `https://api.priceobo.com`;

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

// const displayWeekdays = (timeSlots) => {
//   if (!timeSlots || Object.keys(timeSlots).length === 0) {
//     return <p>No time slots available</p>; // Handle undefined or null timeSlots
//   }

//   // Array of weekdays to display based on your desired keys
//   const weekdaysToDisplay = [1, 2, 3, 4, 5]; // Example: Monday (1), Tuesday (2), ..., Friday (5)

//   const displayedWeekdays = weekdaysToDisplay
//     .filter((day) => day in timeSlots) // Ensure the day exists in timeSlots
//     .map((day) => getDayLabelFromNumber(day)) // Get the day label
//     .join(", "); // Join with a comma

//   console.log("displayedWeekDays", displayedWeekdays);

//   return <p>{displayedWeekdays}</p>; // Return the formatted string
// };

const displayWeekdays = (timeSlots) => {
  if (!timeSlots || Object.keys(timeSlots).length === 0) {
    return <p>No time slots available</p>; // Handle undefined or null timeSlots
  }

  // Array of weekdays to display based on your desired keys
  const weekdaysToDisplay = [0, 1, 2, 3, 4, 5, 6]; // Example: Monday (1), Tuesday (2), ..., Friday (5)

  const displayedWeekdays = weekdaysToDisplay
    .filter((day) => day in timeSlots) // Ensure the day exists in timeSlots
    .map((day) => getDayLabelFromNumber(day)); // Get the day label as an array

 

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
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [nestedData, setNestedData] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingNested, setLoadingNested] = useState(false);
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(null); // Date range filter start date
  const [filterEndDate, setFilterEndDate] = useState(null); // Date range filter end date
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [lengthNested, setLengthNested] = useState(null)


  const baseUrl = useSelector((state) => state.baseUrl.baseUrl);

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
    fetchData();
  }, [selectedUser]);

  const fetchData = async () => {
    const url = selectedUser
      ? `${BASE_URL}/api/schedule/${selectedUser}/list`
      : `${BASE_URL}/api/history`;
    setLoading(true);
    try {
      const response = await axios.get(url);
      const sortedData = Array.isArray(response.data.result)
        ? response.data.result.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        : [];

      setData(sortedData.filter((item) => item.action === "created"));
      const nestedDataLengths = {};
    // await Promise.all(
    //   sortedData.map(async (item) => {
    //     try {
    //       const nestedResponse = await axios.get(
    //         `${BASE_URL}/api/history/${item.scheduleId}`
    //       );
    //       nestedDataLengths[item.scheduleId] = nestedResponse.data.length || 0;
    //     } catch (err) {
    //       console.error(
    //         `Error fetching nested data for scheduleId ${item.scheduleId}:`,
    //         err
    //       );
    //       nestedDataLengths[item.scheduleId] = 0; // Default to 0 if there's an error
    //     }
    //   })
    // );

    // setLengthNested(nestedDataLengths);
     
    } catch (err) {
      setError(
        "Error fetching data: " +
          (err.response ? err.response.data.message : err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  console.log("nested length"+JSON.stringify(lengthNested))

  const fetchNestedData = async (scheduleId) => {
    setLoadingNested(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/history/${scheduleId}`);
      setNestedData((prevData) => ({
        ...prevData,
        [scheduleId]: response.data,
      }));
      
      console.log("len"+response.data.length)
    } catch (err) {
      console.error("Error fetching nested data: ", err);
    } finally {
      setLoadingNested(false);
    }
  };



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

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleClearInput = () => {
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

  const formatDateTime = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
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
    });

  if (loading)
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
  if (error) return <div style={{ marginTop: "100px" }}>{error}</div>;

  return (
    <div className="bg-white">
      <div className="bg-white fixed top-0 left-0 w-full ml-[10%] mr-[8%] z-10 p-4 show-md">
        <InputGroup className="max-w-[500px] absolute top-2 ">
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
        <div className="absolute top-2 right-[25%]">
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
        </div>
        <div className="absolute top-2 right-[12%]">
          <DatePicker
            selected={filterStartDate}
            onChange={handleFilterDateChange}
            startDate={filterStartDate}
            endDate={filterEndDate}
            selectsRange
            isClearable
            placeholderText="Select a date range"
            className="form-control"
            style={{ borderRadius: "4px" }}
          />
        </div>
      </div>
      <Table
        // hover
        responsive
        style={{ tableLayout: "fixed" }}
        className="mt-14 historyCustomTable "
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
                width: "80px",
                position: "sticky", // Sticky header
                textAlign: "center",
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Image
            </th>
            <th
              className="tableHeader"
              style={{
                width: "300px",
                position: "sticky", // Sticky header
                textAlign: "center",
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
                borderRight: "2px solid #C3C6D4",
              }}
            >
              Type
            </th>
            <th
              className="tableHeader"
              style={{
                width: "200px",
                position: "sticky", // Sticky header
                textAlign: "center",
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
                borderRight: "2px solid #C3C6D4",
              }}
            >
              User
            </th>
            <th
              className="tableHeader"
              style={{
                width: "60px",
                position: "sticky", // Sticky header
                textAlign: "center",
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
            filteredData.map((item, index) => {
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
                    style={{
                      height: "50px",
                      cursor: "pointer",
                      margin: "20px 0",
                    }}
                    onClick={() => handleRowClick(item.scheduleId)}
                    // className="borderless spacer-row"
                  >
                 
                    {/* image  */}
                    <td
                      style={{
                        cursor: "pointer",
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
                        cursor: "pointer",
                        height: "40px",
                        textAlign: "start",
                        verticalAlign: "middle",
                      }}
                    >
                      
                      {/* {lengthNested[item.scheduleId] > 1 ? <FaArrowRight /> : null} */}
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
                              }}
                            />
                          ) : (
                            <MdContentCopy
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(displayData.asin, "asin", index);
                              }}
                              style={{ marginLeft: "5px", cursor: "pointer" }}
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
                              }}
                            />
                          ) : (
                            <MdContentCopy
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(displayData.sku, "sku", index);
                              }}
                              style={{ marginLeft: "5px", cursor: "pointer" }}
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
                        cursor: "pointer",
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
                        cursor: "pointer",
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
                                    ? formatDateTime(displayData.startDate)
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
                                      {formatDateTime(displayData.endDate)}
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
                        cursor: "pointer",
                        height: "40px",
                      }}
                    >
                      {item.userName} <p>{formatDateTime(item.timestamp)}</p>
                    </td>

                    {/* action */}
                    <td
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        textAlign: "center",
                        verticalAlign: "middle",
                        cursor: "pointer",
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

                  {expandedRow === item.scheduleId && (
                    <tr>
                      <td colSpan="5">
                        {loadingNested && <Spinner animation="border" />}
                        {!loadingNested && nestedData[item.scheduleId] && (
                          <Table className="ml-[9%]" size="sm">
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
                                    <tr key={nestedItem._id}>
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
                                          {nestedItem?.action === "deleted" ? (
                                            // Display previousState data when action is deleted
                                            <>
                                              {nestedItem?.previousState
                                                ?.weekly ? (
                                                <div className="grid grid-cols-3 gap-1">
                                                  {Object.entries(
                                                    nestedItem?.previousState
                                                      ?.weeklyTimeSlots || {}
                                                  ).map(([day, timeSlots]) => (
                                                    <div
                                                      key={day}
                                                      className=" border rounded shadow-md bg-white"
                                                    >
                                                      <div className="bg-[#707070] border-0 m-0 p-0 rounded-t-sm">
                                                        {/* Array of day names */}
                                                        <h4 className=" text-white text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                          {` ${
                                                            [
                                                              "Sunday",
                                                              "Monday",
                                                              "Tuesday",
                                                              "Wednesday",
                                                              "Thursday",
                                                              "Friday",
                                                              "Saturday",
                                                            ][parseInt(day)]
                                                          }`}
                                                        </h4>
                                                      </div>
                                                      {timeSlots.length > 0 ? (
                                                        <div className="flex flex-col gap-1">
                                                          {timeSlots.map(
                                                            (slot, index) => (
                                                              <Card
                                                                key={index}
                                                                className="flex justify-between items-center p-2  border "
                                                              >
                                                                <div className="flex justify-between w-full gap-1">
                                                                  <div className="w-full">
                                                                    <h3 className="flex  text-[12px] gap-2 justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                                      {addHoursToTime(
                                                                        slot.startTime,
                                                                        6
                                                                      )}

                                                                      <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                        $
                                                                        {
                                                                          slot.newPrice
                                                                        }
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
                                                                          6
                                                                        )}

                                                                        <span className="bg-red-700  text-[12px] text-white p-1 rounded-sm">
                                                                          $
                                                                          {slot.revertPrice ||
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
                                                          available for this
                                                          day.
                                                        </p>
                                                      )}
                                                    </div>
                                                  ))}
                                                </div>
                                              ) : nestedItem?.previousState
                                                  ?.monthly ? (
                                                <div className="grid grid-cols-3 gap-1">
                                                  {Object.entries(
                                                    nestedItem?.previousState
                                                      ?.monthlyTimeSlots || {}
                                                  ).map(([date, timeSlots]) => (
                                                    <div
                                                      key={date}
                                                      className="border rounded shadow-md bg-white "
                                                    >
                                                      <div className="bg-[#707070] border-0 m-0 p-0 rounded-t-sm">
                                                        <h4 className="text-white text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
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
                                                                      6
                                                                    )}
                                                                    <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                      ${" "}
                                                                      {
                                                                        slot.newPrice
                                                                      }
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
                                                                          6
                                                                        )}
                                                                        <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                          ${" "}
                                                                          {slot.revertPrice ||
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
                                                  ))}
                                                </div>
                                              ) : (
                                                // single delete

                                                <Card className="flex flex-col  p-2 border rounded-lg w-[420px]">
                                                  <div className="flex justify-center gap-1 items-center mb-2">
                                                    <h3 className="flex items-center text-[12px] gap-2 bg-[#F5F5F5] rounded px-2 py-1">
                                                      {nestedItem?.previousState
                                                        ?.startDate
                                                        ? formatDateTime(
                                                            nestedItem
                                                              .previousState
                                                              .startDate
                                                          )
                                                        : "N/A"}
                                                      {nestedItem?.previousState
                                                        ?.price && (
                                                        <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                          $
                                                          {nestedItem.previousState.price?.toFixed(
                                                            2
                                                          )}
                                                        </span>
                                                      )}
                                                    </h3>
                                                    <span className="flex justify-center items-center text-gray-400">
                                                      <FaArrowRightLong />
                                                    </span>
                                                    {nestedItem?.previousState
                                                      ?.endDate ? (
                                                      <h3 className="flex items-center justify-between text-[12px] gap-2 bg-[#F5F5F5] rounded px-2 py-1">
                                                        {formatDateTime(
                                                          nestedItem
                                                            .previousState
                                                            .endDate
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
                                                ?.weeklyTimeSlots ? (
                                                <div className="grid grid-cols-3 gap-1">
                                                  {Object.entries(
                                                    nestedItem?.updatedState
                                                      ?.weeklyTimeSlots || {}
                                                  ).map(([day, timeSlots]) => (
                                                    <div
                                                      key={day}
                                                      className="border rounded shadow-md bg-white"
                                                    >
                                                      <div className="bg-[#707070] border-0 m-0 p-0 rounded-t-sm">
                                                        <h4 className="text-white text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
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
                                                      {timeSlots.length > 0 ? (
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
                                                                        6
                                                                      )}
                                                                      <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                        ${" "}
                                                                        {
                                                                          slot.newPrice
                                                                        }
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
                                                                          6
                                                                        )}
                                                                        <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                          ${" "}
                                                                          {slot.revertPrice ||
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
                                                          available for this
                                                          day.
                                                        </p>
                                                      )}
                                                    </div>
                                                  ))}
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
                                                  <div className="bg-[#707070] border-0 m-0 p-0 rounded-t-sm">
                                                    <h4 className="text-white text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
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
                                                                  6
                                                                )}
                                                                <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                  ${" "}
                                                                  {
                                                                    slot.newPrice
                                                                  }
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
                                                                    6
                                                                  )}
                                                                  <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                    ${" "}
                                                                    {slot.revertPrice ||
                                                                      "N/A"}
                                                                  </span>
                                                                </h3>
                                                              </div>
                                                            ) : (
                                                              <div className="w-full">
                                                                <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                  <span>
                                                                    Until change
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
                                                  <div className="bg-[#707070] border-0 m-0 p-0 rounded-t-sm">
                                                    <h4 className="text-white text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
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
                                                                  6
                                                                )}
                                                                <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                  ${" "}
                                                                  {
                                                                    slot.newPrice
                                                                  }
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
                                                                    6
                                                                  )}
                                                                  <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                    ${" "}
                                                                    {slot.revertPrice ||
                                                                      "N/A"}
                                                                  </span>
                                                                </h3>
                                                              </div>
                                                            ) : (
                                                              <div className="w-full">
                                                                <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                  <span>
                                                                    Until change
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
                                              ).map(([day, timeSlots]) => (
                                                <div
                                                  key={day}
                                                  className="border rounded shadow-md bg-white "
                                                >
                                                  <div className="bg-[#707070] border-0 m-0 p-0 rounded-t-sm">
                                                    <h4 className="text-white text-center text-xs py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
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
                                                                  6
                                                                )}
                                                                <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                                                  ${" "}
                                                                  {
                                                                    slot.newPrice
                                                                  }
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
                                                                    6
                                                                  )}
                                                                  <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                                                    ${" "}
                                                                    {slot.revertPrice ||
                                                                      "N/A"}
                                                                  </span>
                                                                </h3>
                                                              </div>
                                                            ) : (
                                                              <div className="w-full">
                                                                <h3 className="text-red-400 text-[12px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                                                  <span>
                                                                    Until change
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
                                                        nestedItem.updatedState
                                                          .startDate
                                                      )
                                                    : nestedItem?.startDate
                                                    ? formatDateTime(
                                                        nestedItem.startDate
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
                                                      nestedItem.updatedState
                                                        .endDate
                                                    )}
                                                    {nestedItem?.updatedState
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
                                                      nestedItem.endDate
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
                                                    <span>Until Changed</span>
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
                                          {formatDateTime(nestedItem.timestamp)}
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
                                        ) : nestedItem.action === "updated" ? (
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
              <td colSpan="7" className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
}