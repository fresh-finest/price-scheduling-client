import React, { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import axios from "axios";

const BASE_URL = 'http://localhost:3000';

const CalendarView = ({ asin }) => {
  const [events, setEvents] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);

  console.log("ASIN in calendar: " + asin);

  // Fetch schedules based on the provided ASIN
  const fetchSchedules = async () => {
    if (!asin) {
      console.error("ASIN is required to fetch schedules.");
      return;
    }

    try {
      const response = await axios.get(`${BASE_URL}/api/schedule`);
      const schedules = response.data.result;

      console.log("Fetched schedules:", schedules);

      const events = [];

      schedules.forEach((schedule) => {
        const { startDate, endDate, price, currentPrice, sku, weekly, weeklyTimeSlots, monthly, monthlyTimeSlots } = schedule;

        if (!weekly && !monthly) {
          // Single-day schedule
          events.push({
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start: new Date(startDate),
            end: endDate ? new Date(endDate) : new Date(startDate), // If endDate is null, use startDate
            allDay: false,
            price: price || currentPrice,
          });
        } else if (weekly) {
          // Weekly schedule with multiple time slots
          Object.entries(weeklyTimeSlots).forEach(([day, timeSlots]) => {
            timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
              const startDateObj = new Date(startDate);
              const endDateObj = new Date(startDate);

              // Adjust the date for the correct day of the week
              startDateObj.setDate(startDateObj.getDate() + (parseInt(day, 10) - startDateObj.getDay()));
              endDateObj.setDate(endDateObj.getDate() + (parseInt(day, 10) - endDateObj.getDay()));

              // Set the time for the time slot
              const [startHour, startMinute] = startTime.split(":").map(Number);
              const [endHour, endMinute] = endTime.split(":").map(Number);
              startDateObj.setHours(startHour, startMinute, 0);
              endDateObj.setHours(endHour, endMinute, 0);

              events.push({
                title: `SKU: ${sku} - $${newPrice}`,
                start: startDateObj,
                end: endDateObj,
                allDay: false,
                description: `Revert Price: $${revertPrice}`,
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

              events.push({
                title: `SKU: ${sku} - $${newPrice}`,
                start: startDateObj,
                end: endDateObj,
                allDay: false,
                description: `Revert Price: $${revertPrice}`,
              });
            });
          });
        }
      });

      setEvents(events); // Update the state with parsed events
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  // Fetch schedules when the component mounts and when the ASIN changes
  useEffect(() => {
    if (asin) {
      fetchSchedules();
    }
  }, [asin]);

  // Map the events' start dates to selectedDays array whenever events change
  useEffect(() => {
    const scheduleDates = events.map((event) => new Date(event.start));
    setSelectedDays(scheduleDates); // Set the selected dates
  }, [events]);

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
        selectedDays={selectedDays} // Pass the selected dates
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
