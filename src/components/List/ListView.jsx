import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';


const ListView = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if data is already in localStorage
    const cachedData = localStorage.getItem('productData');

    if (cachedData) {
      setProductData(JSON.parse(cachedData));
      setLoading(false);
    } else {
      // If data is not in cache, fetch it
      const fetchData = async () => {
        try {
          // This block ensures that only one API request is sent
          const response = await fetch('https://product-details-yru3.onrender.com/fetch-all-product-details');
          const data = await response.json();
          setProductData(data);

          // Save the data to localStorage to prevent future requests
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
  }, []); // Empty dependency array ensures this effect runs only once

  if (loading) return <p style={{marginTop:"100px"}}>Loading...</p>;
  if (error) return <p style={{marginTop:"100px"}}>{error}</p>;

  return (
    <>
      <div style={{ padding: '20px', marginTop: '50px' }}>
        <h1>List of Products</h1>
        <Table bordered>
          <thead style={{ backgroundColor: '#ff8c00', color: '#fff' }}>
            <tr>
              <th>Image</th>
              <th>ASIN</th>
              <th>SKU</th>
              <th>Title</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {productData.map((item, index) => (
              <tr key={index}>
                <td>
                  <img
                    src={item.payload.AttributeSets[0].SmallImage.URL}
                    alt={item.payload.AttributeSets[0].Title}
                    style={{ width: '50px' }}
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
      </div>
    </>
  );
};

export default ListView;
