import React, { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import axios from "axios";

const BASE_URL = 'http://localhost:3000';
// const BASE_URL = `https://api.priceobo.com`;

const CalendarView = ({ sku1 }) => {
  const [events, setEvents] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedEndDays, setSelectedEndDays] = useState([]);

  const now = new Date();


  const fetchSchedules = async () => {
    if (!sku1) {
      console.error("SKU is required to fetch schedules.");
      return;
    }

    try {
      const encodedSku = encodeURIComponent(sku1);
      const response = await axios.get(`${BASE_URL}/api/schedule/${encodedSku}`);
      const schedules = response.data.result;

      console.log("Fetched schedules:", schedules);

      const events = [];

      const filteredSchedules = schedules.filter(
        (sc)=> 

        (sc.monthly || sc.weekly  ) && sc.status !=="deleted"  ||

        ((sc.endDate === null || (sc.endDate && new Date(sc.endDate) >= now)) && sc.status !=="deleted")

      )

      filteredSchedules.forEach((schedule) => {
        const { startDate, endDate, price, currentPrice, sku, weekly, weeklyTimeSlots, monthly, monthlyTimeSlots } = schedule;

        if (!weekly && !monthly) {
          const start = new Date(startDate);
          const end = endDate ? new Date(endDate) : new Date(startDate);

        
          const dateRange = generateDateRange(start, end);
        
          events.push({
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start: new Date(startDate),
            end: endDate ? new Date(endDate) : new Date(startDate), 
            allDay: false,
            price: price || currentPrice,
            dateRange
          });
          events.push({
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start: endDate ? new Date(endDate) : new Date(startDate),
            end: endDate ? new Date(endDate) : new Date(startDate), 
            allDay: false,
            price: price || currentPrice,
            dateRange
          });
        } else if (weekly) {
          
          Object.entries(weeklyTimeSlots).forEach(([day, timeSlots]) => {
            timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
              const startDateObj = new Date(startDate);
              const endDateObj = new Date(startDate);

              startDateObj.setDate(startDateObj.getDate() + (parseInt(day, 10) - startDateObj.getDay()));
              endDateObj.setDate(endDateObj.getDate() + (parseInt(day, 10) - endDateObj.getDay()));

            
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
          
          Object.entries(monthlyTimeSlots).forEach(([date, timeSlots]) => {
            timeSlots.forEach(({ startTime, endTime, newPrice, revertPrice }) => {
              const startDateObj = new Date(startDate);
              const endDateObj = new Date(startDate);

         
              startDateObj.setDate(parseInt(date, 10));
              endDateObj.setDate(parseInt(date, 10));

             
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

      setEvents(events); 
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const generateDateRange = (start, end) => {
    const dateRange = [];
    let currentDate = new Date(start);

    while (currentDate <= end) {
      dateRange.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1); 
    }

    return dateRange;
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
 


  
  const handleDateSelect = (selected) => {
    setSelectedDays([selected]); 
    const selectedDate = selected[0] || selected;
    const scheduleForSelectedDate = events.find(
      (event) => new Date(event.start).toDateString() === selectedDate.toDateString()
    );
    setSelectedSchedule(scheduleForSelectedDate); 
  };

  return (
    <div className="m-3">
  
      <Calendar
        selectedDays={selectedDays} 
        onDateSelect={handleDateSelect} 
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
