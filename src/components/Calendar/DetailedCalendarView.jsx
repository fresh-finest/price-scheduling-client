import React, { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import axios from "axios";

// const BASE_URL = 'http://localhost:3000';
const BASE_URL = `https://api.priceobo.com`;

const CalendarView = ({ sku1 }) => {
  const [events, setEvents] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const now = new Date();
  const endPeriod = new Date(now);
  endPeriod.setMonth(now.getMonth() + 5); // Extend to 5 months ahead

  const fetchSchedules = async () => {
    if (!sku1) {
      console.error("SKU is required to fetch schedules.");
      return;
    }

    try {
      const encodedSku = encodeURIComponent(sku1);
      const response = await axios.get(`${BASE_URL}/api/schedule/${encodedSku}`);
      const schedules = response.data.result;
      const events = [];

      const filteredSchedules = schedules.filter(
        (sc) =>
          ((sc.monthly || sc.weekly) && sc.status !== "deleted") ||
          ((sc.endDate === null || (sc.endDate && new Date(sc.endDate) >= now)) &&
            sc.status !== "deleted")
      );

      filteredSchedules.forEach((schedule) => {
        const { startDate, endDate, price, currentPrice, sku, weekly, weeklyTimeSlots, monthly, monthlyTimeSlots } = schedule;
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : endPeriod;

        if (!weekly && !monthly) {
          const dateRange = generateDateRange(start, end);
          events.push({
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start,
            end,
            allDay: false,
            price: price || currentPrice,
            dateRange,
          });
        } else if (weekly) {
          // Repeat weekly schedules within the next 5 months
          for (let date = new Date(start); date <= endPeriod; date.setDate(date.getDate() + 7)) {
            Object.entries(weeklyTimeSlots).forEach(([day, timeSlots]) => {
              const dayOffset = (parseInt(day, 10) - date.getDay() + 7) % 7;
              const targetDate = new Date(date);
              targetDate.setDate(targetDate.getDate() + dayOffset);
              
              timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
                const [startHour, startMinute] = startTime.split(":").map(Number);
                const [endHour, endMinute] = endTime.split(":").map(Number);
                const slotStart = new Date(targetDate);
                const slotEnd = new Date(targetDate);
                slotStart.setHours(startHour, startMinute, 0);
                slotEnd.setHours(endHour, endMinute, 0);

                if (slotStart <= endPeriod) {
                  events.push({
                    title: `SKU: ${sku} - $${newPrice}`,
                    start: slotStart,
                    end: slotEnd,
                    allDay: false,
                    description: `Revert Price: $${revertPrice}`,
                  });
                }
              });
            });
          }
        } else if (monthly) {
          // Repeat monthly schedules within the next 5 months
          for (let date = new Date(start); date <= endPeriod; date.setMonth(date.getMonth() + 1)) {
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

                if (slotStart <= endPeriod) {
                  events.push({
                    title: `SKU: ${sku} - $${newPrice}`,
                    start: slotStart,
                    end: slotEnd,
                    allDay: false,
                    description: `Revert Price: $${revertPrice}`,
                  });
                }
              });
            });
          }
        }
      });

      setEvents(events); // Update the state with parsed events
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  useEffect(() => {
    if (sku1) {
      fetchSchedules();
    }
  }, [sku1]);


 
  useEffect(() => {
    const scheduleStartDates = events.map((event) => new Date(event.start));
  
    setSelectedDays(scheduleStartDates); 
   
  }, [events]);
 

// useEffect(() => {
//   const scheduleDates = events.map((event) => ({
//     start: new Date(event.start),
//     end: new Date(event.end),
//   }));

//   const scheduleStartDates = scheduleDates.map((date) => date.start);
//   const scheduleEndDates = scheduleDates.map((date) => date.end);

//   setSelectedDays(scheduleStartDates);
//   setSelectedEndDays(scheduleEndDates);
// }, [events]);


  

  

  // Handle date selection in the calendar
  const handleDateSelect = (selected) => {
    setSelectedDays([selected]); // Set the selected date
    const selectedDate = selected[0] || selected; // Handle single date selection
    const scheduleForSelectedDate = events.find(
      (event) => new Date(event.start).toDateString() === selectedDate.toDateString()
    );
    setSelectedSchedule(scheduleForSelectedDate); // Set the schedule for the selected date
  };

  return (
    <div className="m-3">
      {/* Pass selectedDays and onDateSelect to the Calendar component */}
      <Calendar
        selectedDays={selectedDays} 
        onDateSelect={handleDateSelect} // Handle the date selection
        className="rounded-md border w-full"
      />

      {/* Show selected schedule details */}
      {/* {selectedSchedule && (
        <div className="mt-4 p-4 bg-white shadow-md rounded-md">
          <h3>Schedule Details for {selectedSchedule.title}</h3>
          <p><strong>Start:</strong> {selectedSchedule.start.toLocaleString()}</p>
          {selectedSchedule.end ? (
            <p><strong>End:</strong> {selectedSchedule.end.toLocaleString()}</p>
          ) : (
            <p><strong>End:</strong> Same as start date</p>
          )}
          <p><strong>Price:</strong> ${selectedSchedule.title.split('$')[1]}</p>
          {selectedSchedule.description && (
            <p><strong>Description:</strong> {selectedSchedule.description}</p>
          )}
        </div>
      )} */}
    </div>
  );
};

export default CalendarView;