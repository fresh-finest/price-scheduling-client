import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const PriceScheduleContext = createContext();

const BASE_URL = "http://localhost:3000";
// const BASE_URL = `https://api.priceobo.com`;


export const PriceScheduleProvider = ({ children }) => {
  const [singleDayEvents, setSingleDayEvents] = useState([]);
  const [weeklyEvents, setWeeklyEvents] = useState([]);
  const [monthlyEvents, setMonthlyEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/schedule`);
      const schedules = response.data.result;
      const now = new Date();
      const dailyEvents = [];
      const weeklyEventsTemp = [];
      const monthlyEventsTemp = [];

      const filteredSchedules = schedules.filter((item) => {
        if (item.status === "deleted") return false; // Exclude deleted items

        // Check for single-day events (non-recurring)
        if (!item.weekly && !item.monthly) {
          return (
            item.endDate === null || new Date(item.endDate) >= now // Only include events where endDate is null or in the future
          );
        }

        // For weekly and monthly events, we don't care about endDate
        return item.weekly || item.monthly;
      });

      // console.log("Filtered Schedules: ", filteredSchedules);

      filteredSchedules.forEach((schedule) => {
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
          title
        } = schedule;

        if (!weekly && !monthly) {
          // Single-day schedule (non-recurring)
          dailyEvents.push({
            image: imageURL,
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start: new Date(startDate),
            end: new Date(endDate || startDate), // If endDate is null, use startDate
            allDay: false,
            price: price || currentPrice,
            id: schedule._id,
            sku,
            eventType: 'single', // Mark this as a single event
          });
        } else if (weekly) {
          // Weekly schedule with multiple time slots
          Object.entries(weeklyTimeSlots).forEach(([day, timeSlots]) => {
            timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
              const startDateObj = new Date(startDate);
              const endDateObj = new Date(startDate);

              // Adjust the date for the correct day of the week
              startDateObj.setDate(
                startDateObj.getDate() + (parseInt(day, 10) - startDateObj.getDay())
              );
              endDateObj.setDate(
                endDateObj.getDate() + (parseInt(day, 10) - endDateObj.getDay())
              );

              // Set the time for the time slot
              const [startHour, startMinute] = startTime.split(":").map(Number);
              const [endHour, endMinute] = endTime.split(":").map(Number);
              startDateObj.setHours(startHour, startMinute, 0);
              endDateObj.setHours(endHour, endMinute, 0);

              weeklyEventsTemp.push({
                image: imageURL,
                title: ` ${sku} - $${newPrice}`,
                start: startDateObj,
                end: endDateObj,
                allDay: false,
                description: `Revert Price: $${revertPrice}`,
                id: schedule._id,
                sku,
                eventType: 'weekly', // Mark this as a weekly event
                productName:title
              });
            });
          });
        } else if (monthly) {
          // Monthly schedule with multiple time slots
          Object.entries(monthlyTimeSlots).forEach(([date, timeSlots]) => {
            timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
              const startDateObj = new Date(startDate);
              const endDateObj = new Date(startDate);

              // Adjust the date for the correct day of the month
              startDateObj.setDate(parseInt(date, 10));
              endDateObj.setDate(parseInt(date, 10));

              // Set the time for the time slot
              const [startHour, startMinute] = startTime.split(":").map(Number);
              const [endHour, endMinute] = endTime.split(":").map(Number);
              startDateObj.setHours(startHour, startMinute, 0);
              endDateObj.setHours(endHour, endMinute, 0);

              monthlyEventsTemp.push({
                image: imageURL,
                title: `SKU: ${sku} - $${newPrice}`,
                start: startDateObj,
                end: endDateObj,
                allDay: false,
                description: `Revert Price: $${revertPrice}`,
                id: schedule._id,
                sku,
                eventType: 'monthly', // Mark this as a monthly event
                productName:title
              });
            });
          });
        }
      });

      // Update the state with categorized events
      setSingleDayEvents(dailyEvents);
      setWeeklyEvents(weeklyEventsTemp);
      setMonthlyEvents(monthlyEventsTemp);
    } catch (error) {
      console.error(
        "Error fetching schedules:",
        error.response ? error.response.data : error.message
      );
    }
  };

  useEffect(() => {
    fetchEvents(); // Fetch schedules when the component mounts
  }, []);

  return (
    <PriceScheduleContext.Provider
      value={{
        singleDayEvents,
        weeklyEvents,
        monthlyEvents,
      }}
    >
      {children}
    </PriceScheduleContext.Provider>
  );
};

