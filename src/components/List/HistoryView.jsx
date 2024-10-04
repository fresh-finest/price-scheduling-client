import { useState, useEffect } from "react";
import { Table, Form, InputGroup, Spinner } from "react-bootstrap";
import axios from "axios";
import DatePicker from "react-datepicker";
import { MdContentCopy, MdCheck } from "react-icons/md";

import "react-datepicker/dist/react-datepicker.css";
import "./HistoryView.css";
import { useSelector } from "react-redux";
import { daysOptions, datesOptions } from "../../utils/staticValue";

import priceoboIcon from "../../assets/images/pricebo-icon.png";
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

// function addHoursToTime(timeString, hoursToAdd) {
//   const [hours, minutes] = timeString.split(":").map(Number);
//   const newHours = (hours + hoursToAdd) % 24; // Ensures the hour stays in 24-hour format
//   const formattedHours = newHours < 10 ? `0${newHours}` : newHours; // Add leading zero if necessary
//   return `${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`; // Add leading zero to minutes if necessary
// }
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
    return <p>No time slots available</p>; // Add this check to handle undefined or null timeSlots
  }
  return Object.entries(timeSlots).map(([key, slots]) => (
    <div key={key}>
      <strong>
        {isWeekly
          ? getDayLabelFromNumber(Number(key))
          : getDateLabelFromNumber(Number(key))}
      </strong>
      {slots.map((slot, index) => (
        <p key={index}>
          {addHoursToTime(slot.startTime, addHours)} -{" "}
          {addHoursToTime(slot.endTime, addHours)} New Price: {slot?.newPrice} -
          End Price: {slot?.revertPrice}
        </p>
      ))}
    </div>
  ));
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
    } catch (err) {
      setError(
        "Error fetching data: " +
          (err.response ? err.response.data.message : err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchNestedData = async (scheduleId) => {
    console.log("sd: " + scheduleId);
    setLoadingNested(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/history/${scheduleId}`);
      setNestedData((prevData) => ({
        ...prevData,
        [scheduleId]: response.data,
      }));
    } catch (err) {
      console.error("Error fetching nested data: ", err);
    } finally {
      setLoadingNested(false);
    }
  };

  const handleRowClick = (scheduleId) => {
    console.log("sd handle: " + scheduleId);
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
    <div className="">
      <div className="">
        <InputGroup className="max-w-[350px] absolute top-[1.2%] ">
          <Form.Control
            type="text"
            placeholder="Search by Product Name, ASIN or SKU..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ borderRadius: "0px" }}
            className="custom-input"
          />
        </InputGroup>
        <div className="absolute top-[1.5%] right-[25%]">
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
        <div className="absolute top-[1.5%] right-[12%]">
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
        bordered
        hover
        responsive
        style={{ tableLayout: "fixed" }}
        className="mt-14"
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
            <th style={{ width: "80px" }}>Image</th>
            <th style={{ width: "300px" }}>Product Details</th>
            <th style={{ width: "200px" }}>Duration</th>
            <th style={{ width: "90px" }}>User</th>
            <th style={{ width: "60px" }}>Action</th>
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
                ? displayTimeSlotsWithDayLabels(
                    displayData?.weeklyTimeSlots,
                    6,
                    true
                  )
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
                    style={{ height: "50px", cursor: "pointer" }}
                    onClick={() => handleRowClick(item.scheduleId)}
                  >
                    {/* image  */}
                    <td>
                      <img
                        src={displayData?.imageURL || "placeholder-image-url"}
                        alt=""
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                        }}
                      />
                    </td>
                    {/* product details */}
                    <td
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                    {/* duration */}
                    <td>
                      <div>
                        {displayData?.weekly ? (
                          <>
                            <span style={{ color: "blue" }}>
                              Repeats Weekly on {weeklyLabel}
                            </span>

                            {displayData?.currentPrice && (
                              <p
                                style={{
                                  margin: 0,
                                  color: "green",
                                  textAlign: "right",
                                  marginRight: "50px",
                                }}
                              >
                                Will Revert to :${displayData.currentPrice}
                              </p>
                            )}
                          </>
                        ) : displayData?.monthly ? (
                          <>
                            <span style={{ color: "blue" }}>
                              Repeats Monthly on {monthlyLabel}
                            </span>

                            {displayData?.currentPrice && (
                              <p
                                style={{
                                  margin: 0,
                                  color: "green",
                                  textAlign: "right",
                                  marginRight: "50px",
                                }}
                              >
                                Will Revert to :${displayData.currentPrice}
                              </p>
                            )}
                          </>
                        ) : (
                          <>
                            <span>
                              {displayData?.startDate
                                ? formatDateTime(displayData.startDate)
                                : "N/A"}{" "}
                              --{" "}
                              {displayData?.endDate ? (
                                formatDateTime(displayData.endDate)
                              ) : (
                                <span style={{ color: "blue" }}>
                                  No End Date
                                </span>
                              )}
                            </span>

                            {displayData?.endDate ? (
                              displayData?.currentPrice && (
                                <p
                                  style={{
                                    margin: 0,
                                    color: "green",
                                    textAlign: "right",
                                    marginRight: "50px",
                                  }}
                                >
                                  ${displayData.currentPrice}
                                </p>
                              )
                            ) : (
                              <p
                                style={{
                                  margin: 0,
                                  color: "orange",
                                  textAlign: "right",
                                  marginRight: "50px",
                                }}
                              >
                                Until Changed
                              </p>
                            )}
                            <div style={{ position: "relative" }}>
                              <p
                                style={{
                                  color: "green",
                                  position: "absolute",
                                  left: "50px",
                                  bottom: "0px",
                                  margin: 0,
                                }}
                              >
                                ${displayData.price || "N/A"}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* user */}
                    <td>
                      {item.userName} <p>{formatDateTime(item.timestamp)}</p>
                    </td>

                    {/* action */}
                    <td>
                      {item.action === "deleted" ? (
                        <span style={{ color: "red" }}>Deleted</span>
                      ) : item.action === "updated" ? (
                        <span style={{ color: "orange" }}>Updated</span>
                      ) : (
                        <span>Created</span>
                      )}
                    </td>
                  </tr>

                  {expandedRow === item.scheduleId && (
                    <tr>
                      <td colSpan="4">
                        {loadingNested && <Spinner animation="border" />}
                        {!loadingNested && nestedData[item.scheduleId] && (
                          <Table bordered size="sm">
                            <thead>
                              <tr>
                                {/* <th>Image</th> */}
                                <th>Duration</th>
                                <th>Action</th>
                                {/* <th>Product Details</th> */}
                                <th>User</th>
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
                                    nestedItem.action !== "created"
                                )
                                .map((nestedItem) => {
                                  // Log nestedItem to the console
                                  console.log("nested Item", nestedItem);

                                  // Return JSX
                                  return (
                                    <tr key={nestedItem._id}>
                                      {/* duration */}
                                      {/* <td>
                                        {formatDateTime(nestedItem.timestamp)}
                                      </td> */}

                                      <td>
                                        <div>
                                          {nestedItem?.action === "deleted" ? (
                                            // Display previousState data when action is deleted
                                            <>
                                              {nestedItem?.previousState
                                                ?.weekly ? (
                                                <>
                                                  {Object.entries(
                                                    nestedItem?.previousState
                                                      ?.weeklyTimeSlots || {}
                                                  ).map(([day, timeSlots]) => (
                                                    <div key={day}>
                                                      <p style={{ margin: 0 }}>
                                                        Day {day}:
                                                        {timeSlots.map(
                                                          (slot, index) => (
                                                            <span key={index}>
                                                              {" "}
                                                              {addHoursToTime(
                                                                slot.startTime,
                                                                6
                                                              )}{" "}
                                                              -{" "}
                                                              {addHoursToTime(
                                                                slot.endTime,
                                                                6
                                                              )}
                                                            </span>
                                                          )
                                                        )}
                                                      </p>
                                                      {timeSlots.map(
                                                        (slot, index) => (
                                                          <p
                                                            key={index}
                                                            style={{
                                                              margin: 0,
                                                              color: "green",
                                                              textAlign:
                                                                "right",
                                                              marginRight:
                                                                "50px",
                                                            }}
                                                          >
                                                            New Price: $
                                                            {slot.newPrice} |
                                                            Reverts to: $
                                                            {slot.revertPrice}
                                                          </p>
                                                        )
                                                      )}
                                                    </div>
                                                  ))}
                                                </>
                                              ) : nestedItem?.previousState
                                                  ?.monthly ? (
                                                <>
                                                  {Object.entries(
                                                    nestedItem?.previousState
                                                      ?.monthlyTimeSlots || {}
                                                  ).map(([date, timeSlots]) => (
                                                    <div key={date}>
                                                      <p style={{ margin: 0 }}>
                                                        Day {date}:
                                                        {timeSlots.map(
                                                          (slot, index) => (
                                                            <span key={index}>
                                                              {" "}
                                                              {addHoursToTime(
                                                                slot.startTime,
                                                                6
                                                              )}{" "}
                                                              -{" "}
                                                              {addHoursToTime(
                                                                slot.endTime,
                                                                6
                                                              )}
                                                            </span>
                                                          )
                                                        )}
                                                      </p>
                                                      {timeSlots.map(
                                                        (slot, index) => (
                                                          <p
                                                            key={index}
                                                            style={{
                                                              margin: 0,
                                                              color: "green",
                                                              textAlign:
                                                                "right",
                                                              marginRight:
                                                                "50px",
                                                            }}
                                                          >
                                                            New Price: $
                                                            {slot.newPrice} |
                                                            Reverts to: $
                                                            {slot.revertPrice}
                                                          </p>
                                                        )
                                                      )}
                                                    </div>
                                                  ))}
                                                </>
                                              ) : (
                                                <>
                                                  <span>
                                                    {nestedItem?.previousState
                                                      ?.startDate
                                                      ? formatDateTime(
                                                          nestedItem
                                                            .previousState
                                                            ?.startDate
                                                        )
                                                      : "N/A"}{" "}
                                                    --{" "}
                                                    {nestedItem?.previousState
                                                      ?.endDate ? (
                                                      formatDateTime(
                                                        nestedItem.previousState
                                                          ?.endDate
                                                      )
                                                    ) : (
                                                      <span
                                                        style={{
                                                          color: "blue",
                                                        }}
                                                      >
                                                        No End Date
                                                      </span>
                                                    )}
                                                  </span>
                                                  {nestedItem?.previousState
                                                    ?.endDate ? (
                                                    nestedItem?.previousState
                                                      ?.currentPrice && (
                                                      <p
                                                        style={{
                                                          margin: 0,
                                                          color: "green",
                                                          textAlign: "right",
                                                          marginRight: "50px",
                                                        }}
                                                      >
                                                        $
                                                        {
                                                          nestedItem
                                                            ?.previousState
                                                            ?.currentPrice
                                                        }
                                                      </p>
                                                    )
                                                  ) : (
                                                    <p
                                                      style={{
                                                        margin: 0,
                                                        color: "orange",
                                                        textAlign: "right",
                                                        marginRight: "50px",
                                                      }}
                                                    >
                                                      Until Changed
                                                    </p>
                                                  )}
                                                  <div
                                                    style={{
                                                      position: "relative",
                                                    }}
                                                  >
                                                    <p
                                                      style={{
                                                        color: "green",
                                                        position: "absolute",
                                                        left: "50px",
                                                        bottom: "0px",
                                                        margin: 0,
                                                      }}
                                                    >
                                                      $
                                                      {nestedItem?.previousState
                                                        ?.price || "N/A"}
                                                    </p>
                                                  </div>
                                                </>
                                              )}
                                            </>
                                          ) : nestedItem?.updatedState
                                              ?.weekly ? (
                                            // Display updatedState data when action is not deleted
                                            <>
                                              {Object.entries(
                                                nestedItem?.updatedState
                                                  ?.weeklyTimeSlots || {}
                                              ).map(([day, timeSlots]) => (
                                                <div key={day}>
                                                  <p style={{ margin: 0 }}>
                                                    Day {day}:
                                                    {timeSlots.map(
                                                      (slot, index) => (
                                                        <span key={index}>
                                                          {" "}
                                                          {addHoursToTime(
                                                            slot.startTime,
                                                            6
                                                          )}{" "}
                                                          -{" "}
                                                          {addHoursToTime(
                                                            slot.endTime,
                                                            6
                                                          )}
                                                        </span>
                                                      )
                                                    )}
                                                  </p>
                                                  {timeSlots.map(
                                                    (slot, index) => (
                                                      <p
                                                        key={index}
                                                        style={{
                                                          margin: 0,
                                                          color: "green",
                                                          textAlign: "right",
                                                          marginRight: "50px",
                                                        }}
                                                      >
                                                        New Price: $
                                                        {slot.newPrice} |
                                                        Reverts to: $
                                                        {slot.revertPrice}
                                                      </p>
                                                    )
                                                  )}
                                                </div>
                                              ))}
                                            </>
                                          ) : nestedItem?.updatedState
                                              ?.monthly ? (
                                            <>
                                              {Object.entries(
                                                nestedItem?.updatedState
                                                  ?.monthlyTimeSlots || {}
                                              ).map(([date, timeSlots]) => (
                                                <div key={date}>
                                                  <p style={{ margin: 0 }}>
                                                    Day {date}:
                                                    {timeSlots.map(
                                                      (slot, index) => (
                                                        <span key={index}>
                                                          {" "}
                                                          {addHoursToTime(
                                                            slot.startTime,
                                                            6
                                                          )}{" "}
                                                          -{" "}
                                                          {addHoursToTime(
                                                            slot.endTime,
                                                            6
                                                          )}
                                                        </span>
                                                      )
                                                    )}
                                                  </p>
                                                  {timeSlots.map(
                                                    (slot, index) => (
                                                      <p
                                                        key={index}
                                                        style={{
                                                          margin: 0,
                                                          color: "green",
                                                          textAlign: "right",
                                                          marginRight: "50px",
                                                        }}
                                                      >
                                                        New Price: $
                                                        {slot.newPrice} |
                                                        Reverts to: $
                                                        {slot.revertPrice}
                                                      </p>
                                                    )
                                                  )}
                                                </div>
                                              ))}
                                            </>
                                          ) : (
                                            <>
                                              <span>
                                                {nestedItem?.updatedState
                                                  ?.startDate
                                                  ? formatDateTime(
                                                      nestedItem.updatedState
                                                        ?.startDate
                                                    )
                                                  : "N/A"}{" "}
                                                --{" "}
                                                {nestedItem?.updatedState
                                                  ?.endDate ? (
                                                  formatDateTime(
                                                    nestedItem.updatedState
                                                      ?.endDate
                                                  )
                                                ) : (
                                                  <span
                                                    style={{ color: "blue" }}
                                                  >
                                                    No End Date
                                                  </span>
                                                )}
                                              </span>
                                              {nestedItem?.updatedState
                                                ?.endDate ? (
                                                nestedItem?.updatedState
                                                  ?.currentPrice && (
                                                  <p
                                                    style={{
                                                      margin: 0,
                                                      color: "green",
                                                      textAlign: "right",
                                                      marginRight: "50px",
                                                    }}
                                                  >
                                                    $
                                                    {
                                                      nestedItem?.updatedState
                                                        ?.currentPrice
                                                    }
                                                  </p>
                                                )
                                              ) : (
                                                <p
                                                  style={{
                                                    margin: 0,
                                                    color: "orange",
                                                    textAlign: "right",
                                                    marginRight: "50px",
                                                  }}
                                                >
                                                  Until Changed
                                                </p>
                                              )}
                                              <div
                                                style={{ position: "relative" }}
                                              >
                                                <p
                                                  style={{
                                                    color: "green",
                                                    position: "absolute",
                                                    left: "50px",
                                                    bottom: "0px",
                                                    margin: 0,
                                                  }}
                                                >
                                                  $
                                                  {nestedItem?.updatedState
                                                    ?.price || "N/A"}
                                                </p>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      </td>

                                      {/* action */}
                                      <td>{nestedItem.action}</td>

                                      {/* user */}
                                      <td>
                                        <h2>
                                          {nestedItem.userName} -{" "}
                                          {formatDateTime(nestedItem.timestamp)}
                                        </h2>
                                      </td>

                                      {/* <td>
            {nestedItem.previousState ? (
              <>
                <p>Price: ${nestedItem.previousState.price}</p>
                <p>Title: {nestedItem.previousState.title}</p>
              </>
            ) : (
              "N/A"
            )}
          </td> */}
                                      {/* <td>
            {nestedItem.updatedState ? (
              <>
                <p>Price: ${nestedItem.updatedState.price}</p>
                <p>Title: {nestedItem.updatedState.title}</p>
              </>
            ) : (
              "N/A"
            )}
          </td> */}
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
