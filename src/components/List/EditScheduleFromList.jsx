import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { MultiSelect } from "react-multi-select-component";
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import { daysOptions, datesOptions } from "../../utils/staticValue";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = `https://api.priceobo.com`;

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dateNames = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
  "18th",
  "19th",
  "20th",
  "21st",
  "22nd",
  "23rd",
  "24th",
  "25th",
  "26th",
  "27th",
  "28th",
  "29th",
  "30th",
  "31st",
];

const fetchProductDetails = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/product/${asin}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching product details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const fetchProductAdditionalDetails = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/details/${asin}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching additional product details:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const updateSchedule = async (
  asin,
  sku,
  scheduleId,
  startDate,
  endDate,
  price,
  currentPrice,
  userName,
  imageURL,
  weekly,
  weeklyTimeSlots = {},
  monthly,
  monthlyTimeSlots = {}
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/schedule/change/${scheduleId}`,
      {
        asin,
        sku,
        scheduleId,
        startDate,
        endDate,
        price,
        currentPrice,
        userName,
        imageURL,
        weekly,
        weeklyTimeSlots,
        monthly,
        monthlyTimeSlots,
        firstChange: false,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error updating schedule:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};
const deleteSchedule = async (scheduleId) => {
  try {
    const response = await axios.delete(
      `${BASE_URL}/api/schedule/change/${scheduleId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error deleting schedule:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const EditScheduleFromList = ({ show, onClose, asin, existingSchedule }) => {
  const { addEvent, removeEvent } = useContext(PriceScheduleContext);
  const [sku, setSku] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [indefiniteEndDate, setIndefiniteEndDate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [weekly, setWeekly] = useState(existingSchedule.weekly || false);
  const [loading, setLoading] = useState(false);

  // const [daysOfWeek, setDaysOfWeek] = useState(
  //   existingSchedule.daysOfWeek || []
  // );
  const [monthly, setMonthly] = useState(existingSchedule.monthly || false);
  // const [datesOfMonth, setDatesOfMonth] = useState(
  //   existingSchedule.datesOfMonth || []
  // );
  const [weeklyTimeSlots, setWeeklyTimeSlots] = useState(
    existingSchedule.weeklyTimeSlots || {}
  );
  const [monthlyTimeSlots, setMonthlyTimeSlots] = useState(
    existingSchedule.monthlyTimeSlots || {}
  );

  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [scheduleType, setScheduleType] = useState("");
  const [scheduleId, setScheduleId] = useState("");
  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false); // New state variable for controlling price input visibility

  const [slotToRemove, setSlotToRemove] = useState(null); // Track which slot is being removed
  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser.userName;

  const isUpdateMode = !!existingSchedule;
  console.log(existingSchedule);

  const productPrice = existingSchedule.currentPrice;
  /*
  
  const handleTimeSlotChange = (scheduleType, day, index, key, newTime) => {
    if (newTime instanceof Date && !isNaN(newTime)) {
      // We format the date as 'HH:mm' directly and do not convert it to UTC
      const formattedTime = formatTimeToHHMM(newTime);
      if (scheduleType === "weekly") {
        setWeeklyTimeSlots((prevSlots) => {
          const updatedSlots = { ...prevSlots };
          updatedSlots[day][index][key] = formattedTime; // Keep the time as 'HH:mm'
          return updatedSlots;
        });
      } else if (scheduleType === "monthly") {
        setMonthlyTimeSlots((prevSlots) => {
          const updatedSlots = { ...prevSlots };
          updatedSlots[day][index][key] = formattedTime; // Keep the time as 'HH:mm'
          return updatedSlots;
        });
      }
    } else {
      console.error("Invalid date object for time:", newTime);
    }
  };*/
  const handleTimeSlotChange = (scheduleType, day, index, key, newTime) => {
    if (newTime instanceof Date && !isNaN(newTime)) {
      const formattedTime = formatTimeToHHMM(newTime);
      if (scheduleType === "weekly") {
        setWeeklyTimeSlots((prevSlots) => {
          const updatedSlots = { ...prevSlots };
          updatedSlots[day][index][key] = formattedTime;
          return updatedSlots;
        });
      } else if (scheduleType === "monthly") {
        setMonthlyTimeSlots((prevSlots) => {
          const updatedSlots = { ...prevSlots };
          updatedSlots[day][index][key] = formattedTime;
          return updatedSlots;
        });
      }
    } else {
      console.error("Invalid date object for time:", newTime);
    }
  };
  // Format 'Date' object to 'HH:mm' without converting to UTC
  const formatTimeToHHMM = (date) => {
    const adjustedDate = new Date(date.getTime() - 6 * 60 * 60 * 1000); // Subtract 6 hours
    const hours = adjustedDate.getHours().toString().padStart(2, "0");
    const minutes = adjustedDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  /*
  const convertTimeStringToDate = (timeString) => {
    if (typeof timeString === "string" && timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const now = new Date();
        now.setHours(hours, minutes, 0, 0); // Set the time while keeping the current date
        return now;
      }
    }
    return new Date(); // Fallback to current time if the timeString is invalid
  };
  */
  // Convert UTC time string to local date object
  const convertTimeStringToDate = (timeString) => {
    if (typeof timeString === "string" && timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const now = new Date();
        now.setUTCHours(hours, minutes, 0, 0); // Interpret as UTC hours
        return now; // Local time will be automatically adjusted
      }
    }
    return new Date(); // Fallback to current time if the timeString is invalid
  };
  const convertUtcToLocalDate = (timeString) => {
    if (typeof timeString === "string" && timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const now = new Date();
        now.setUTCHours(hours, minutes, 0, 0); // Treat the time as UTC
        return new Date(now); // This will automatically convert UTC to local time
      }
    }
    return new Date(); // Fallback to current time if the timeString is invalid
  };

  useEffect(() => {
    if (show && existingSchedule) {
      setStartDate(new Date(existingSchedule.startDate));
      setEndDate(
        existingSchedule.endDate
          ? new Date(existingSchedule.endDate)
          : new Date()
      );
      setIndefiniteEndDate(!existingSchedule.endDate);
      setStartTime(new Date());
      setEndTime(new Date());

      if (existingSchedule.weekly) {
        setScheduleType("weekly");
        setWeeklyTimeSlots(existingSchedule.weeklyTimeSlots || {});
      } else if (existingSchedule.monthly) {
        setScheduleType("monthly");
        setMonthlyTimeSlots(existingSchedule.monthlyTimeSlots || {});
      } else {
        setScheduleType("one-time");
      }
    }
  }, [show, existingSchedule]);

  useEffect(() => {
    if (show && asin) {
      fetchProductDetailsByAsin(asin);
      setPrice(existingSchedule.price);
      setCurrentPrice(existingSchedule.currentPrice);
    }
  }, [show, asin]);

  const fetchProductDetailsByAsin = async (asin) => {
    try {
      const data = await fetchProductDetails(asin);
      const productDetails = data.payload[0].Product.Offers[0];
      setSku(productDetails.SellerSKU);
      // setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);

      const additionalData = await fetchProductAdditionalDetails(asin);
      setTitle(additionalData.payload.AttributeSets[0].Title);
      setImageUrl(additionalData.payload.AttributeSets[0].SmallImage.URL);
    } catch (error) {
      setErrorMessage(
        "Error fetching product details: " +
          (error.response ? error.response.data.error : error.message)
      );
      console.error("Error fetching product details:", error);
    }
  };
  // const convertTimeToUtc = (time) => {
  //   return moment(time).utc().format("HH:mm");
  // };

  const convertTimeToUtc = (timeString) => {
    const date = convertTimeStringToDate(timeString); // Convert time string to Date object
    return moment(date).utc().format("HH:mm"); // Convert the Date object to UTC format (HH:mm)
  };

  // Convert local time to UTC (for saving to MongoDB)
  const convertLocalTimeToUTC = (date) => {
    const utcDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return utcDate.toISOString().split("T")[1].slice(0, 5); // Return as "HH:mm" in UTC
  };

  /*
  const handleTimeSlotPriceChange = (
    scheduleType,
    identifier,
    index,
    value
  ) => {
    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier][index]["newPrice"] = value;
        return updatedSlots;
      });
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier][index]["newPrice"] = value;
        return updatedSlots;
      });
    }
  };
*/
  const handleTimeSlotPriceChange = (
    scheduleType,
    identifier,
    index,
    key,
    value
  ) => {
    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier][index][key] = value;
        return updatedSlots;
      });
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier][index][key] = value;
        return updatedSlots;
      });
    }
  };

  const handleAddTimeSlot = (scheduleType, identifier) => {
    const currentDate = new Date();
    const endDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // Set endTime 1 hour after startTime

    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: [
          ...(prevSlots[identifier] || []),
          {
            startTime: currentDate,
            endTime: endDate,
            newPrice: "",
            revertPrice: "",
          }, // Store Date objects
        ],
      }));
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: [
          ...(prevSlots[identifier] || []),
          {
            startTime: currentDate,
            endTime: endDate,
            newPrice: "",
            revertPrice: "",
          }, // Store Date objects
        ],
      }));
    }
  };

  /*
  const handleRemoveTimeSlot = (scheduleType, identifier, index) => {
    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: prevSlots[identifier].filter((_, i) => i !== index),
      }));
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: prevSlots[identifier].filter((_, i) => i !== index),
      }));
    }
  };

*/
  /*const handleRemoveTimeSlot = (scheduleType, identifier, index) => {
    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier] = updatedSlots[identifier].filter((_, i) => i !== index);
  
        // If no more time slots remain for the day, remove the day entirely
        if (updatedSlots[identifier].length === 0) {
          delete updatedSlots[identifier];
        }
  
        return updatedSlots;
      });
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier] = updatedSlots[identifier].filter((_, i) => i !== index);
  
        // If no more time slots remain for the date, remove the date entirely
        if (updatedSlots[identifier].length === 0) {
          delete updatedSlots[identifier];
        }
  
        return updatedSlots;
      });
    }
  };*/

  const handleRemoveTimeSlot = (scheduleType, identifier, index) => {
    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier] = updatedSlots[identifier].filter(
          (_, i) => i !== index
        );

        // If no more time slots remain for the day, remove the day entirely
        if (updatedSlots[identifier].length === 0) {
          delete updatedSlots[identifier];
        }

        return updatedSlots;
      });
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier] = updatedSlots[identifier].filter(
          (_, i) => i !== index
        );

        // If no more time slots remain for the date, remove the date entirely
        if (updatedSlots[identifier].length === 0) {
          delete updatedSlots[identifier];
        }

        return updatedSlots;
      });
    }
  };
  /*

  const confirmRemoveTimeSlot = () => {
    const { scheduleType, identifier, index } = slotToRemove;

    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier].splice(index, 1);
        
        if (updatedSlots[identifier].length === 0) {
          delete updatedSlots[identifier]; // Remove the day if no time slots remain
        }

        return updatedSlots;
      });
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => {
        const updatedSlots = { ...prevSlots };
        updatedSlots[identifier].splice(index, 1);

        if (updatedSlots[identifier].length === 0) {
          delete updatedSlots[identifier]; // Remove the date if no time slots remain
        }

        return updatedSlots;
      });
    }

    setSlotToRemove(null);
    setShowConfirmationModal(false);
  };

  const cancelRemoveTimeSlot = () => {
    setSlotToRemove(null);
    setShowConfirmationModal(false);
  };*/

  /*
  const validateTimeSlots = () => {
    // Check weekly slots
    for (const day in weeklyTimeSlots) {
      for (const slot of weeklyTimeSlots[day]) {
        if (slot.startTime >= slot.endTime) {
          setErrorMessage(
            `For day ${day}, start time must be earlier than end time.`
          );
          return false;
        }
      }
    }*/
      const validateTimeSlots = () => {
        const isTimeSlotOverlapping = (start1, end1, start2, end2) => {
          return start1 < end2 && start2 < end1;
        };
    
        const formatTime = (date) => {
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        };
    
        // Check for overlapping weekly time slots
        for (const day in weeklyTimeSlots) {
          const slots = weeklyTimeSlots[day];
          for (let i = 0; i < slots.length; i++) {
            const slot1 = slots[i];
    
            // Check if start time is before end time
            if (slot1.startTime >= slot1.endTime) {
              setErrorMessage(`For day ${day}, start time must be earlier than end time.`);
              return false;
            }
    
            // Check for overlaps with other time slots on the same day
            for (let j = i + 1; j < slots.length; j++) {
              const slot2 = slots[j];
              if (isTimeSlotOverlapping(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
                setErrorMessage(
                  `Time slots for day ${day} overlap between ${formatTime(slot1.startTime)} - ${formatTime(
                    slot1.endTime
                  )} and ${formatTime(slot2.startTime)} - ${formatTime(slot2.endTime)}.`
                );
                return false;
              }
            }
          }
        }
    
        // Check for overlapping monthly time slots
        for (const date in monthlyTimeSlots) {
          const slots = monthlyTimeSlots[date];
          for (let i = 0; i < slots.length; i++) {
            const slot1 = slots[i];
    
            // Check if start time is before end time
            if (slot1.startTime >= slot1.endTime) {
              setErrorMessage(`For date ${date}, start time must be earlier than end time.`);
              return false;
            }
    
            // Check for overlaps with other time slots on the same date
            for (let j = i + 1; j < slots.length; j++) {
              const slot2 = slots[j];
              if (isTimeSlotOverlapping(slot1.startTime, slot1.endTime, slot2.startTime, slot2.endTime)) {
                setErrorMessage(
                  `Time slots for date ${date} overlap between ${formatTime(slot1.startTime)} - ${formatTime(
                    slot1.endTime
                  )} and ${formatTime(slot2.startTime)} - ${formatTime(slot2.endTime)}.`
                );
                return false;
              }
            }
          }
        }
    
        return true;
      };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const utcStartTime = convertTimeToUtc(startTime);
      // const utcEndTime = convertTimeToUtc(endTime);

      if (!indefiniteEndDate && endDate < startDate) {
        setErrorMessage("End Date cannot be earlier than Start Date.");
        setLoading(false);
        return;
      }
      // if (!validateTimeSlots()) {
      //   // setErrorMessage("Set correct time.");
      //   setLoading(false);
      //   return;
      // }

      if (!validateTimeSlots()) {
        return;
      }
      const overlappingSchedule = existingSchedule && (() => {
        console.log(existingSchedule.status);
      
        // Skip deleted schedules
        if (existingSchedule.status === "deleted") return false;
      
        // Only consider single-day schedules for overlap checking
        // if (!existingSchedule.singleDay) return false;
      
        const existingStart = new Date(existingSchedule.startDate);
        const existingEnd = existingSchedule.endDate ? new Date(existingSchedule.endDate) : null;
      
        // If the existing schedule has no end date, treat it as indefinite
        if (!existingEnd) {
          return true; // Block any new schedule if an existing one is indefinite
        }
      
        // Check for overlaps between the new schedule and the existing schedule
        return (
          (startDate <= existingStart) 
         
          
        );
      })();
      
      
      // if (overlappingSchedule) {
      //   setErrorMessage(
      //     "Cannot create a schedule during an existing scheduled period."
      //   );
      //   setLoading(false);
      //   return;
      // }



      // await updateSchedule(
      //   asin,
      //   sku,
      //   existingSchedule._id,
      //   startDate,
      //   indefiniteEndDate ? null : endDate,
      //   price,
      //   currentPrice,
      //   userName,
      //   imageURL,
      //   weekly,
      //   daysOfWeek.map(day=>day.value),
      //   monthly,
      //   datesOfMonth.map(date=>date.value),
      //   utcStartTime,
      //   utcEndTime
      // );

      const utcWeeklySlots = {};
      const utcMonthlySlots = {};
      /*
      if (weekly) {
        console.log("weekly: "+weeklyTimeSlots)
        for (const [day, timeSlots] of Object.entries(weeklyTimeSlots)) {
          console.log("slots"+JSON.stringify(timeSlots.timeSlotScheduleId));
          utcWeeklySlots[day] = timeSlots.map(
            
            ({ startTime, endTime, newPrice, revertPrice }) => ({
              startTime: convertTimeToUtc(startTime),
              endTime: convertTimeToUtc(endTime),
              newPrice: parseFloat(newPrice),
              revertPrice: parseFloat(revertPrice),
              timeSlotScheduleId:timeSlots.timeSlotScheduleId
              
            })
          );
        }
      }
      
*/
      if (weekly) {
        console.log("weekly: " + JSON.stringify(weeklyTimeSlots));
        for (const [day, timeSlots] of Object.entries(weeklyTimeSlots)) {
          console.log(
            "slots" +
              JSON.stringify(timeSlots.map((slot) => slot.timeSlotScheduleId))
          );
          utcWeeklySlots[day] = timeSlots.map(
            ({
              startTime,
              endTime,
              newPrice,
              revertPrice,
              timeSlotScheduleId,
            }) => ({
              startTime: convertTimeToUtc(startTime),
              endTime: convertTimeToUtc(endTime),
              newPrice: parseFloat(newPrice),
              revertPrice: parseFloat(revertPrice),
              timeSlotScheduleId: timeSlotScheduleId,
            })
          );
        }
      }

      if (monthly) {
        for (const [date, timeSlots] of Object.entries(monthlyTimeSlots)) {
          utcMonthlySlots[date] = timeSlots.map(
            ({
              startTime,
              endTime,
              newPrice,
              revertPrice,
              timeSlotScheduleId,
            }) => ({
              startTime: convertTimeToUtc(startTime),
              endTime: convertTimeToUtc(endTime),
              newPrice: parseFloat(newPrice),
              revertPrice: parseFloat(revertPrice),
              timeSlotScheduleId: timeSlotScheduleId,
            })
          );
        }
      }
      // const updatedDaysOfWeek = daysOfWeek.filter(day => day).map(day => day.value || day);
      // const updatedDatesOfMonth = datesOfMonth.filter(date => date).map(date => date.value || date);
      // console.log("time and sinn "+asin+utcStartTime+utcEndTime);
      const updateData = {
        startDate,
        endDate: indefiniteEndDate ? null : endDate,
        price: parseFloat(price), // Ensure price is a number
        currentPrice: parseFloat(currentPrice), // Ensure currentPrice is a number
        userName,
        title,
        asin,
        sku,
        imageURL,
        weekly: scheduleType === "weekly",
        weeklyTimeSlots: utcWeeklySlots,
        monthly: scheduleType === "monthly",
        monthlyTimeSlots: utcMonthlySlots,
      };
      //startTime:startTime.toTimeString().slice(0, 5),
      //endTime:endTime.toTimeString().slice(0, 5)

      await axios.put(
        `${BASE_URL}/api/schedule/change/${existingSchedule._id}`,
        updateData
      );

      
      addEvent({
        title: `SKU: ${sku} - $${price}`,
        start: startDate,
        end: indefiniteEndDate ? null : endDate,
        allDay: false,
      });

      // setSuccessMessage(`Price update scheduled successfully for SKU: ${sku}`);
      setSuccessMessage(`Price schedule successfully ${isUpdateMode ? "updated" : "created"}`);

      setShowSuccessModal(true);
      onClose();
    } catch (error) {
      setErrorMessage(
        "Error scheduling price update: " +
          (error.response ? error.response.data.error : error.message)
      );
      console.error("Error scheduling price update:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSchedule(existingSchedule._id);
      removeEvent(existingSchedule._id);
      setSuccessMessage(`Schedule deleted successfully for SKU: ${sku}`);
      setShowSuccessModal(true);
      onClose();
    } catch (error) {
      setErrorMessage(
        "Error deleting schedule: " +
          (error.response ? error.response.data.error : error.message)
      );
      console.error("Error deleting schedule:", error);
    }
  };

  const handleShowConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
  };

  const handleSetPriceClick = () => {
    setShowPriceInput(!showPriceInput); // Show the price input field when the button is clicked
  };

  const handleDayChange = (value) => {
    setDaysOfWeek((prevDays) =>
      prevDays.includes(value)
        ? prevDays.filter((day) => day !== value)
        : [...prevDays, value]
    );
  };

  const handleDateChange = (value) => {
    setDatesOfMonth((prevDates) =>
      prevDates.includes(value)
        ? prevDates.filter((date) => date !== value)
        : [...prevDates, value]
    );
  };

  const parseTimeString = (timeString) => {
    if (!timeString || typeof timeString !== "string") {
      // If timeString is not valid, return a default date (current date or a new Date object)
      return new Date();
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  // Utility function to convert "HH:mm" format to a Date object
  const timeStringToDate = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };
  const dateToTimeString = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Schedule Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formAsin" style={{ marginBottom: "15px" }}>
              <Form.Label>ASIN: {asin}</Form.Label>
            </Form.Group>
         
            {showPriceInput && (
              <>
              <Form.Group
                controlId="formNewPrice"
                style={{ marginBottom: "15px" }}
              >
                <Form.Label>Start Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter New Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Form.Group>
              <Form.Group
                controlId="formNewPrice"
                style={{ marginBottom: "15px" }}
              >
                <Form.Label>End Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter End Price"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(e.target.value)}
                />
              </Form.Group>
              </>
            )}
            {scheduleType === "one-time" && (
              <>
                <Form.Group
                  controlId="formStartDate"
                  style={{ marginBottom: "15px" }}
                >
                  <Form.Label>Start Date and Time</Form.Label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showTimeSelect
                    dateFormat="Pp"
                    className="form-control"
                    required
                  />
                </Form.Group>
                <Form.Group
                  controlId="formIndefiniteEndDate"
                  style={{ marginBottom: "15px" }}
                >
                  <Form.Check
                    type="checkbox"
                    label="Until I change."
                    checked={indefiniteEndDate}
                    onChange={() => setIndefiniteEndDate(!indefiniteEndDate)}
                  />
                </Form.Group>
                {!indefiniteEndDate && (
                  <Form.Group
                    controlId="formEndDate"
                    style={{ marginBottom: "15px" }}
                  >
                    <Form.Label>End Date and Time</Form.Label>
                    <DatePicker
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      showTimeSelect
                      dateFormat="Pp"
                      className="form-control"
                      required={!indefiniteEndDate}
                    />
                  </Form.Group>

                )}
               
              </>
            )}
            {scheduleType === "weekly" && (
              <>
                {daysOptions.map((day) => (
                  <div key={day.value}>
                    <Form.Label>{day.label}</Form.Label>
                    {(weeklyTimeSlots[day.value] || []).map((slot, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center mb-2"
                      >
                        {/* <p>{convertTimeStringToDate(slot.startTime)}</p> */}
                        <DatePicker
                          // selected={slot.startTime ? parseTimeString(slot.startTime) : new Date()}
                          selected={
                            slot.startTime
                              ? convertTimeStringToDate(slot.startTime)
                              : new Date()
                          }
                          // selected={slot.startTime}

                          // selected={slot.startTime}
                          onChange={(time) =>
                            handleTimeSlotChange(
                              "weekly",
                              day.value,
                              index,
                              "startTime",
                              time
                            )
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Start"
                          dateFormat="h:mm aa"
                          className="form-control me-2"
                        />
                        <DatePicker
                          //  selected={slot.endTime ? parseTimeString(slot.endTime) : new Date()}
                          selected={
                            slot.endTime
                              ? convertTimeStringToDate(slot.endTime)
                              : new Date()
                          }
                          // selected={slot.endTime}
                          // onChange={(time) =>
                          //   handleTimeSlotChange("weekly", day.value, index, "endTime", time)
                          // }
                          onChange={(time) =>
                            handleTimeSlotChange(
                              "weekly",
                              day.value,
                              index,
                              "endTime",
                              time
                            )
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="End"
                          dateFormat="h:mm aa"
                          className="form-control"
                        />
                        <Form.Control
                          type="number"
                          value={slot.newPrice}
                          placeholder="New Price"
                          step="0.01"
                          onChange={(e) =>
                            handleTimeSlotPriceChange(
                              "weekly",
                              day.value,
                              index,
                              "newPrice",
                              e.target.value
                            )
                          }
                          required
                          className="me-2"
                        />
                        <Form.Control
                          type="number"
                          value={slot.revertPrice}
                          placeholder="Revert Price"
                          step="0.01"
                          onChange={(e) =>
                            handleTimeSlotPriceChange(
                              "weekly",
                              day.value,
                              index,
                              "revertPrice",
                              e.target.value
                            )
                          }
                          required
                          className="me-2"
                        />
                        <Button
                          variant="danger"
                          onClick={() =>
                            handleRemoveTimeSlot("weekly", day.value, index)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="primary"
                      onClick={() => handleAddTimeSlot("weekly", day.value)}
                      className="mb-3"
                    >
                      Add Time Slot
                    </Button>
                  </div>
                ))}
              </>
            )}
            {scheduleType === "monthly" && (
              <>
                {datesOptions.map((date) => (
                  <div key={date.value}>
                    <Form.Label>{date.label}</Form.Label>
                    {(monthlyTimeSlots[date.value] || []).map((slot, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-center mb-2"
                      >
                        <DatePicker
                          selected={
                            slot.startTime
                              ? convertTimeStringToDate(slot.startTime)
                              : new Date()
                          } // Parse the time string
                          onChange={(time) =>
                            handleTimeSlotChange(
                              "monthly",
                              date.value,
                              index,
                              "startTime",
                              time
                            )
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Start"
                          dateFormat="h:mm aa"
                          className="form-control me-2"
                        />
                        <DatePicker
                          selected={
                            slot.endTime
                              ? convertTimeStringToDate(slot.endTime)
                              : new Date()
                          } // Parse the time string
                          onChange={(time) =>
                            handleTimeSlotChange(
                              "monthly",
                              date.value,
                              index,
                              "endTime",
                              time
                            )
                          }
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="End"
                          dateFormat="h:mm aa"
                          className="form-control"
                        />

                        <Form.Control
                          type="number"
                          value={slot.newPrice}
                          placeholder="New Price"
                          step="0.01"
                          onChange={(e) =>
                            handleTimeSlotPriceChange(
                              "monthly",
                              date.value,
                              index,
                              "newPrice",
                              e.target.value
                            )
                          }
                          required
                          className="me-2"
                        />
                        <Form.Control
                          type="number"
                          value={slot.revertPrice}
                          placeholder="Revert Price"
                          step="0.01"
                          onChange={(e) =>
                            handleTimeSlotPriceChange(
                              "monthly",
                              date.value,
                              index,
                              "revertPrice",
                              e.target.value
                            )
                          }
                          required
                          className="me-2"
                        />
                        <Button
                          variant="danger"
                          onClick={() =>
                            handleRemoveTimeSlot("monthly", date.value, index)
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="primary"
                      onClick={() => handleAddTimeSlot("monthly", date.value)}
                      className="mb-3"
                    >
                      Add Time Slot
                    </Button>
                  </div>
                ))}
              </>
            )}
            <Button
              style={{ width: "40%", backgroundColor: "black" }}
              type="submit"
            >
              Update Schedule
            </Button>
            <Button
              variant="danger"
              style={{ width: "40%", marginLeft: "10px" }}
              onClick={handleShowConfirmation}
            >
              Delete Schedule
            </Button>

            
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Operation Successful!</Modal.Title>
        </Modal.Header>
      </Modal>
      <Modal show={showConfirmationModal} onHide={handleCloseConfirmation}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this schedule?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseConfirmation}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EditScheduleFromList;
