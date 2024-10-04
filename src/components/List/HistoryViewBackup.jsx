import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  InputGroup,
  Spinner,
  Container,
  Row,
  Col,
} from "react-bootstrap";
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

function addHoursToTime(timeString, hoursToAdd) {
  const [hours, minutes] = timeString.split(":").map(Number);
  const newHours = (hours + hoursToAdd) % 24; // Ensures the hour stays in 24-hour format
  const formattedHours = newHours < 10 ? `0${newHours}` : newHours; // Add leading zero if necessary
  return `${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`; // Add leading zero to minutes if necessary
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
  console.log("history timeslots: " + timeSlots);
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
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(null); // Date range filter start date
  const [filterEndDate, setFilterEndDate] = useState(null); // Date range filter end date
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);

  const baseUrl = useSelector((state) => state.baseUrl.baseUrl);

  // console.log(baseUrl);

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

      setData(sortedData);
    } catch (err) {
      setError(
        "Error fetching data: " +
          (err.response ? err.response.data.message : err.message)
      );
    } finally {
      setLoading(false);
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
    console.log("text: " + text + "type: " + type + "index: " + index);
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
    <Container fluid style={{ marginTop: "100px" }}>
      <Row className="mb-3">
        <Col md={3}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by Product Name, ASIN or SKU..."
              value={searchTerm}
              onChange={handleSearch}
              style={{ borderRadius: "4px" }}
            />
          </InputGroup>
        </Col>
        <Col md={3} className="text-right">
          <Form.Control
            as="select"
            value={selectedUser}
            onChange={handleUserChange}
            style={{ borderRadius: "4px" }}
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user._id} value={user.userName}>
                Price Updated By {user.userName}
              </option>
            ))}
          </Form.Control>
        </Col>
        <Col md={6} className="text-right">
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
        </Col>
      </Row>
      <Table
        bordered
        hover
        responsive
        style={{ width: "90%", tableLayout: "fixed" }}
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
            <th style={{ width: "90px" }}>Changed By</th>
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
              {
                /* const daysLabel = displayData?.weekly
                ? getDayLabels(displayData.daysOfWeek)
                : "";
              const datesLabel = displayData?.monthly
                ? getDateLabels(displayData?.datesOfMonth)
                : " "; */
              }
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
                <tr key={item._id} style={{ height: "50px" }}>
                  {/* image */}
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
                  {/* <td>
                    <div>
                      <span>
                        {displayData?.startDate
                          ? formatDateTime(displayData.startDate)
                          : "N/A"}{" "}
                        --{" "}
                        {displayData?.endDate
                          ? formatDateTime(displayData.endDate)
                          : "No End Date"}
                        {displayData?.currentPrice && (
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
                            ${displayData?.price || "N/A"}
                          </p>
                        </div>
                      </span> 
                      <span>
                        {displayData?.startDate
                          ? formatDateTime(displayData.startDate)
                          : "N/A"}{" "}
                        --{" "}
                        {displayData?.endDate ? (
                          formatDateTime(displayData.endDate)
                        ) : (
                          <span style={{ color: "blue" }}>No End Date</span>
                        )}
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
                            ${displayData?.price || "N/A"}
                          </p>
                        </div>
                      </span>
                    </div>
                  </td>*/}
                  {/* duration */}
                  <td>
                    <div>
                      {displayData?.weekly ? (
                        <>
                          <span style={{ color: "blue" }}>
                            Repeats Weekly on {weeklyLabel}
                          </span>

                          {/* {displayData?.currentPrice && (
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
                          )} */}
                        </>
                      ) : displayData?.monthly ? (
                        <>
                          <span style={{ color: "blue" }}>
                            Repeats Monthly on {monthlyLabel}
                          </span>
                          {/* <p>
                            {displayData.startTime
                              ? addHoursToTime(displayData.startTime, 6)
                              : "Invalid start time"}{" "}
                            -
                            {displayData.endTime
                              ? addHoursToTime(displayData.endTime, 6)
                              : "Invalid end time"}
                          </p> */}
                          {/* {displayData?.currentPrice && (
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
                          )} */}
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
                              <span style={{ color: "blue" }}>No End Date</span>
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
                              ${displayData?.price || "N/A"}
                            </p>
                          </div>
                        </>
                      )}
                      {/* <div style={{ position: "relative" }}>
                        <p
                          style={{
                            color: "green",
                            position: "absolute",
                            left: "50px",
                            bottom: "0px",
                            margin: 0,
                          }}
                        >
                          ${displayData?.price || "N/A"}
                        </p>
                      </div> */}
                    </div>
                  </td>
                  {/* Changed by  */}
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
    </Container>
  );
}
