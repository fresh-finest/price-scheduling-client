// React component for Sales Comparison
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, Form, Button, Spinner } from 'react-bootstrap';

const SaleReport = () => {
  const [products, setProducts] = useState([]); // To store product list
  const [salesData, setSalesData] = useState({}); // To store sales comparison data as an object by SKU
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false); // Loading state for sales data

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/favourite/limit?page=1&limit=20');
        setProducts(response.data.data.listings);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
    };

    fetchProducts();
  }, []);

  // Handle fetching sales comparison data
  const fetchSalesComparison = async () => {
    setLoading(true);
    try {
      const skuArray = products.map(product => product.sellerSku);
      const response = await axios.get('http://localhost:3000/api/product/sale', {
        params: {
          startDate: startDate || getDefaultStartDate(),
          endDate: endDate || getDefaultEndDate(),
          skus: skuArray.join(','),
        },
      });

      // Map sales data by SKU for easier access
      const salesMap = {};
      response.data.data.forEach(sale => {
        salesMap[sale.sku] = sale;
      });
      setSalesData(salesMap);
    } catch (error) {
      console.error('Error fetching sales comparison:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get default start date (30 days ago)
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  };

  // Get default end date (today)
  const getDefaultEndDate = () => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  };

  // Render table
  return (
    <div className="container">
      <h2>Sales Comparison</h2>

      {/* Date selection form */}
      <Form className="mb-4">
        <Form.Group controlId="startDate">
          <Form.Label>Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="endDate">
          <Form.Label>End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </Form.Group>

        <Button variant="primary" onClick={fetchSalesComparison} className="mt-3">
          Fetch Sales Data
        </Button>
      </Form>

      {/* Sales comparison table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Image</th>
            <th>SKU</th>
            <th>Title</th>
            <th>Current Interval Units</th>
            <th>Previous Interval Units</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const sale = salesData[product.sellerSku] || {};
            return (
              <tr key={product.sellerSku}>
                <td>
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/50'}
                    alt={product.itemName || 'No Image'}
                    width={50}
                  />
                </td>
                <td>{product.sellerSku}</td>
                <td>{product.itemName || 'Unknown Product'}</td>
                <td>{loading ? <Spinner animation="border" size="sm" /> : sale.currentIntervalUnits || 0}</td>
                <td>{loading ? <Spinner animation="border" size="sm" /> : sale.previousIntervalUnits || 0}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default SaleReport;
