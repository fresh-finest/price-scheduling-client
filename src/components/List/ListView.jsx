import React, { useState } from "react";
import {
  Table,
  Container,
  Row,
  Col,
  Form,
  InputGroup,
  Spinner,
  Button,
} from "react-bootstrap";
import { useQuery } from "react-query";
import { MdOutlineAdd, MdContentCopy } from "react-icons/md";
import UpdatePriceFromList from "./UpdatePriceFromList";
import axios from "axios";
import { useSelector } from 'react-redux';
import "./ListView.css";
import ProductDetailView from "./ProductDetailView";

// Fetch products function
const fetchProducts = async () => {
  const response = await axios.get("https://all-product-list-5fffc5e9c5f7.herokuapp.com/fetch-all-listings");
  return response.data;
};

const ListView = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [columnWidths, setColumnWidths] = useState([100, 400, 100, 150]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAsin, setSelectedAsin] = useState("");
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || '';
  console.log("role:"+currentUser.role+"write: "+currentUser.permissions.write+"username:"+userName);

  const { data, error, isLoading } = useQuery("products", fetchProducts, {
    onSuccess: (data) => {
      setFilteredProducts(data.listings);
    },
  });

  const handleSearch = (value) => {
    setSearchTerm(value);
    if (data) {
      const filtered = data.listings.filter(
        (product) =>
          product.itemName?.toLowerCase().includes(value.toLowerCase()) ||
          product.asin1?.toLowerCase().includes(value.toLowerCase()) ||
          product.sellerSku?.toLowerCase().includes(value.toLowerCase()) ||
          product.status?.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleProductSelect = async (asin, index) => {
    if (selectedRowIndex === index) {
      setSelectedRowIndex(null);
      setSelectedProduct(null);
      setSelectedListing(null);
      setSelectedAsin("");
    } else {
      try {
        const [responseone, responsetwo] = await Promise.all([
          axios.get(
            `https://dps-server-b829cf5871b7.herokuapp.com/details/${asin}`
          ),
          axios.get(
            `https://dps-server-b829cf5871b7.herokuapp.com/product/${asin}`
          ),
        ]);

        setSelectedProduct(responseone.data.payload);
        setSelectedListing(responsetwo.data);
        setSelectedAsin(asin);
        setSelectedRowIndex(index);
      } catch (error) {
        console.error("Error fetching product details:", error.message);
      }
    }
  };

  const handleUpdate = (asin, e) => {
    e.stopPropagation(); // Prevent row click from being triggered
    if (asin) {
      setSelectedAsin(asin);
      setShowUpdateModal(true);
    } else {
      console.error("ASIN is not provided. Modal will not open.");
    }
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleResize = (index, event) => {
    const startX = event.clientX;
    const startWidth = columnWidths[index];

    const doDrag = (e) => {
      const newWidth = Math.max(50, startWidth + (e.clientX - startX));
      setColumnWidths((prevWidths) => {
        const newWidths = [...prevWidths];
        newWidths[index] = newWidth;
        return newWidths;
      });
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text)
      // .then(() => {
      //   alert('Copied to clipboard: ' + text);
      // })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  if (isLoading)
    return (
      <p style={{ marginTop: "100px" }}>
        <Spinner animation="border" /> Loading...
      </p>
    );
  if (error) return <p style={{ marginTop: "100px" }}>{error.message}</p>;

  return (
    <Container fluid>
      <UpdatePriceFromList
        show={showUpdateModal}
        onClose={handleCloseUpdateModal}
        asin={selectedAsin}
      />
      <Row>
        <Col md={8} style={{ paddingRight: "20px" }}>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              backgroundColor: "white",
              borderBottom: "1px solid #ccc",
            }}
          >
            <InputGroup className="mb-3" style={{ maxWidth: "300px" }}>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ borderRadius: "4px", marginTop: "100px" }}
              />
            </InputGroup>
          </div>

          {filteredProducts.length > 0 ? (
            <div
              style={{
                overflowY: "scroll",
                maxHeight: "calc(100vh - 250px)",
                marginTop: "5px",
              }}
            >
              <Table
                bordered
                hover
                responsive
                style={{ width: "100%", tableLayout: "fixed" }}
              >
                <thead
                  style={{
                    backgroundColor: "#f0f0f0",
                    color: "#333",
                    fontFamily: "Arial, sans-serif",
                    fontSize: "14px",
                    position: "sticky",
                    top: 0,
                    zIndex: 100,
                  }}
                >
                  <tr>
                    <th
                      style={{
                        width: `${columnWidths[0]}px`,
                        position: "relative",
                      }}
                    >
                      Status
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(0, e)}
                      />
                    </th>

                    <th
                      style={{
                        width: `${columnWidths[1]}px`,
                        position: "relative",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Product details
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(1, e)}
                      />
                    </th>
                    <th
                      style={{
                        width: `${columnWidths[2]}px`,
                        position: "relative",
                      }}
                    >
                      Price
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(2, e)}
                      />
                    </th>
                    <th
                      style={{
                        width: `${columnWidths[3]}px`,
                        position: "relative",
                      }}
                    >
                      Update Price
                      <div
                        style={{
                          width: "5px",
                          height: "100%",
                          position: "absolute",
                          right: "0",
                          top: "0",
                          cursor: "col-resize",
                        }}
                        onMouseDown={(e) => handleResize(3, e)}
                      />
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
                  {filteredProducts.map((item, index) => (
                    <tr
                      key={index}
                      onClick={() => handleProductSelect(item.asin1, index)}
                      style={{
                        cursor: "pointer",
                        height: "40px",
                        backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#ccc",
                      }}
                    >
                      <td style={{
                        cursor: "pointer",
                        height: "40px",
                        backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#fff",
                      }} >{item.status}</td>

                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                        height: "40px",
                        backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#fff",
                        }}
                      >
                        {item.itemName}
                        <div className="details">
                          <span
                            className="bubble-text"
                            style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            {item.asin1}{" "}
                            <MdContentCopy
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.asin1);
                              }}
                              style={{ marginLeft: "5px", cursor: "pointer" }}
                            />
                          </span>{" "}
                          <span className="bubble-text"  style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }} >
                            {item.sellerSku}{" "}
                            <MdContentCopy
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(item.sellerSku);
                              }}
                              style={{ marginLeft: "5px", cursor: "pointer" }}
                            />
                          </span>{" "}
                          <span className="bubble-text">
                            {item.fulfillmentChannel === "DEFAULT"
                              ? "FBM"
                              : "FBA"}{" "}
                            : {item.quantity}
                          </span>{" "}
                        </div>
                      </td>
                      <td style={{  whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                        height: "40px",
                        backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#fff",}}  >${item.price}</td>
                      <td>
                        <Button
                          style={{
                            backgroundColor: "#50C878",
                            width: "50px",
                          }}
                          onClick={(e) => handleUpdate(item.asin1, e)}
                          disabled={(!currentUser?.permissions?.write)}
                        >
                          <MdOutlineAdd />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <p>Loading....</p>
          )}
        </Col>
        <Col
          md={4}
          style={{
            paddingLeft: "0px",
            marginTop: "20px",
            paddingRight: "20px",
          }}
        >
          {selectedProduct ? (
            <div
              style={{ marginTop: "100px", position: "fixed", width: "460px" }}
            >
              <ProductDetailView
                product={selectedProduct}
                listing={selectedListing}
                asin={selectedAsin}
              />
            </div>
          ) : (
            <div style={{ paddingTop: "10px" }}>
              <h5>Select a product to see details</h5>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ListView;
