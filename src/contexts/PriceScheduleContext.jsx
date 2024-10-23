import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const PriceScheduleContext = createContext();

// const BASE_URL = `https://api.priceobo.com`;

const BASE_URL = "http://localhost:3000";
export const PriceScheduleProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  // Fetch schedules and parse into events (single, weekly, and monthly)
  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/schedule`);
      const schedules = response.data.result;

      const events = [];

      schedules.forEach((schedule) => {
        const {
          startDate,
          endDate,
          price,
          currentPrice,
          sku,
          weekly,
          weeklyTimeSlots,
          monthly,
          monthlyTimeSlots,
          imageURL,
        } = schedule;

        if (!weekly && !monthly) {
          // Single-day schedule
          events.push({
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start: new Date(startDate),
            end: new Date(endDate || startDate), // If endDate is null, use startDate
            allDay: false,
            price: price || currentPrice,
            id: schedule._id,
          });
        } else if (weekly) {
          // Weekly schedule with multiple time slots
          Object.entries(weeklyTimeSlots).forEach(([day, timeSlots]) => {
            timeSlots.forEach(
              ({ startTime, endTime, newPrice, revertPrice }) => {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(startDate);

                // Adjust the date for the correct day of the week
                startDateObj.setDate(
                  startDateObj.getDate() +
                    (parseInt(day, 10) - startDateObj.getDay())
                );
                endDateObj.setDate(
                  endDateObj.getDate() +
                    (parseInt(day, 10) - endDateObj.getDay())
                );

                // Set the time for the time slot
                const [startHour, startMinute] = startTime
                  .split(":")
                  .map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);
                startDateObj.setHours(startHour, startMinute, 0);
                endDateObj.setHours(endHour, endMinute, 0);

                events.push({
                  image: imageURL,
                  title: ` ${sku} - $${newPrice}`,
                  start: startDateObj,
                  end: endDateObj,
                  allDay: false,
                  description: `Revert Price: $${revertPrice}`,
                  id: schedule._id,
                });
              }
            );
          });
        } else if (monthly) {
          // Monthly schedule with multiple time slots
          Object.entries(monthlyTimeSlots).forEach(([date, timeSlots]) => {
            timeSlots.forEach(
              ({ startTime, endTime, newPrice, revertPrice }) => {
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(startDate);

                // Adjust the date for the correct day of the month
                startDateObj.setDate(parseInt(date, 10));
                endDateObj.setDate(parseInt(date, 10));

                // Set the time for the time slot
                const [startHour, startMinute] = startTime
                  .split(":")
                  .map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);
                startDateObj.setHours(startHour, startMinute, 0);
                endDateObj.setHours(endHour, endMinute, 0);

                events.push({
                  title: `SKU: ${sku} - $${newPrice}`,
                  start: startDateObj,
                  end: endDateObj,
                  allDay: false,
                  description: `Revert Price: $${revertPrice}`,
                  id: schedule._id,
                });
              }
            );
          });
        }
      });

      setEvents(events); // Update the state with parsed events
    } catch (error) {
      console.error(
        "Error fetching schedules:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const addEvent = (event) => {
    setEvents((prevEvents) => [...prevEvents, event]);
  };

  const removeEvent = (eventId) => {
    setEvents((prevEvents) =>
      prevEvents.filter((event) => event.id !== eventId)
    );
  };

  useEffect(() => {
    fetchEvents(); // Fetch schedules when the component mounts
  }, []);

  return (
    <PriceScheduleContext.Provider value={{ events, addEvent, removeEvent }}>
      {children}
    </PriceScheduleContext.Provider>
  );
};
