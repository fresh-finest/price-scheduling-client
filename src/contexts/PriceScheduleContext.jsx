import { createContext, useState, useEffect } from "react";
import axios from "axios";
export const PriceScheduleContext = createContext();
// const BASE_URL = "http://localhost:3000";
const BASE_URL = "https://api.priceobo.com";


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
      const filteredSchedules = schedules?.filter((item) => {
        if (item.status === "deleted") return false;
        if (!item.weekly && !item.monthly) {
          return item.endDate === null || new Date(item.endDate) >= now;
        }
        return item.weekly || item.monthly;
      });

      
      filteredSchedules?.forEach((schedule) => {
        console.log("sc: "+schedule);
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
          title,
        } = schedule;
        if (!weekly && !monthly) {
          dailyEvents.push({
            image: imageURL,
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start: new Date(startDate),
            end: new Date(endDate || startDate),
            allDay: false,
            price: price || currentPrice,
            id: schedule._id,
            sku,
            eventType: "single",
            productName: title,
          });
        } else if (weekly) {
          // Weekly schedule: Take only the first available day
  const firstDay = Object.keys(weeklyTimeSlots || {})[0]; // First available day in weekly schedule
  const firstTimeSlot = weeklyTimeSlots?.[firstDay]?.[0]; // First time slot on the first day

  if (firstDay && firstTimeSlot) { // Check if both are defined
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDate);
    startDateObj.setDate(
      startDateObj.getDate() + (parseInt(firstDay, 10) - startDateObj.getDay())
    );
    endDateObj.setDate(
      endDateObj.getDate() + (parseInt(firstDay, 10) - endDateObj.getDay())
    );

    const [startHour, startMinute] = firstTimeSlot.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = firstTimeSlot.endTime
      .split(":")
      .map(Number);
    startDateObj.setHours(startHour, startMinute, 0);
    endDateObj.setHours(endHour, endMinute, 0);

    weeklyEventsTemp.push({
      image: imageURL,
      title: ` ${sku} - $${firstTimeSlot.newPrice}`,
      start: startDateObj,
      end: endDateObj,
      allDay: false,
      price: `${firstTimeSlot.newPrice}`,
      description: `Revert Price: $${firstTimeSlot?.revertPrice}`,
      id: schedule._id,
      sku,
      eventType: "weekly",
      productName: title,
      weekly: true,
    });
  }
        } else if (monthly) {
        // Monthly schedule: Take only the first available date
  const firstDate = Object.keys(monthlyTimeSlots || {})[0]; // First available date in monthly schedule
  const firstTimeSlot = monthlyTimeSlots?.[firstDate]?.[0]; // First time slot on the first date

  if (firstDate && firstTimeSlot) { // Check if both are defined
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDate);
    startDateObj.setDate(parseInt(firstDate, 10));
    endDateObj.setDate(parseInt(firstDate, 10));

    const [startHour, startMinute] = firstTimeSlot.startTime
      .split(":")
      .map(Number);
    const [endHour, endMinute] = firstTimeSlot.endTime
      .split(":")
      .map(Number);
    startDateObj.setHours(startHour, startMinute, 0);
    endDateObj.setHours(endHour, endMinute, 0);

    monthlyEventsTemp.push({
      image: imageURL,
      title: `SKU: ${sku} - $${firstTimeSlot.newPrice}`,
      start: startDateObj,
      end: endDateObj,
      allDay: false,
      price: `${firstTimeSlot.newPrice}`,
      description: `Revert Price: $${firstTimeSlot?.revertPrice}`,
      id: schedule._id,
      sku,
      eventType: "monthly",
      productName: title,
      monthly: true,
    });
  }
        }
      });
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
    fetchEvents();
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