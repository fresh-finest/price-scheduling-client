import { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = `https://api.priceobo.com`;

const UpdatedList = ({ selectedDate }) => {
  const [events, setEvents] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedDate) return;

      try {
        // Adjust the date to local time before sending it to the API
        const localDate = new Date(
          selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000
        )
          .toISOString()
          .split("T")[0];

        // Fetch events filtered by the selected date from the backend
        const response = await axios.get(`${BASE_URL}/api/schedule`, {
          params: {
            startDate: localDate,
          },
        });

        console.log("Response data:", response.data);
        setEvents(response.data.result);
      } catch (error) {
        setErrorMessage(
          "Error fetching schedules: " +
            (error.response ? error.response.data.error : error.message)
        );
      }
    };

    fetchEvents();
  }, [selectedDate]);

  const listStyles = {
    container: {
      marginTop: "20px",
      width: "350px",
      maxHeight: "300px", // Set the maximum height for the container
      overflowY: "auto", // Enable vertical scrolling
      border: "1px solid #ccc",
      borderRadius: "5px",
      padding: "10px",
    },
    listItem: {
      marginBottom: "10px",
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "5px",
    },
    showMore: {
      marginTop: "10px",
      cursor: "pointer",
      color: "blue",
      textDecoration: "underline",
    },
  };

  const displayProducts = showAll ? events : events.slice(0, 5);

  if (events.length === 0) {
    return null; // If no events, do not display the component
  }

  return (
    <div style={listStyles.container}>
      <h3>Updated Price List</h3>
      {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
      <ul>
        {displayProducts.map((product, index) => (
          <li key={index} style={listStyles.listItem}>
            <strong>SKU:</strong> {product.sku} - <strong>Price:</strong> $
            {product.price}
            <br />
            <strong>Start Time:</strong>{" "}
            {new Date(product.startDate).toLocaleString()}
            <br />
            <strong>End Time:</strong>{" "}
            {new Date(product.endDate).toLocaleString()}
          </li>
        ))}
      </ul>
      {!showAll && events.length > 5 && (
        <div style={listStyles.showMore} onClick={() => setShowAll(true)}>
          Show More
        </div>
      )}
    </div>
  );
};

export default UpdatedList;
