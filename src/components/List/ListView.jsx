import React, { useState, useEffect, useRef } from 'react';
import { Table, Container, Row, Col, Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import './ListView.css'; // Include any additional styles you need
import ProductDetailView from './ProductDetailView'; // Assuming ProductDetailView is a separate file

const ListView = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
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
    product.payload.AttributeSets[0].Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.payload.Identifiers.MarketplaceASIN.ASIN.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.payload.AttributeSets[0].Model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const table = tableRef.current;
    if (!table) return;

    const cols = table.querySelectorAll('th');

    cols.forEach((col, index) => {
      col.style.position = 'relative';
      const resizer = document.createElement('div');
      resizer.className = 'resizer';
      resizer.style.width = '5px';
      resizer.style.height = '100%';
      resizer.style.position = 'absolute';
      resizer.style.right = '0';
      resizer.style.top = '0';
      resizer.style.cursor = 'col-resize';
      resizer.addEventListener('mousedown', initResize(index));
      col.appendChild(resizer);
    });

    function initResize(index) {
      return function (e) {
        const startX = e.clientX;
        const startWidth = cols[index].offsetWidth;

        function doDrag(e) {
          cols[index].style.width = startWidth + e.clientX - startX + 'px';
        }

        function stopDrag() {
          document.removeEventListener('mousemove', doDrag);
          document.removeEventListener('mouseup', stopDrag);
        }

        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
      };
    }
  }, []);

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
            <Button variant="outline-secondary" id="button-addon2">
              Search
            </Button>
          </InputGroup>
          <Table bordered hover responsive ref={tableRef} style={{ width: '100%', tableLayout: 'fixed' }}>
            <thead style={{ backgroundColor: '#f0f0f0', color: '#333', fontFamily: 'Arial, sans-serif', fontSize: '14px' }}>
              <tr>
                <th style={{ minWidth: '80px' }}>Image</th>
                <th style={{ minWidth: '150px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>ASIN</th>
                <th style={{ minWidth: '150px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>SKU</th>
                <th style={{ minWidth: '300px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Title</th>
                <th style={{ minWidth: '100px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>Price</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '12px', fontFamily: 'Arial, sans-serif', lineHeight: '1.5' }}>
              {filteredProducts.map((item, index) => (
                <tr key={index} onClick={() => handleProductSelect(item)} style={{ cursor: 'pointer', height: '40px' }}>
                  <td>
                    <img
                      src={item.payload.AttributeSets[0].SmallImage.URL}
                      alt={item.payload.AttributeSets[0].Title}
                      style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                    />
                  </td>
                  <td>{item.payload.Identifiers.MarketplaceASIN.ASIN}</td>
                  <td>{item.payload.AttributeSets[0].Model}</td>
                  <td>{item.payload.AttributeSets[0].Title}</td>
                  <td>${item.payload.AttributeSets[0].ListPrice.Amount}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
        <Col md={4} style={{ paddingLeft: '0px', marginTop: '20px', paddingRight: '20px' }}>
          {selectedProduct ? (
            <div style={{marginTop:"35px"}}>
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
