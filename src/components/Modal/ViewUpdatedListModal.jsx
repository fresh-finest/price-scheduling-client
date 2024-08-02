import React, { useContext, useState } from 'react';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';

const UpdatedList = () => {
  const { events } = useContext(PriceScheduleContext);
  const [showAll, setShowAll] = useState(false);

  const listStyles = {
    container: {
      marginTop: '20px',
    },
    listItem: {
      marginBottom: '10px',
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
    showMore: {
      marginTop: '10px',
      cursor: 'pointer',
      color: 'blue',
      textDecoration: 'underline',
    },
  };

  // Demo data for updated products
  const demoProducts = [
    { sku: 'SKU123', price: '12.99', date: new Date() },
    { sku: 'SKU456', price: '13.99', date: new Date() },
    { sku: 'SKU789', price: '14.99', date: new Date() },
    { sku: 'SKU101', price: '15.99', date: new Date() },
    { sku: 'SKU112', price: '16.99', date: new Date() },
    { sku: 'SKU131', price: '17.99', date: new Date() },
  ];

  const displayProducts = showAll ? demoProducts : demoProducts.slice(0, 5);

  return (
    <div style={listStyles.container}>
      <h3>Updated Price List</h3>
      <ul>
        {displayProducts.map((product, index) => (
          <li key={index} style={listStyles.listItem}>
            <strong>SKU:</strong> {product.sku} - <strong>Price:</strong> ${product.price} - <strong>Date:</strong> {product.date.toLocaleString()}
          </li>
        ))}
      </ul>
      {!showAll && demoProducts.length > 5 && (
        <div
          style={listStyles.showMore}
          onClick={() => setShowAll(true)}
        >
          Show More
        </div>
      )}
    </div>
  );
};

export default UpdatedList;
