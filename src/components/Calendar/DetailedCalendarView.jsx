import React, { useContext, useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import { PriceScheduleContext } from "@/contexts/PriceScheduleContext"; // Import the context

const CalendarView = () => {
  const { events } = useContext(PriceScheduleContext); // Get the events from the context
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null); // State to store the schedule data for the selected date

  useEffect(() => {
    // Map the events' start dates to selectedDays array
    const scheduleDates = events.map((event) => new Date(event.start));
    setSelectedDays(scheduleDates); // Set the selected dates
  }, [events]);

  const handleDateSelect = (selected) => {
    setSelectedDays((prev) => [...prev, selected]); // Keep previously selected dates
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
          <p><strong>End:</strong> {selectedSchedule.end.toLocaleString()}</p>
          <p><strong>Price:</strong> ${selectedSchedule.title.split('$')[1]}</p>
        </div>
      )} */}
    </div>
  );
};

export default CalendarView;
