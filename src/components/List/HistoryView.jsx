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

const BASE_URL = "https://dps-server-b829cf5871b7.herokuapp.com";

export default function HistoryView() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState(null); // State for start date
  const [endDate, setEndDate] = useState(null); // State for end date

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
    const fetchData = async () => {
      setLoading(true);
      try {
        const url = selectedUser
          ? `${BASE_URL}/api/schedule/${selectedUser}/list`
          : `${BASE_URL}/api/schedule`;
        const response = await axios.get(url);

        // Sort data by createdAt in descending order
        const sortedData = response.data.result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

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

    fetchData();
  }, [selectedUser]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
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

  const filteredData = data
    .filter(
      (item) =>
        item.asin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => {
      const itemDate = new Date(item.createdAt);
      if (startDate && endDate) {
        return itemDate >= startDate && itemDate <= endDate;
      } else if (startDate) {
        return itemDate >= startDate;
      } else if (endDate) {
        return itemDate <= endDate;
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
              placeholder="Search by ASIN or SKU..."
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
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
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
            filteredData.map((item) => (
              <tr key={item._id} style={{ height: "50px" }}>
                <td>
                  <img
                    src={item?.imageURL}
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
                  {item.title}
                  <div>
                    <span className="bubble-text">{item.asin}</span>{" "}
                    <span className="bubble-text">{item.sku}</span>
                  </div>
                </td>
                <td>
                  <div>
                    <span>
                      {formatDateTime(item.startDate)} --
                      {item.endDate ? (
                        <>
                          {formatDateTime(item.endDate)}
                          {item.currentPrice && (
                            <p
                              style={{
                                margin: 0,
                                color: "green",
                                textAlign: "right",
                                marginRight: "50px",
                              }}
                            >
                              ${item.currentPrice}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <span>No End Date</span>
                          <p
                            style={{
                              margin: 0,
                              color: "green",
                              textAlign: "right",
                              marginRight: "50px",
                            }}
                          >
                            Until Change
                          </p>
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
                          ${item.price}
                        </p>
                      </div>
                    </span>
                  </div>
                </td>

                <td>
                  {item.userName}{" "}
                  <p>{formatDateTime(item?.createdAt)}</p>
                </td>
              </tr>
            ))
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
