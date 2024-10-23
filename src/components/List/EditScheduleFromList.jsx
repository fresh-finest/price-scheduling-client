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
import ProductDetailsWithNumbers from "../shared/ProductDetailsWithNumbers";
import { FaPlus } from "react-icons/fa";
import { Card } from "../ui/card";
import { IoMdClose } from "react-icons/io";
import "./EditScheduleFromList.css";
import { BsClipboardCheck } from "react-icons/bs";
import { MdCheck } from "react-icons/md";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = `https://api.priceobo.com`;
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

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
const fetchPriceBySku = async (sku) => {
  try {
    const encodedSku = encodeURIComponent(sku); // Encode the SKU to handle special characters
    const response = await axios.get(`${BASE_URL}/list/${encodedSku}`);
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const EditScheduleFromList = ({
  show,
  onClose,
  asin,
  existingSchedule,
  editScheduleModalTitle,
}) => {
  console.log("existing schedule", existingSchedule);
  const { addEvent, removeEvent } = useContext(PriceScheduleContext);
  const [sku, setSku] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [price, setPrice] = useState("");
  const [productPrice, setProductPrice] = useState("");

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [indefiniteEndDate, setIndefiniteEndDate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [weekly, setWeekly] = useState(existingSchedule.weekly || false);
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

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser.userName;

  console.log("data:" + existingSchedule.endDate);

  // const handleTimeSlotChange = (scheduleType, day, index, key, newTime) => {
  //   if (newTime instanceof Date && !isNaN(newTime)) {
  //     const formattedTime = formatDateToTimeString(newTime); // Format to 'HH:mm'
  //     if (scheduleType === "weekly") {
  //       setWeeklyTimeSlots((prevSlots) => {
  //         const updatedSlots = { ...prevSlots };
  //         updatedSlots[day][index][key] = formattedTime;
  //         return updatedSlots;
  //       });
  //     } else if (scheduleType === "monthly") {
  //       setMonthlyTimeSlots((prevSlots) => {
  //         const updatedSlots = { ...prevSlots };
  //         updatedSlots[day][index][key] = formattedTime;
  //         return updatedSlots;
  //       });
  //     }
  //   } else {
  //     console.error("Invalid date object for time:", newTime);
  //   }
  // };

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
  /*
  const formatTimeToHHMM = (date) => {
    const adjustedDate = new Date(date.getTime() + 4 * 60 * 60 * 1000);
    const hours = adjustedDate.getHours().toString().padStart(2, "0");
    const minutes = adjustedDate.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };
*/

  // const formatTimeToHHMM = (date) => {
  //   const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  //   let offsetHours = 0; // Default to no adjustment
  //   let adjustedDate = new Date(date.getTime());

  //   // Set offset hours and adjust the date based on the detected time zone
  //   if (timeZone.includes("America")) {
  //     offsetHours = 4; // Add 4 hours for EDT
  //     adjustedDate = new Date(date.getTime() + offsetHours * 60 * 60 * 1000);
  //   } else if (timeZone === "Asia/Dhaka") {
  //     offsetHours = 6; // Subtract 6 hours for Bangladesh (BST)
  //     adjustedDate = new Date(date.getTime() - offsetHours * 60 * 60 * 1000);
  //   }

  //   // Format the adjusted date to HH:mm format
  //   const hours = adjustedDate.getHours().toString().padStart(2, "0");
  //   const minutes = adjustedDate.getMinutes().toString().padStart(2, "0");
  //   return `${hours}:${minutes}`;
  // };
  const formatTimeToHHMM = (date) => {
    // Format the date object directly to HH:mm without time zone adjustments
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  // const convertTimeToUtc = (timeString) => {
  //   const date = convertTimeStringToDate(timeString); // Convert time string to Date object
  //   return moment(date).utc().format("HH:mm"); // Convert the Date object to UTC format (HH:mm)
  // };

  useEffect(() => {
    const encodedSku = encodeURIComponent(existingSchedule.sku); // Replace with your actual SKU value
    fetch(`${BASE_URL}/list/${encodedSku}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching: ${response.statusText}`);
        }
        return response.json(); // Parse the response as JSON
      })
      .then((data) => {
        console.log(data);
        setProductPrice(data?.offerAmount);
      })
      .catch((error) => {
        console.error("Error:", error.message); // Handle the error
      });
  }, []);

  // const fetchPriceBySku = async (sku) => {
  //   try {
  //     const encodedSku = encodeURIComponent(sku); // Encode the SKU to handle special characters
  //     const response = await axios.get(`${BASE_URL}/list/${encodedSku}`);
  //     return response.data;
  //   } catch (error) {
  //     console.error(
  //       "Error fetching:",
  //       error.response ? error.response.data : error.message
  //     );
  //     throw error;
  //   }
  // };

  // const convertTimeStringToDate = (timeString) => {
  //   if (typeof timeString === "string" && timeString.includes(":")) {
  //     const [hours, minutes] = timeString.split(":").map(Number);
  //     if (!isNaN(hours) && !isNaN(minutes)) {
  //       const now = new Date();
  //       now.setUTCHours(hours, minutes, 0, 0); // Interpret as UTC hours
  //       return now; // Local time will be automatically adjusted
  //     }
  //   }
  //   return new Date();
  // };
  const convertTimeToLocalFormat = (timeString) => {
    console.log("convert ");
    const date = convertTimeStringToDate(timeString);
    return moment(date).format("HH:mm");
  };

  const convertTimeStringToDate = (timeString) => {
    if (typeof timeString === "string" && timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const date = new Date(); // Create a new Date object with the current date
        date.setHours(hours, minutes, 0, 0); // Set the time without adjusting for time zones
        return date;
      }
    }
    return new Date(); // Return the current date and time if the input is invalid
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

  const fetchProductPriceBySku = async (SellerSKU) => {
    // setLoading(true);
    try {
      const priceData = await fetchPriceBySku(SellerSKU);

      setProductPrice(priceData?.offerAmount);
      setSku(priceData?.sku);
      console.log(`Price for SKU ${SellerSKU}:`, priceData.offerAmount);
    } catch (error) {
      console.error(
        `Error fetching price for SKU ${SellerSKU}:`,
        error.message
      );
      throw error;
    }
  };
  console.log("weekly slots: " + JSON.stringify(weeklyTimeSlots));

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

  // const handleTimeSlotChange = (scheduleType, identifier, index, key, value) => {
  //   console.log("Handle change:"+scheduleType+value)
  //   if (scheduleType === "weekly") {
  //     setWeeklyTimeSlots((prevSlots) => {
  //       const newSlots = { ...prevSlots };
  //       newSlots[identifier][index][key] = value;
  //       return newSlots;
  //     });
  //   } else if (scheduleType === "monthly") {
  //     setMonthlyTimeSlots((prevSlots) => {
  //       const newSlots = { ...prevSlots };
  //       newSlots[identifier][index][key] = value;
  //       return newSlots;
  //     });
  //   }
  // };

  // const handleAddTimeSlot = (scheduleType, identifier) => {
  //    const currentDate = new Date();
  //    const endDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // 1 hour after the current time
  //   if (scheduleType === "weekly") {
  //     setWeeklyTimeSlots((prevSlots) => ({
  //       ...prevSlots,
  //       [identifier]: [
  //         ...(prevSlots[identifier] || []),
  //         { startTime: new Date(), endTime: new Date(), newPrice: "" },
  //       ],
  //     }));
  //   } else if (scheduleType === "monthly") {
  //     setMonthlyTimeSlots((prevSlots) => ({
  //       ...prevSlots,
  //       [identifier]: [
  //         ...(prevSlots[identifier] || []),
  //         { startTime: new Date(), endTime: new Date(), newPrice: "" },
  //       ],
  //     }));
  //   }
  // };

  const handleAddTimeSlot = (scheduleType, identifier) => {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, "0"); // Get hours and pad with 0 if needed
    const minutes = currentDate.getMinutes().toString().padStart(2, "0"); // Get minutes and pad with 0 if needed

    const formattedTime = `${hours}:${minutes}`;
    const endDate = new Date(currentDate.getTime() + 60 * 60 * 1000); // Set endTime 1 hour after startTime

    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: [
          ...(prevSlots[identifier] || []),
          { startTime: currentDate, endTime: endDate, newPrice: "" },
        ],
      }));
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: [
          ...(prevSlots[identifier] || []),
          { startTime: currentDate, endTime: endDate, newPrice: "" },
        ],
      }));
    }
  };

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
  const validateTimeSlots = () => {
    const isTimeSlotOverlapping = (start1, end1, start2, end2) => {
      return start1 < end2 && start2 < end1;
    };
    const formatTime = (date) => {
      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");
      return `${hours}:${minutes}`;
    };

    for (const day in weeklyTimeSlots) {
      const slots = weeklyTimeSlots[day];
      for (let i = 0; i < slots.length; i++) {
        const slot1 = slots[i];

        // if (slot1.startTime >= slot1.endTime) {
        //   setErrorMessage(
        //     `For day ${day}, start time must be earlier than end time.`
        //   );
        //   return false;
        // }

        for (let j = i + 1; j < slots.length; j++) {
          const slot2 = slots[j];
          if (
            isTimeSlotOverlapping(
              slot1.startTime,
              slot1.endTime,
              slot2.startTime,
              slot2.endTime
            )
          ) {
            setErrorMessage(
              `Time slots for day ${day} overlap between ${formatTime(
                slot1.startTime
              )} - ${formatTime(slot1.endTime)} and ${formatTime(
                slot2.startTime
              )} - ${formatTime(slot2.endTime)}.`
            );
            return false;
          }
        }
      }
    }

    for (const date in monthlyTimeSlots) {
      const slots = monthlyTimeSlots[date];

      for (let i = 0; i < slots.length; i++) {
        const slot1 = slots[i];

        // if (slot1.startTime >= slot1.endTime) {
        //   setErrorMessage(
        //     `For date ${date}, start time must be earlier than end time.`
        //   );
        //   return false;
        // }

        for (let j = i + 1; j < slots.length; j++) {
          const slot2 = slots[j];
          if (
            isTimeSlotOverlapping(
              slot1.startTime,
              slot1.endTime,
              slot2.startTime,
              slot2.endTime
            )
          ) {
            setErrorMessage(
              `Time slots for date ${date} overlap between ${formatTime(
                slot1.startTime
              )} - ${formatTime(slot1.endTime)} and ${formatTime(
                slot2.startTime
              )} - ${formatTime(slot2.endTime)}.`
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
      // const convertTimeToUtc = (timeString) => {
      //   // const date = convertTimeStringToDate(timeString);
      //   return moment(date).utc().format("HH:mm");
      // };

      if (!indefiniteEndDate && endDate < startDate) {
        setErrorMessage("End Date cannot be earlier than Start Date.");
        // setLoading(false);
        return;
      }
      if (!validateTimeSlots()) {
        setErrorMessage("Set correct time.");
        return;
      }

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
              startTime: convertTimeToLocalFormat(startTime),
              endTime: convertTimeToLocalFormat(endTime),
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
              startTime: convertTimeToLocalFormat(startTime),
              endTime: convertTimeToLocalFormat(endTime),
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
        timeZone,
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

      setSuccessMessage(`Price update scheduled successfully for SKU: ${sku}`);
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

  console.log(existingSchedule);

  return (
    <>
      <Modal
        centered={true}
        show={show}
        onHide={onClose}
        dialogClassName="update-price-list-modal"
      >
        <Modal.Header closeButton>
          <div className="flex flex-col  w-full">
            <h2 className="text-xl font-normal text-center mb-3 border w-[30%] mx-auto py-1 rounded bg-[#F1F1F2] shadow-sm">
              Update {editScheduleModalTitle} Schedule & Price
            </h2>
            <div>
              <div className="flex gap-1">
                <img
                  className="w-[70px] h-[70px] object-fill"
                  src={existingSchedule?.imageURL}
                  alt="image"
                />
                <div>
                  <p className="text-base  font-normal">
                    {existingSchedule?.title}
                  </p>
                  <div>
                    <div
                      style={{
                        borderRadius: "3px",
                        height: "30px",
                        width: "90px",
                      }}
                      className=" bg-blue-500 text-white flex justify-center items-center mt-1  "
                    >
                      <h2 style={{ fontSize: "13px" }}>
                        {/* ${parseFloat(existingSchedule?.currentPrice).toFixed(2)} */}
                        ${parseFloat(productPrice).toFixed(2)}
                      </h2>
                    </div>

                    {/* stock */}
                    {/* <div className="  text-xs text-[#505050]">
                    <p className="flex justify-start items-center gap-2 text-xs">
                      {" "}
                      <PiWarehouse style={{ fontSize: "16px" }} />
                      {new Intl.NumberFormat().format(channelStockValue)}
                    </p>
                  </div> */}

                    {/* fba/fbm  */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* <ProductDetailsWithNumbers
                product={product}
                channelStockValue={channelStockValue}
                fulfillmentChannel={fulfillmentChannel}
                price={currentPrice}
                asin={asin}
                sku1={sku1}
                fnSku={fnSku}
                updatePriceModal={true}
              ></ProductDetailsWithNumbers> */}
        </Modal.Header>
        <Modal.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            {showPriceInput && (
              <Form.Group
                controlId="formNewPrice"
                style={{ marginBottom: "15px" }}
              >
                <Form.Label>New Price</Form.Label>
                <Form.Control
                  step="0.01"
                  type="number"
                  placeholder="Enter New Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </Form.Group>
            )}
            {scheduleType === "one-time" && (
              <>
                <section className="  max-w-[50%]  mx-auto px-2">
                  <div className="flex  gap-1">
                    <div className="flex justify-center items-center bg-[#DCDCDC] rounded-sm h-[37px] w-[35%]">
                      <h2 className="text-black">Start Price</h2>
                    </div>
                    <Form.Group
                      controlId="formStartDate"
                      style={{
                        marginBottom: "10px",
                        height: "37px",
                      }}
                    >
                      {/* <Form.Label>Start Date and Time</Form.Label> */}
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
                      controlId="formNewPrice"
                      style={{ height: "37px" }}
                    >
                      {/* <Form.Label>Start Price</Form.Label> */}
                      <Form.Control
                        type="number"
                        className="w-full"
                        placeholder="Start Price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </Form.Group>
                  </div>

                  <div className="flex  gap-1">
                    {!indefiniteEndDate && (
                      <div className="flex justify-center items-center bg-[#DCDCDC] rounded-sm h-[37px]  w-[35%]">
                        <h2 className="text-black">End Price</h2>
                      </div>
                    )}
                    {!indefiniteEndDate && (
                      <Form.Group
                        controlId="formEndDate"
                        style={{ marginBottom: "10px" }}
                      >
                        {/* <Form.Label>End Date and Time</Form.Label> */}
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
                    {!indefiniteEndDate && (
                      <Form.Group
                        controlId="formNewPrice"
                        // style={{ marginBottom: "15px" }}
                      >
                        <Form.Control
                          type="number"
                          placeholder="Enter End Price"
                          value={currentPrice}
                          onChange={(e) => setCurrentPrice(e.target.value)}
                        />
                      </Form.Group>
                    )}
                  </div>
                  <Form.Group
                    controlId="formIndefiniteEndDate"
                    // style={{ marginBottom: "15px" }}
                    className=" justify-start   bg-[#DCDCDC] inline-block w-[31%] p-2 rounded-sm"
                  >
                    <Form.Check
                      type="checkbox"
                      label="Until I change."
                      checked={indefiniteEndDate}
                      onChange={() => setIndefiniteEndDate(!indefiniteEndDate)}
                    />
                  </Form.Group>
                </section>
              </>
            )}
            {scheduleType === "weekly" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                {daysOptions.map((day) => (
                  <div className="border  p-3" key={day.value}>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="w-full py-1 bg-[#DCDCDC] text-black text-center text-base rounded-sm">
                        {day.label}
                      </h2>
                      <Button
                        size="sm"
                        className="bg-[#0662BB] text-white px-2 py-1"
                        onClick={() => handleAddTimeSlot("weekly", day.value)}
                      >
                        <FaPlus />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {(weeklyTimeSlots[day.value] || []).map((slot, index) => (
                        <Card
                          key={index}
                          className="p-2 border-0 bg-[#F1F1F2] shadow-md rounded-sm"
                        >
                          {/* Start Time and Price */}
                          <div className="flex justify-between items-center gap-2 my-1">
                            <h3 className=" text-center w-[40px]">Start</h3>
                            <DatePicker
                              selected={
                                slot.startTime
                                  ? convertTimeStringToDate(slot.startTime)
                                  : new Date()
                              }
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
                              className="form-control edit-modal-custom-input"
                            />
                            <Form.Control
                              type="number"
                              value={slot.newPrice}
                              placeholder="Start Price"
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
                              className="form-control edit-modal-custom-input"
                            />

                            <span className=" text-transparent px-2 py-1 rounded ">
                              <IoMdClose />
                            </span>
                          </div>

                          {/* End Time and Revert Price */}
                          <div className="flex justify-between items-center gap-2 my-1">
                            <h3 className=" text-center w-[70px]">End</h3>
                            <DatePicker
                              selected={
                                slot.endTime
                                  ? convertTimeStringToDate(slot.endTime)
                                  : new Date()
                              }
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
                              className="form-control edit-modal-custom-input"
                            />
                            <Form.Control
                              type="number"
                              value={slot.revertPrice}
                              placeholder="End Price"
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
                              className="form-control edit-modal-custom-input"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveTimeSlot("weekly", day.value, index)
                              }
                              className="bg-red-700 text-white px-2 py-1 rounded-sm hover:bg-red-600"
                            >
                              <IoMdClose />
                            </button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {scheduleType === "monthly" && (
              <>
                <div className="grid grid-cols-5 ">
                  {/* Render 31 boxes for each day */}
                  {datesOptions.map((date) => (
                    <div key={date.value} className="day-box">
                      <div className="flex justify-center items-center gap-1 mb-1">
                        <h2 className="w-[100%] py-1 rounded-sm bg-[#DCDCDC] px-2 text-center text-sm">
                          <span className="rounded-sm text-black">
                            {date.label}
                          </span>
                        </h2>
                        <Button
                          size="sm"
                          className="px-2 py-2 text-xs bg-[#0662BB] text-white"
                          onClick={() =>
                            handleAddTimeSlot("monthly", date.value)
                          }
                        >
                          <FaPlus />
                        </Button>
                      </div>

                      {(monthlyTimeSlots[date.value] || []).map(
                        (slot, index) => (
                          <Card
                            key={index}
                            className="my-2 px-1 py-1 border-0 bg-[#F1F1F2] rounded-sm"
                          >
                            <div className="flex justify-center items-center gap-1 my-1">
                              <h3 className="w-[40px] flex justify-center items-center text-[13px]">
                                Start
                              </h3>
                              <DatePicker
                                selected={
                                  slot.startTime
                                    ? convertTimeStringToDate(slot.startTime)
                                    : new Date()
                                }
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
                                className="form-control edit-modal-custom-input"
                              />
                              <Form.Control
                                type="number"
                                placeholder="Start Price"
                                value={slot.newPrice}
                                onChange={(e) =>
                                  handleTimeSlotPriceChange(
                                    "monthly",
                                    date.value,
                                    index,
                                    "newPrice",
                                    e.target.value
                                  )
                                }
                                className="form-control edit-modal-custom-input"
                              />
                              <span className="w-[50px]  border-0 flex items-center justify-center px-1 py-1  text-white"></span>
                            </div>

                            <div className="flex justify-center items-center gap-1">
                              <h3 className="flex justify-center items-center  text-[13px] w-[80px]">
                                End
                              </h3>
                              <DatePicker
                                selected={
                                  slot.endTime
                                    ? convertTimeStringToDate(slot.endTime)
                                    : new Date()
                                }
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
                                className="form-control edit-modal-custom-input"
                              />
                              <Form.Control
                                type="number"
                                value={slot.revertPrice}
                                placeholder="End Price"
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
                                className=" edit-modal-custom-input"
                              />
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() =>
                                  handleRemoveTimeSlot(
                                    "monthly",
                                    date.value,
                                    index
                                  )
                                }
                                className="w-[40px] bg-red-600 border-0 flex items-center justify-center hover:bg-red-500 px-1 py-1 rounded-sm text-white"
                              >
                                <IoMdClose />
                              </Button>
                            </div>
                          </Card>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="absolute bottom-5 right-4">
              <Button
                variant="danger"
                // style={{ width: "40%" }}
                className="px-5"
                onClick={handleShowConfirmation}
              >
                Delete Schedule
              </Button>
              <Button
                className="px-5"
                style={{
                  // width: "40%",
                  backgroundColor: "#0B5ED7",
                  marginLeft: "10px",
                }}
                type="submit"
              >
                Update Schedule
              </Button>
            </div>
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
