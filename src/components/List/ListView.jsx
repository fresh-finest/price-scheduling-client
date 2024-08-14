import React, { useState, useEffect, useRef } from 'react';
import { Table, Container, Row, Col, Form, InputGroup, Spinner } from 'react-bootstrap';
import './ListView.css'; // Include any additional styles you need
import ProductDetailView from './ProductDetailView'; // Assuming ProductDetailView is a separate file

const ListView = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [columnWidths, setColumnWidths] = useState([60, 100, 100, 400, 60]); // Initial widths: Image, ASIN, SKU, Title, Price
  const tableRef = useRef(null);

  useEffect(() => {
    const cachedData = localStorage.getItem('productData');

    if (cachedData) {
      setProductData(JSON.parse(cachedData));
      setLoading(false);
    } else {
      const fetchData = async () => {
        try {
          const response = await fetch('https://product-details-yru3.onrender.com/fetch-all-product-details');
          const data = await response.json();
          setProductData(data);
          localStorage.setItem('productData', JSON.stringify(data));
        } catch (error) {
          setError('Failed to fetch product details');
          console.error('Error fetching product details:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, []);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = productData.filter(product => 
    product.payload?.AttributeSets?.[0]?.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.payload?.Identifiers?.MarketplaceASIN?.ASIN?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.payload?.AttributeSets?.[0]?.Model?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  if (loading) return <p style={{ marginTop: "100px" }}><Spinner animation="border" /> Loading...</p>;
  if (error) return <p style={{ marginTop: "100px" }}>{error}</p>;

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
            <Table bordered hover responsive ref={tableRef} style={{ width: '100%', tableLayout: 'fixed' }}>
              <thead style={{ backgroundColor: '#f0f0f0', color: '#333', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
                <tr>
                  <th style={{ width: `${columnWidths[0]}px`, position: 'relative' }}>
                    Image
                    <div
                      style={{ width: '5px', height: '100%', position: 'absolute', right: '0', top: '0', cursor: 'col-resize' }}
                      onMouseDown={(e) => handleResize(0, e)}
                    />
                  </th>
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
                  <tr key={index} onClick={() => handleProductSelect(item)} style={{ cursor: 'pointer', height: '40px' }}>
                    <td>
                      <img
                        src={item.payload?.AttributeSets?.[0]?.SmallImage?.URL}
                        alt={item.payload?.AttributeSets?.[0]?.Title}
                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                      />
                    </td>
                    <td>{item.payload?.Identifiers?.MarketplaceASIN?.ASIN}</td>
                    <td>{item.payload?.AttributeSets?.[0]?.Model}</td>
                    <td style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.payload?.AttributeSets?.[0]?.Title}</td>
                    <td>${item.payload?.AttributeSets?.[0]?.ListPrice?.Amount}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
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
