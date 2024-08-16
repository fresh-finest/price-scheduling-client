import React, { useState, useRef } from 'react';
import { Table, Container, Row, Col, Form, InputGroup, Spinner, Pagination } from 'react-bootstrap';
import { useQuery } from 'react-query';
import './ListView.css';
import axios from 'axios';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [columnWidths, setColumnWidths] = useState([60, 100, 100, 400, 60]);
  const [currentPage, setCurrentPage] = useState(1);
  const tableRef = useRef(null);

  const { data, error, isLoading } = useQuery(['products', { page: currentPage, limit: 10 }], fetchProducts);

  const handleProductSelect = async (asin) => {
    try {
      const response = await axios.get(`https://dps-server-b829cf5871b7.herokuapp.com/details/${asin}`);
      setSelectedProduct(response.data.payload);
    } catch (error) {
      console.error('Error fetching product details:', error.message);
    }
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
                    {/* <th style={{ width: `${columnWidths[0]}px`, position: 'relative' }}>
                      Image
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(0, e)}
                      />
                    </th> */}
                    <th style={{ width: `${columnWidths[1]}px`, position: 'relative' }}>
                      ASIN
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(1, e)}
                      />
                    </th>
                    <th style={{ width: `${columnWidths[2]}px`, position: 'relative' }}>
                      SKU
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(2, e)}
                      />
                    </th>
                    <th style={{ width: `${columnWidths[3]}px`, position: 'relative', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Title
                      <div
                        style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                        onMouseDown={(e) => handleResize(3, e)}
                      />
                    </th>
                    <th style={{ width: `${columnWidths[4]}px`, position: 'relative' }}>
                      Price
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
                      {/* <td>
                        <img
                          src={`https://m.media-amazon.com/images/I/${item.productId}_SL75_.jpg`}
                          alt={item.itemName}
                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                        />
                      </td> */}
                      <td>{item.asin1}</td>
                      <td>{item.sellerSku}</td>
                      <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.itemName}</td>
                      <td>${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {/* <Pagination>
                <Pagination.Prev disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)} />
                <Pagination.Item active>{currentPage}</Pagination.Item>
                <Pagination.Next disabled={filteredProducts.length < 10} onClick={() => handlePageChange(currentPage + 1)} />
              </Pagination> */}
            </>
          ) : (
            <p>No products found.</p>
          )}
        </Col>
        <Col md={4} style={{ paddingLeft: '0px', marginTop: '20px', paddingRight: '20px' }}>
          {selectedProduct ? (
            <div style={{ marginTop: "35px" }}>
              <ProductDetailView product={selectedProduct} />
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
