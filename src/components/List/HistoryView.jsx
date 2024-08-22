import React, { useState, useEffect } from "react";
import {
  Table,
  Form,
  InputGroup,
  Spinner,
  Container,
  Row,
  Col,
  Button,
  Modal,
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
  const [filterStartDate, setFilterStartDate] = useState(null); // Date range filter start date
  const [filterEndDate, setFilterEndDate] = useState(null); // Date range filter end date
  const [editingItem, setEditingItem] = useState(null); // The item being edited
  const [editStartDate, setEditStartDate] = useState(null); // Editing start date
  const [editEndDate, setEditEndDate] = useState(null); // Editing end date

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
    setLoading(true);
    try {
      const url = selectedUser
        ? `${BASE_URL}/api/schedule/${selectedUser}/list`
        : `${BASE_URL}/api/schedule`;
      const response = await axios.get(url);

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

  const handleEditClick = (item) => {
    setEditingItem(item);
    setEditStartDate(new Date(item.startDate));
    setEditEndDate(item.endDate ? new Date(item.endDate) : null);
  };

  const handleSaveChanges = async () => {
    if (!editingItem) return;

    try {
      const updatedItem = {
        startDate: editStartDate,
        endDate: editEndDate,
      };

      await axios.put(
        `${BASE_URL}/api/schedule/${editingItem._id}`,
        updatedItem
      );

      setData((prevData) =>
        prevData.map((item) =>
          item._id === editingItem._id
            ? { ...item, startDate: editStartDate, endDate: editEndDate }
            : item
        )
      );

      setEditingItem(null);
    } catch (err) {
      console.error("Error updating schedule:", err);
    }
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
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) || // Filter by product name
        item.asin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.userName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((item) => {
      const itemDate = new Date(item.createdAt);

      if (filterStartDate && filterEndDate) {
        // Adjust the end date to include the whole day
        const adjustedEndDate = new Date(filterEndDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        return itemDate >= filterStartDate && itemDate <= adjustedEndDate;
      } else if (filterStartDate) {
        return itemDate >= filterStartDate;
      } else if (filterEndDate) {
        // Adjust the end date to include the whole day
        const adjustedEndDate = new Date(filterEndDate);
        adjustedEndDate.setHours(23, 59, 59, 999);
        return itemDate <= adjustedEndDate;
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
            <th style={{ width: "60px" }}>Status</th>
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
                  {item.userName} <p>{formatDateTime(item?.createdAt)}</p>
                </td>
                <td>{item?.firstChange ? "Price" : `Schedule`}</td>
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

      {editingItem && (
        <Modal show={true} onHide={() => setEditingItem(null)}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Duration</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="formEditStartDate">
                <Form.Label>Start Date and Time</Form.Label>
                <DatePicker
                  selected={editStartDate}
                  onChange={(date) => setEditStartDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="form-control"
                  required
                />
              </Form.Group>
              <Form.Group controlId="formEditEndDate">
                <Form.Label>End Date and Time</Form.Label>
                <DatePicker
                  selected={editEndDate}
                  onChange={(date) => setEditEndDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="form-control"
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}
