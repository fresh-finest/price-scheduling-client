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
import "react-datepicker/dist/react-datepicker.css";
import "./HistoryView.css";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com'
const BASE_URL = `https://quiet-stream-22437-07fa6bb134e0.herokuapp.com/http://34.205.73.65:3000`;

// Example API call
fetch(`${BASE_URL}/api/history`)
  .then(response => response.json())
  .then(data => {
    console.log(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });


const daysOptions = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tues', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thurs', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

export default function HistoryView() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStartDate, setFilterStartDate] = useState(null); // Date range filter start date
  const [filterEndDate, setFilterEndDate] = useState(null); // Date range filter end date

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
      // const response = await axios.get(`${BASE_URL}/api/history`);
      const response = await axios.get(url);
      const sortedData = Array.isArray(response.data.result)
      ? response.data.result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
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

  

  const getDisplayData = (item) => {
    if (item.action === "updated") {
      return item.updatedState || item.previousState || {};
    }
    return item;
  };

  const getDayLabels = (daysOfWeek) => {
    return daysOfWeek
      .map((day) => daysOptions.find((option) => option.value === day)?.label)
      .join(', ');
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
      <div style={{ marginTop: "100px" }}>
        <Spinner animation="border" /> Loading...
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
            filteredData.map((item) => {
              const displayData = getDisplayData(item);
              const daysLabel = displayData?.weekly
                ? getDayLabels(displayData.daysOfWeek)
                : '';

              return (
                <tr key={item._id} style={{ height: "50px" }}>
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
                  <td
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {displayData?.title || "N/A"}
                    <div>
                      <span className="bubble-text">
                        {displayData?.asin || "N/A"}
                      </span>{" "}
                      <span className="bubble-text">
                        {displayData?.sku || "N/A"}
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
                  <td>
                    <div>
                      {displayData?.weekly ? (
                        <>
                          <span style={{ color: "blue" }}>
                            Repeats Weekly on {daysLabel}
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
                              ${displayData.currentPrice}
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
                        </>
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
                    </div>
                  </td>
                  <td>
                    {item.userName} <p>{formatDateTime(item.timestamp)}</p>
                  </td>
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
