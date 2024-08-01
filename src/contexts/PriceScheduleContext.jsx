import React, { createContext, useState } from 'react';

export const PriceScheduleContext = createContext();

export const PriceScheduleProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  const addEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  return (
    <PriceScheduleContext.Provider value={{ events, addEvent }}>
      {children}
    </PriceScheduleContext.Provider>
  );
};
