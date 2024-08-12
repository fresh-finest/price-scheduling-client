import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const PriceScheduleContext = createContext();

const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com';

export const PriceScheduleProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/schedule`);
      console.log("schedule data:"+response)
      const schedules = response.data.result.map(schedule => ({
        title: `SKU: ${schedule.sku} - $${schedule.price}`,
        start: new Date(schedule.startDate),
        end: new Date(schedule.endDate),
        allDay: false
      }));
      setEvents(schedules);
    } catch (error) {
      console.error('Error fetching events:', error.response ? error.response.data : error.message);
    }
  };

  const addEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <PriceScheduleContext.Provider value={{ events, addEvent }}>
      {children}
    </PriceScheduleContext.Provider>
  );
};
