import React, { useState, useRef } from 'react';
import { Table, Container, Row, Col, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Button } from "react-bootstrap";
import { useQuery } from 'react-query';
import { MdOutlineAdd } from "react-icons/md";
import UpdatePriceFromList from "./UpdatePriceFromList";
import axios from 'axios';
import './ListView.css';
import ProductDetailView from './ProductDetailView';

const fetchProducts = async ({ queryKey }) => {
  const [_key, { page, limit }] = queryKey;
  try {
    const response = await axios.get(`https://all-product-list-5fffc5e9c5f7.herokuapp.com/fetch-all-listings`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch products:', error.message);
    throw new Error('Failed to fetch products');
  }
};

const ListView = () => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedListing, setSelectedListing] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnWidths, setColumnWidths] = useState([80,80,300,60,80]);
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAsin, setSelectedAsin] = useState('');

  const { data, error, isLoading } = useQuery(['products', { page: currentPage, limit: 10 }], fetchProducts);

  const handleProductSelect = async (asin) => {
    try {
      const responseone = await axios.get(`https://dps-server-b829cf5871b7.herokuapp.com/details/${asin}`);
      const responsetwo = await axios.get(`https://dps-server-b829cf5871b7.herokuapp.com/product/${asin}`);
  
      setSelectedProduct(responseone.data.payload);
      setSelectedListing(responsetwo.data); // Make sure this is defined
      setSelectedAsin(asin);
    } catch (error) {
      console.error('Error fetching product details:', error.message);
    }
  };
  

  const handleUpdate = (asin) => {
    setSelectedAsin(asin);
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
      document.removeEventListener('mousemove', doDrag);
      document.removeEventListener('mouseup', stopDrag);
    };

    document.addEventListener('mousemove', doDrag);
    document.addEventListener('mouseup', stopDrag);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) return <p style={{ marginTop: "100px" }}><Spinner animation="border" /> Loading...</p>;
  if (error) return <p style={{ marginTop: "100px" }}>{error.message}</p>;

  const filteredProducts = data.organizedData.filter(product => 
    product.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.asin1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sellerSku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container fluid style={{ marginTop: '100px' }}>
      <UpdatePriceFromList
        show={showUpdateModal}
        onClose={handleCloseUpdateModal}
        asin={selectedAsin} 
      />
      <Row>
        <Col md={8} style={{ paddingRight: '20px' }}>
          <InputGroup className="mb-3" style={{ maxWidth: '300px' }}>
            <Form.Control 
              type="text" 
              placeholder="Search..." 
              value={searchTerm} 
              onChange={handleSearch} 
              style={{ borderRadius: '4px' }} 
            />
          </InputGroup>
          {filteredProducts.length > 0 ? (
            <>
              <Table bordered hover responsive ref={tableRef} style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead style={{ backgroundColor: '#f0f0f0', color: '#333', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                  <tr>
                    <th style={{ width: `${columnWidths[0]}px`, position: 'relative' }}>
                      ASIN
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(0, e)}
                      />
                    </th>
                    <th style={{ width: `${columnWidths[1]}px`, position: 'relative' }}>
                      SKU
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(1, e)}
                      />
                    </th>
                    <th style={{ width: `${columnWidths[2]}px`, position: 'relative', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Title
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(2, e)}
                      />
                    </th>
                    <th style={{ width: `${columnWidths[3]}px`, position: 'relative' }}>
                      Price
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(3, e)}
                      />
                    </th>
                    <th style={{ width: `${columnWidths[4]}px`, position: 'relative' }}>
                      Update Price
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(4, e)}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif', lineHeight: '1.5' }}>
                  {filteredProducts.map((item, index) => (
                    <tr key={index} onClick={() => handleProductSelect(item.asin1)} style={{ cursor: 'pointer', height: '40px' }}>
                      <td>{item.asin1}</td>
                      <td>{item.sellerSku}</td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.itemName}</td>
                      <td>${item.price}</td>
                      <td>
                        <Button style={{backgroundColor:"#50C878"}} onClick={() => handleUpdate(item.asin1)}>
                        <MdOutlineAdd />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          ) : (
            <p>No products found.</p>
          )}
        </Col>
        <Col md={4} style={{ paddingLeft: '0px', marginTop: '20px', paddingRight: '20px' }}>
          {selectedProduct ? (
            <div style={{ marginTop: "35px", position:'fixed',width:"460px"}}>
              <ProductDetailView product={selectedProduct} listing={selectedListing} asin={selectedAsin} />
            </div>
          ) : (
            <div style={{ paddingTop: '10px' }}>
              <h5>Select a product to see details</h5>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ListView;
