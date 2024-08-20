import React, { useState, useEffect } from "react";
import { Table, Form, InputGroup, Spinner, Container } from "react-bootstrap";
import axios from "axios";

export default function HistoryView() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/schedule");
        setData(response.data.result);
        setLoading(false);
      } catch (err) {
        setError(
          "Error fetching data: " +
            (err.response ? err.response.data.message : err.message)
        );
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
      <InputGroup className="mb-3" style={{ maxWidth: "300px" }}>
        <Form.Control
          type="text"
          placeholder="Search by ASIN or SKU..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </InputGroup>
      <Table bordered hover responsive>
        <thead style={{ backgroundColor: "#f0f0f0" }}>
          <tr>
            <th>ASIN</th>
            <th>SKU</th>
            <th>Start Date</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item) => (
              <tr key={item._id}>
                <td>{item.asin}</td>
                <td>{item.sku}</td>
                {/* <td>${item.price.toFixed(2)}</td> */}
                <td>
                  {new Date(item.startDate).toLocaleString()}{" "}
                  <p style={{ color: "green" }}>Changed Price: ${item.price}</p>
                </td>
                <td>
                  {item.endDate ? (
                    <>
                      {new Date(item.endDate).toLocaleString()}
                      {item.currentPrice && (
                        <p style={{ margin: 0,color: "green" }}>
                          Reverted Price: ${item.currentPrice}
                        </p>
                      )}
                    </>
                  ) : (
                    "Until Changed"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}
