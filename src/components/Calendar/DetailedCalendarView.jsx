import React, { useEffect, useState } from "react";
import { Calendar } from "../ui/calendar";
import axios from "axios";
// import moment from "moment-timezone";

const BASE_URL = `https://api.priceobo.com`;
// const BASE_URL = "http://localhost:3000";

const CalendarView = ({ sku1 }) => {
  const [events, setEvents] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const now = new Date();
  const endPeriod = new Date(now);
  endPeriod.setMonth(now.getMonth() + 6);

  const convertToNewYorkTime = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const options = {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
      hourCycle: "h23", // To use 24-hour format
    };
    const [
      { value: month },
      ,
      { value: day },
      ,
      { value: year },
      ,
      { value: hour },
      ,
      { value: minute },
      ,
      { value: second },
      ,
      { value: millisecond },
    ] = new Intl.DateTimeFormat("en-US", options).formatToParts(date);

    return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}Z`;
  };

  const fetchSchedules = async () => {
    if (!sku1) {
      console.error("SKU is required to fetch schedules.");
      return;
    }

    try {
      const encodedSku = encodeURIComponent(sku1);
      console.log("encodedSku :" + encodedSku);
      const response = await axios.get(
        `${BASE_URL}/api/schedule/${encodedSku}`
      );
      const schedules = response.data.result;
      const events = [];

      const filteredSchedules = schedules.filter(
        (sc) =>
          ((sc.monthly || sc.weekly) && sc.status !== "deleted") ||
          ((sc.endDate === null ||
            (sc.endDate && new Date(sc.endDate) >= now)) &&
            sc.status !== "deleted")
      );

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
        } = schedule;
        const start = convertToNewYorkTime(startDate);
        // start= formatDate(start);
        console.log("start :" + start + "startDate" + startDate);
        const end = endDate ? new Date(endDate) : endPeriod;

        if (!weekly && !monthly) {
          // start= formatDate(start)
          events.push({
            title: `SKU: ${sku} - $${price || currentPrice}`,
            start,
            end,
            allDay: true,
            price: price || currentPrice,
          });
        } else if (weekly) {
          // Repeat weekly schedules within the next 5 months
          for (
            let date = new Date(start);
            date <= endPeriod;
            date.setDate(date.getDate() + 7)
          ) {
            Object.entries(weeklyTimeSlots).forEach(([day, timeSlots]) => {
              const dayOffset = (parseInt(day, 10) - date.getDay() + 7) % 7;
              const targetDate = new Date(date);
              targetDate.setDate(targetDate.getDate() + dayOffset);

              timeSlots.forEach(
                ({ startTime, endTime, newPrice, revertPrice }) => {
                  const [startHour, startMinute] = startTime
                    .split(":")
                    .map(Number);
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
                }
              );
            });
          }
        } else if (monthly) {
          // Repeat monthly schedules within the next 5 months
          for (
            let date = new Date(start);
            date <= endPeriod;
            date.setMonth(date.getMonth() + 1)
          ) {
            Object.entries(monthlyTimeSlots).forEach(([day, timeSlots]) => {
              timeSlots.forEach(
                ({ startTime, endTime, newPrice, revertPrice }) => {
                  const slotStart = new Date(date);
                  const slotEnd = new Date(date);
                  slotStart.setDate(parseInt(day, 10));
                  slotEnd.setDate(parseInt(day, 10));
                  const [startHour, startMinute] = startTime
                    .split(":")
                    .map(Number);
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
                }
              );
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

  // Handle date selection in the calendar
  const handleDateSelect = (selected) => {
    setSelectedDays([selected]); // Set the selected date
    const selectedDate = selected[0] || selected; // Handle single date selection
    const scheduleForSelectedDate = events.find(
      (event) =>
        new Date(event.start).toDateString() === selectedDate.toDateString()
    );
    setSelectedSchedule(scheduleForSelectedDate); // Set the schedule for the selected date
  };

  return (
    <div className="m-3">
      <Calendar
        selectedDays={selectedDays}
        onDateSelect={handleDateSelect} // Handle the date selection
        className="rounded-md border w-full"
      />
    </div>
  );
};

export default CalendarView;
