import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const PriceScheduleContext = createContext();

// const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com'
const BASE_URL = `https://quiet-stream-22437-07fa6bb134e0.herokuapp.com/http://100.26.185.72:3000`;


export const PriceScheduleProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/schedule`);
      
      const schedules = response.data.result.map(schedule => ({
        title: `ASIN: ${schedule?.asin} - $${schedule.price}`,
        start: new Date(schedule.startDate),
        end: new Date(schedule.endDate),
        allDay: false,
        id: schedule._id // Add ID for removal reference
      }));
      setEvents(schedules);
    } catch (error) {
      console.error('Error fetching events:', error.response ? error.response.data : error.message);
    }
  };

  const addEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  const removeEvent = (eventId) => {
    setEvents((prevEvents) => prevEvents.filter(event => event.id !== eventId));
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <PriceScheduleContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </PriceScheduleContext.Provider>
  );
};
