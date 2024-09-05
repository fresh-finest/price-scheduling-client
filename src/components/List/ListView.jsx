import React, { useState, useEffect } from "react";
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
import { MdOutlineAdd, MdContentCopy, MdCheck } from "react-icons/md";
import { IoMdAdd } from "react-icons/io";

import UpdatePriceFromList from "./UpdatePriceFromList";
import axios from "axios";
import { useSelector } from 'react-redux';
import "./ListView.css";
import ProductDetailView from "./ProductDetailView";

// const BASE_URL ='http://localhost:3000'

const BASE_URL = `https://quiet-stream-22437-07fa6bb134e0.herokuapp.com/http://100.26.185.72:3000`;

const BASE_URL_LIST = 'https://quiet-stream-22437-07fa6bb134e0.herokuapp.com/http://100.26.185.72:3000';
// const BASE_URL_LIST='http://localhost:3000';


const fetchProducts = async () => {
  const response = await axios.get(`${BASE_URL_LIST}/fetch-all-listings`);
  return response.data;
};


const fetchScheduledData = async () => {
  const response = await axios.get(`${BASE_URL}/api/schedule`);
  return response.data.result;
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
  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [scheduledData, setScheduledData] = useState([]);
  const [filterScheduled, setFilterScheduled] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || '';
  console.log("role:"+currentUser.role+"write: "+currentUser.permissions.write+"username:"+userName);


  const { data: productData, error, isLoading } = useQuery("products", fetchProducts, {
    onSuccess: (data) => {
      if (!filterScheduled) {
        setFilteredProducts(data.listings); 
      }
    },
  });


  useEffect(() => {
    const getScheduledData = async () => {
      const result = await fetchScheduledData();
      setScheduledData(result);
      if (productData) {
        filterProducts(productData.listings, result, filterScheduled, searchTerm);
      }
    };
    getScheduledData();
  }, [productData]);

 
  const handleSearch = (value) => {
    setSearchTerm(value);
    filterProducts(productData?.listings || [], scheduledData, filterScheduled, value);
  };

  
  const filterProducts = (products, scheduled, onlyScheduled, searchValue) => {
    let filtered = products;
    const now = new Date();

    if (onlyScheduled) {
      const scheduledAsins = scheduled
       
        .filter(item => 
          item.status !== "deleted" && 
          (
            item.weekly || 
            item.monthly ||
            item.endDate === null || 
            (item.endDate && new Date(item.endDate) >= now)
          )
        )
        
       
        .map(item => item.asin);

      filtered = products.filter(product => scheduledAsins.includes(product.asin1));
    }

    if (searchValue) {
      filtered = filtered.filter(
        (product) =>
          product.itemName?.toLowerCase().includes(searchValue.toLowerCase()) ||
          product.asin1?.toLowerCase().includes(searchValue.toLowerCase()) ||
          product.sellerSku?.toLowerCase().includes(searchValue.toLowerCase()) ||
          product.status?.toLowerCase().includes(searchValue.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

 
  const handleToggleFilter = () => {
    const newFilterScheduled = !filterScheduled;
    setFilterScheduled(newFilterScheduled);
    filterProducts(productData?.listings || [], scheduledData, newFilterScheduled, searchTerm);
  };
/*
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
            `${BASE_URL}/details/${asin}`
          ),
          axios.get(
            `${BASE_URL}/product/${asin}`
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
  };*/

const handleProductSelect = async (asin, index) => {
  if (selectedRowIndex === index) {
    
    setSelectedRowIndex(null);
    setSelectedProduct(null);
    setSelectedListing(null);
    setSelectedAsin("");
  } else {
    setSelectedRowIndex(index);
    setSelectedAsin(asin);

    try {
      
      const [responseOne, responseTwo] = await Promise.all([
        axios.get(`${BASE_URL}/details/${asin}`),
        axios.get(`${BASE_URL}/product/${asin}`)
      ]);

      setSelectedProduct(responseOne.data.payload);
      setSelectedListing(responseTwo.data);
    } catch (error) {
      console.error("Error fetching product details:", error.message);
      
    }
  }
};
/*
  const handleUpdate = (asin, e) => {
    e.stopPropagation(); 
    if (asin) {
      setSelectedAsin(asin);
      setShowUpdateModal(true);
      setSelectedProduct(product);
    } else {
      console.error("ASIN is not provided. Modal will not open.");
    }
  };
*/
 // Fetch product details when Update Price button is clicked
 const handleUpdate = async (asin,index, e) => {
  e.stopPropagation(); // Prevent row click from being triggered

  if (!asin) {
    console.error("ASIN is not provided. Modal will not open.");
    return;
  }

  try {
    setSelectedAsin(asin);
    setShowUpdateModal(true);
    setSelectedRowIndex(index);
    // Fetch product details and set the selected product
    const response = await axios.get(`${BASE_URL}/details/${asin}`);
    setSelectedProduct(response.data.payload);
  } catch (error) {
    console.error("Error fetching product details:", error.message);
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

  const handleCopy = (text, type, index) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        if (type === 'asin') {
          setCopiedAsinIndex(index);
          setTimeout(() => setCopiedAsinIndex(null), 2000);
        } else if (type === 'sku') {
          setCopiedSkuIndex(index);
          setTimeout(() => setCopiedSkuIndex(null), 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  if (isLoading)
    return (
      <div style={{ marginTop: "100px" }}>
        <Spinner animation="border" /> Loading...
      </div>
    );
  if (error) return <div style={{ marginTop: "100px" }}>{error.message}</div>;

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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 1000,
              backgroundColor: "white",
              borderBottom: "1px solid #ccc",
              padding: "10px 0",
            }}
          >
            <InputGroup className="mb-3" style={{ maxWidth: "200px" }}>
              <Form.Control
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ borderRadius: "4px", marginTop: "100px" }}
              />
            </InputGroup>
            <Button
              style={{ borderRadius: "4px", marginTop: "100px",backgroundColor:"#5AB36D",border:"none"}}
              onClick={handleToggleFilter}
            >
              {filterScheduled ? "Show All" : "Scheduled"}
            </Button>
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
                            {copiedAsinIndex === index ? (
                              <MdCheck
                                style={{ marginLeft: "5px", cursor: "pointer", color: "green" }}
                              />
                            ) : (
                              <MdContentCopy
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.asin1, 'asin', index);
                                }}
                                style={{ marginLeft: "5px", cursor: "pointer" }}
                              />
                            )}
                          </span>{" "}
                          <span className="bubble-text" style={{
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                            }} >
                            {item.sellerSku}{" "}
                            {copiedSkuIndex === index ? (
                              <MdCheck
                                style={{ marginLeft: "5px", cursor: "pointer", color: "green" }}
                              />
                            ) : (
                              <MdContentCopy
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(item.sellerSku, 'sku', index);
                                }}
                                style={{ marginLeft: "5px", cursor: "pointer" }}
                              />
                            )}
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
                      <td style={{backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#fff",}} >
                        <Button
                        
                          style={{
                            backgroundColor:"#5AB36D",
                          
                            paddingLeft:"20px",
                            paddingRight:"20px",
                            border:"none",
                            // backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#5AB36D",
                            
                          }}
                          onClick={(e) => handleUpdate(item.asin1,index, e)}
                          disabled={(!currentUser?.permissions?.write)}
                        >
                         <IoMdAdd />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            filterScheduled && (
              <div style={{ marginTop: "20px", color: "#888", textAlign: "center" }}>
                There is no active schedule.
              </div>
            )
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