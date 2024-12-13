import { createContext, useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";

export const TimeZoneContext = createContext(); // Define and export the context

// const BASE_URL = "http://localhost:3000";
const BASE_URL = `https://api.priceobo.com`;

export const TimeZoneProvider = ({ children }) => {
  const [timeZone, setTimeZone] = useState(null); // Initialize with no time zone
  const [loading, setLoading] = useState(true); // Start in a loading state

  const fetchTimeZone = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/time-zone`); // Make an API request

      if (
        response.status === 200 &&
        response.data.status === "Success" &&
        response.data.result.length > 0
      ) {
        setTimeZone(response.data.result[0].timeZone); // Set fetched time zone
      } else {
        console.warn("No time zone found, setting default to America/New_York");
        setTimeZone("America/New_York"); // Default to New York
      }
    } catch (error) {
      console.error(
        "Error fetching time zone:",
        error.response ? error.response.data : error.message
      );
      setTimeZone("America/New_York"); // Fallback to New York on error
    } finally {
      setLoading(false); // Mark loading as complete
    }
  };

  useEffect(() => {
    fetchTimeZone(); // Fetch time zone on component mount
  }, []);

  return (
    <TimeZoneContext.Provider
      value={{
        timeZone,
        loading,
        fetchTimeZone,
      }}
    >
      {children} {/* Render child components */}
    </TimeZoneContext.Provider>
  );
};
