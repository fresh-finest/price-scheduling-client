import React, { useState, useEffect } from "react";
import { Table, Form, InputGroup, Spinner, Container, Row, Col } from "react-bootstrap";
import axios from "axios";

const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com';
// const BASE_URL = 'http://localhost:3000';


export default function HistoryView() {
  const [data, setData] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/user`);
        setUsers(response.data.result); // Assuming the response is an array of users
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
        setData(response.data.result);
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

  console.log(selectedUser);
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const filteredData = data.filter(
    (item) =>
      item.asin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div style={{ marginTop: "100px" }}>
        <Spinner animation="border" /> Loading...
      </div>
    );
  if (error) return <div style={{ marginTop: "100px" }}>{error}</div>;

  return (
    <Container style={{ marginTop: "100px" }}>
      <Row className="mb-3">
        <Col md={3}>
          <InputGroup>
            <Form.Control
              type="text"
              placeholder="Search by ASIN or SKU..."
              value={searchTerm}
              onChange={handleSearch}
             
            />
          </InputGroup>
        </Col>
        <Col md={3} className="text-right">
          <Form.Control as="select" value={selectedUser} onChange={handleUserChange}>
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user._id} value={user.userName}>
                Price Updated By {user.userName}
              </option>
            ))}
          </Form.Control>
        </Col>
      </Row>
      <Table bordered hover responsive>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th>ASIN</th>
            <th>SKU</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Changed By</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item._id}>
                <td>{item.asin}</td>
                <td>{item.sku}</td>
                <td>
                  {new Date(item.startDate).toLocaleString()}{" "}
                  <p style={{ color: "green" }}>Changed Price: ${item.price}</p>
                </td>
                <td>
                  {item.endDate ? (
                    <>
                      {new Date(item.endDate).toLocaleString()}
                      {item.currentPrice && (
                        <p style={{ margin: 0, color: "green" }}>
                          Reverted Price: ${item.currentPrice}
                        </p>
                      )}
                    </>
                  ) : (
                    <span style={{color:"red"}}>Until Changed</span>
                  )}
                </td>
                <td>{item.userName}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}
