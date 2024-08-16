import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UpdatedList = () => {
  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('https://dps-server-b829cf5871b7.herokuapp.com/api/schedule');
        setEvents(response.data.result);
      } catch (error) {
        setErrorMessage('Error fetching schedules: ' + (error.response ? error.response.data.error : error.message));
      }
    };

    fetchEvents();
  }, []);

  const listStyles = {
    container: {
      marginTop: '20px',
      width:'300px'
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

  const displayProducts = showAll ? events : events.slice(0, 5);

  return (
    <div style={listStyles.container}>
      <h3>Updated Price List</h3>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      <ul>
        {displayProducts.map((product, index) => (
          <li key={index} style={listStyles.listItem}>
            <strong>SKU:</strong> {product.sku} - <strong>Price:</strong> ${product.price}
          </li>
        ))}
      </ul>
      {!showAll && events.length > 5 && (
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
