import { createContext, useState, useEffect } from "react";
import axios from "axios";
import moment from "moment-timezone";

export const PriceScheduleContext = createContext();
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
      const endPeriod = new Date();
      endPeriod.setMonth(endPeriod.getMonth() + 6); // Limit up to 3 months

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

        // Single Events
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
        }

        // Weekly Events
        else if (weekly) {
          const scheduleEndDate = endDate ? new Date(endDate) : endPeriod;

          for (
            let date = new Date(startDate);
            date <= scheduleEndDate;
            date.setDate(date.getDate() + 7)
          ) {
            Object.entries(weeklyTimeSlots).forEach(([day, timeSlots]) => {
              const dayOffset = (parseInt(day, 10) - date.getDay() + 7) % 7;
              const targetDate = new Date(date);
              targetDate.setDate(targetDate.getDate() + dayOffset);

              timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
                const slotStart = new Date(targetDate);
                const slotEnd = new Date(targetDate);

                const [startHour, startMinute] = startTime.split(":").map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);
                slotStart.setHours(startHour, startMinute, 0);
                slotEnd.setHours(endHour, endMinute, 0);

                for (let i = 0; i < 24; i++) {
                  const occurrenceStart = new Date(slotStart);
                  occurrenceStart.setDate(occurrenceStart.getDate() + i * 7);

                  const occurrenceEnd = new Date(slotEnd);
                  occurrenceEnd.setDate(occurrenceEnd.getDate() + i * 7);

                  if (occurrenceStart <= endPeriod) {
                    weeklyEventsTemp.push({
                      image: imageURL,
                      title: ` ${sku} - $${newPrice}`,
                      start: occurrenceStart,
                      end: occurrenceEnd,
                      allDay: false,
                      price: `${newPrice}`,
                      description: `Revert Price: $${revertPrice}`,
                      id: schedule._id,
                      sku,
                      eventType: "weekly",
                      productName: title,
                      weekly: true,
                    });
                  }
                }
              });
            });
          }
        }

        // Monthly Events
        else if (monthly) {
          const scheduleEndDate = endDate ? new Date(endDate) : endPeriod;

          for (
            let date = new Date(startDate);
            date <= scheduleEndDate;
            date.setMonth(date.getMonth() + 1)
          ) {
            Object.entries(monthlyTimeSlots).forEach(([day, timeSlots]) => {
              timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
                const slotStart = new Date(date);
                const slotEnd = new Date(date);

                slotStart.setDate(parseInt(day, 10));
                slotEnd.setDate(parseInt(day, 10));

                const [startHour, startMinute] = startTime.split(":").map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);
                slotStart.setHours(startHour, startMinute, 0);
                slotEnd.setHours(endHour, endMinute, 0);

                for (let i = 0; i < 6; i++) {
                  const occurrenceStart = new Date(slotStart);
                  occurrenceStart.setMonth(occurrenceStart.getMonth() + i);

                  const occurrenceEnd = new Date(slotEnd);
                  occurrenceEnd.setMonth(occurrenceEnd.getMonth() + i);

                  if (occurrenceStart <= endPeriod) {
                    monthlyEventsTemp.push({
                      image: imageURL,
                      title: `SKU: ${sku} - $${newPrice}`,
                      start: occurrenceStart,
                      end: occurrenceEnd,
                      allDay: false,
                      price: `${newPrice}`,
                      description: `Revert Price: $${revertPrice}`,
                      id: schedule._id,
                      sku,
                      eventType: "monthly",
                      productName: title,
                      monthly: true,
                    });
                  }
                }
              });
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
