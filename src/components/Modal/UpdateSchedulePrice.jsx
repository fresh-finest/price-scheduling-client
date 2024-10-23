import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert, InputGroup } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";
import "./UpdateSchedulePrice.css";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";

import { IoMdClose } from "react-icons/io";
import { datesOptions, daysOptions } from "@/utils/staticValue";
import { FaPlus } from "react-icons/fa";

import moment from "moment-timezone";
import Loading from "../shared/ui/Loading";
import { MdOutlineClose } from "react-icons/md";
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

// const BASE_URL ='http://dynamic-price-schedule.us-east-1.elasticbeanstalk.com';
// const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com'
// const BASE_URL = `https://api.priceobo.com`;

const BASE_URL = "http://localhost:3000";

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
const fetchExistingSchedules = async (sku) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/schedule`);
    return response.data.result.filter((schedule) => schedule.sku === sku);
  } catch (error) {
    console.error(
      "Error fetching existing schedules:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const updateProductPrice = async (sku, value) => {
  try {
    console.log(
      `Attempting to update price for SKU: ${sku} to value: ${value}`
    );
    const response = await axios.patch(`${BASE_URL}/product/${sku}/price`, {
      value: parseFloat(value),
    });
    console.log("Update response:", response.data);

    if (response.data.issues && response.data.issues.length > 0) {
      console.warn("Price update issues:", response.data.issues);
    }

    return response.data;
  } catch (error) {
    console.error(
      "Error updating product price:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const saveScheduleAndQueueJobs = async (
  userName,
  asin,
  sku,
  title,
  price,
  currentPrice,
  imageURL,
  startDate,
  endDate,
  weekly = false,
  // daysOfWeek = [],
  weeklyTimeSlots = {},
  monthly = false,
  // datesOfMonth = [],
  monthlyTimeSlots = {},
  timeZone
) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/schedule/change`, {
      userName,
      asin,
      sku,
      title,
      price: parseFloat(price),
      currentPrice: parseFloat(currentPrice),
      imageURL,
      startDate,
      endDate,
      weekly,
      // daysOfWeek,
      weeklyTimeSlots,
      monthly,
      // datesOfMonth,
      monthlyTimeSlots,
      timeZone,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error saving schedule and queuing jobs:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const saveSchedule = async (
  userName,
  asin,
  sku,
  title,
  price,
  currentPrice,
  imageURL,
  startDate,
  endDate,
  weeklyTimeSlots = {},
  monthlyTimeSlots = {}
) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/schedule`, {
      userName,
      asin,
      sku,
      title,
      price: parseFloat(price),
      currentPrice,
      imageURL,
      startDate,
      endDate,
      weeklyTimeSlots,
      monthlyTimeSlots,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error saving schedule:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const UpdatePrice = ({ show, onClose, selectedDate }) => {
  console.log("selected date", selectedDate);
  const { addEvent } = useContext(PriceScheduleContext);
  const [asin, setAsin] = useState("");
  const [sku, setSku] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [indefiniteEndDate, setIndefiniteEndDate] = useState(false); // New state for indefinite end date
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [weeklyTimeSlots, setWeeklyTimeSlots] = useState({});
  const [monthlyTimeSlots, setMonthlyTimeSlots] = useState({});
  const [weekly, setWeekly] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [weeklyExists, setWeeklyExists] = useState(false);
  const [monthlyExists, setMonthlyExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("single");
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const [productName, setProductName] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const [schedules, setSchedules] = useState([
    {
      price: "",
      currentPrice: "",
      startDate: new Date(),
      endDate: new Date(),
      indefiniteEndDate: false,
    },
  ]);

  console.log("schedules", schedules);

  // const userName = JSON.stringify(currentUser.userName);
  const userName = currentUser.userName;

  const fetchProductBySku = async (sku) => {
    setImageUrl("");
    setTitle("");
    setLoading(true);
    try {
      const encodedSku = encodeURIComponent(sku);
      const response = await axios.get(`${BASE_URL}/image/${encodedSku}`);
      const image = response?.data?.summaries[0].mainImage?.link;
      const productName = response?.data?.summaries[0].itemName;
      const asin = response?.data?.summaries[0].asin;
      setImageUrl(image);
      setTitle(productName);
      setAsin(asin);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(
        "Error fetching product:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  console.log("image", imageURL);

  useEffect(() => {
    if (show) {
      resetForm();
      // setStartDate(selectedDate);
      // setEndDate(selectedDate);
    }
  }, [show, selectedDate]);

  useEffect(() => {
    fetchSchedules(sku);
    fetchProductBySku(sku);

    setLoading(true);
  }, [sku]);

  useEffect(() => {
    if (activeTab === "weekly") {
      setWeekly(true);
      setMonthly(false);
    } else if (activeTab === "monthly") {
      setMonthly(true);
      setWeekly(false);
    } else {
      setMonthly(false);
      setWeekly(false);
    }
  }, [activeTab]);

  const resetForm = () => {
    setAsin("");
    setSku("");
    setCurrentPrice("");
    setPrice("");

    setIndefiniteEndDate(false); // Reset the checkbox
    setSuccessMessage("");
    setErrorMessage("");
  };

  // const handleAsinChange = async (e) => {
  //   const asinValue = e.target.value;
  //   setAsin(asinValue);
  //   if (asinValue) {
  //     try {
  //       const data = await fetchProductDetails(asinValue);
  //       const productDetails = data.payload[0].Product.Offers[0];
  //       setSku(productDetails.SellerSKU);
  //       setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);

  //       const additionalData = await fetchProductAdditionalDetails(asinValue);
  //       setTitle(additionalData.payload.AttributeSets[0].Title);
  //       setImageUrl(additionalData.payload.AttributeSets[0].SmallImage.URL);
  //     } catch (error) {
  //       setErrorMessage(
  //         "Error fetching product details: " +
  //           (error.response ? error.response.data.error : error.message)
  //       );
  //       console.error("Error fetching product details:", error);
  //     }
  //   }
  // };

  const handleClearInput = () => {
    setSku("");
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

    for (let i = 0; i < schedules.length; i++) {
      const schedule1 = schedules[i];
      const start1 = new Date(schedule1.startDate);
      const end1 = new Date(schedule1.endDate || start1);

      for (let j = i + 1; j < schedules.length; j++) {
        const schedule2 = schedules[j];
        const start2 = new Date(schedule2.startDate);
        const end2 = new Date(schedule2.endDate || start2);

        if (isTimeSlotOverlapping(start1, end1, start2, end2)) {
          setErrorMessage("Schedules overlap.");

          // Hide the error message after 3 seconds
          setTimeout(() => {
            setErrorMessage(""); // Clear the error message
          }, 2000);
          return false;
        }
      }
    }
    // Check if the "Until Changed" option is valid
    for (let i = 0; i < schedules.length - 1; i++) {
      const prevSchedule = schedules[i];
      const currentSchedule = schedules[schedules.length - 1];

      const prevEndDate = new Date(
        prevSchedule.endDate || prevSchedule.startDate
      );
      const currentStartDate = new Date(currentSchedule.startDate);

      if (
        currentSchedule.indefiniteEndDate &&
        currentStartDate <= prevEndDate
      ) {
        setErrorMessage(
          `"Until Changed" option can only be selected if the start date is greater than the end date of all previous schedules.`
        );
        return false;
      }
    }

    const now = new Date();
    const today = now.getDay(); // Get today's day index
    const currentDayOfMonth = now.getDate(); // Get today's date in the month
    const tenHoursAgo = new Date(now.getTime() - 10 * 60 * 60 * 1000); // Calculate the time 10 hours ago from now
    for (const day in weeklyTimeSlots) {
      const slots = weeklyTimeSlots[day];

      if (timeZone === "America/New_York") {
        console.log("timeZone " + timeZone);
        if (parseInt(day) === today) {
          // If the selected day is today, check the time
          for (let slot of slots) {
            if (slot.startTime < now) {
              setErrorMessage(
                "The selected start time is in the past for today's time slot. Please select a future time."
              );
              return false;
            }
          }
        }
      } else if (timeZone === "Asia/Dhaka") {
        console.log("timeZone from asia " + timeZone);
        if (parseInt(day) === today) {
          // If the selected day is today, check the time
          for (let slot of slots) {
            let slotStart;

            // Check if slot.startTime is a Date object or a string
            if (slot.startTime instanceof Date) {
              slotStart = slot.startTime;
            } else if (typeof slot.startTime === "string") {
              // If startTime is a string in "HH:mm" format, convert it to a Date object
              const [hours, minutes] = slot.startTime.split(":").map(Number);
              slotStart = new Date(now);
              slotStart.setHours(hours, minutes, 0, 0);
            } else {
              console.error("Invalid startTime format:", slot.startTime);
              continue;
            }
            if (slotStart < tenHoursAgo) {
              setErrorMessage(
                "The selected start time is in the past for today's time slot. Please select a future time."
              );
              return false;
            }
          }
        }
      }

    
      for (let i = 0; i < slots.length; i++) {
        const slot1 = slots[i];

        if (slot1.startTime >= slot1.endTime) {
          setErrorMessage(
            `For day ${day}, start time must be earlier than end time.`
          );
          return false;
        }

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
    

      if (timeZone === "America/New_York") {
        console.log("timeZone " + timeZone);
        if (parseInt(date) === currentDayOfMonth) {
          // If the selected day is today, check the time
          for (let slot of slots) {
            if (slot.startTime < now) {
              setErrorMessage(
                "The selected start time is in the past for today's time slot. Please select a future time."
              );
              return false;
            }
          }
        }
      } else if (timeZone === "Asia/Dhaka") {
        console.log("timeZone from asia " + timeZone);
        if (parseInt(date) === currentDayOfMonth) {
          // If the selected day is today, check the time
          for (let slot of slots) {
            let slotStart;

            // Check if slot.startTime is a Date object or a string
            if (slot.startTime instanceof Date) {
              slotStart = slot.startTime;
            } else if (typeof slot.startTime === "string") {
              // If startTime is a string in "HH:mm" format, convert it to a Date object
              const [hours, minutes] = slot.startTime.split(":").map(Number);
              slotStart = new Date(now);
              slotStart.setHours(hours, minutes, 0, 0);
            } else {
              console.error("Invalid startTime format:", slot.startTime);
              continue;
            }
            if (slotStart < tenHoursAgo) {
              setErrorMessage(
                "The selected start time is in the past for today's time slot. Please select a future time."
              );
              return false;
            }
          }
        }
      }

      for (let i = 0; i < slots.length; i++) {
        const slot1 = slots[i];

        if (slot1.startTime >= slot1.endTime) {
          setErrorMessage(
            `For date ${date}, start time must be earlier than end time.`
          );
          return false;
        }

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
  const convertTimeToLocalFormat = (time) => {
    return moment(time).format("HH:mm");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userName || !asin || !sku) {
        setErrorMessage("All fields are required to update the price.");
        setLoading(false);
        return;
      }

      if (!validateTimeSlots()) {
        setLoading(false);
        return;
      }

      if (!indefiniteEndDate && endDate < startDate) {
        setErrorMessage("End Date cannot be earlier than Start Date.");
        setLoading(false);
        return;
      }

      // Check for overlapping schedules
      const overlappingSchedule = existingSchedules.find((schedule) => {
        if (schedule.status === "deleted") return false;

        const existingStart = new Date(schedule.startDate);
        const existingEnd = new Date(schedule.endDate || startDate);
        return (
          (startDate >= existingStart && startDate <= existingEnd) ||
          (endDate && endDate >= existingStart && endDate <= existingEnd) ||
          (startDate <= existingStart &&
            (endDate ? endDate >= existingEnd : true))
        );
      });

      const hasMonthlyTimeSlots = Object.values(monthlyTimeSlots).some(
        (timeSlots) => timeSlots.length > 0
      );

      const hasWeeklyTimeSlots = Object.values(weeklyTimeSlots).some(
        (timeSlots) => timeSlots.length > 0
      );

      const weeklySlotsInUtc = {};
      const monthlySlotsInUtc = {};

      if (weekly) {
        if (!userName || !asin || !sku || !hasWeeklyTimeSlots) {
          setErrorMessage("Not provided weekly values.");
          setLoading(false);
          return;
        }

        // for (const [day, timeSlots] of Object.entries(weeklyTimeSlots)) {
        //   weeklySlotsInUtc[day] = timeSlots.map(
        //     ({ startTime, endTime, newPrice, revertPrice }) => ({
        //       startTime: convertTimeToUtc(startTime),
        //       endTime: convertTimeToUtc(endTime),
        //       newPrice: parseFloat(newPrice),
        //       revertPrice: parseFloat(revertPrice),
        //     })
        //   );
        // }
        for (const [day, timeSlots] of Object.entries(weeklyTimeSlots)) {
          weeklySlotsInUtc[day] = timeSlots.map(
            ({ startTime, endTime, newPrice, revertPrice }) => ({
              startTime: convertTimeToLocalFormat(startTime),
              endTime: convertTimeToLocalFormat(endTime),
              newPrice: parseFloat(newPrice),
              revertPrice: parseFloat(revertPrice),
            })
          );
        }
        await saveScheduleAndQueueJobs(
          userName,
          asin,
          sku,
          title,
          price,
          currentPrice,
          imageURL,
          startDate,
          indefiniteEndDate ? null : endDate,
          weekly,
          // daysOfWeek.map((day) => day.value),
          weeklySlotsInUtc,
          monthly,
          // datesOfMonth.map((date) => date.value),
          monthlySlotsInUtc,
          timeZone
        );
      }

      if (monthly) {
        if (!userName || !asin || !sku || !hasMonthlyTimeSlots) {
          setErrorMessage("Not provided monthly values");
          setLoading(false);
          return;
        }

        // for (const [date, timeSlots] of Object.entries(monthlyTimeSlots)) {
        //   monthlySlotsInUtc[date] = timeSlots.map(
        //     ({ startTime, endTime, newPrice, revertPrice }) => ({
        //       startTime: convertTimeToUtc(startTime),
        //       endTime: convertTimeToUtc(endTime),
        //       newPrice: parseFloat(newPrice),
        //       revertPrice: parseFloat(revertPrice),
        //     })
        //   );
        // }

        for (const [date, timeSlots] of Object.entries(monthlyTimeSlots)) {
          monthlySlotsInUtc[date] = timeSlots.map(
            ({ startTime, endTime, newPrice, revertPrice }) => ({
              startTime: convertTimeToLocalFormat(startTime),
              endTime: convertTimeToLocalFormat(endTime),
              newPrice: parseFloat(newPrice),
              revertPrice: parseFloat(revertPrice),
            })
          );
        }
        await saveScheduleAndQueueJobs(
          userName,
          asin,
          sku,
          title,
          price,
          currentPrice,
          imageURL,
          startDate,
          indefiniteEndDate ? null : endDate,
          weekly,
          // daysOfWeek.map((day) => day.value),
          weeklySlotsInUtc,
          monthly,
          // datesOfMonth.map((date) => date.value),
          monthlySlotsInUtc,
          timeZone
        );
      }

      if (!weekly && !monthly)
        for (const schedule of schedules) {
          const { price, currentPrice, startDate, endDate, indefiniteEndDate } =
            schedule;
          if (!indefiniteEndDate && endDate < startDate) {
            setErrorMessage("End Date cannot be earlier than Start Date.");
            setLoading(false);
            return;
          }
          await saveScheduleAndQueueJobs(
            userName,
            asin,
            sku,
            title,
            price,
            currentPrice,
            imageURL,
            startDate,
            indefiniteEndDate ? null : endDate,
            weekly,
            // daysOfWeek.map((day) => day.value),
            weeklySlotsInUtc,
            monthly,
            // datesOfMonth.map((date) => date.value),
            monthlySlotsInUtc,
            timeZone
          );
          // Log event or update UI after successful submission
        }
      addEvent({
        title: `SKU: ${sku} - $${price}`,
        start: new Date(startDate), // Use the original date object for UI purposes
        end: indefiniteEndDate ? null : new Date(endDate), // Handle indefinite end date in UI
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
    } finally {
      setLoading(false);
    }
  };

  const schedulePriceUpdate = async (
    sku,
    originalPrice,
    newPrice,
    startDate,
    endDate
  ) => {
    const now = new Date();
    const delayStart = startDate - now;

    // Schedule the price update at the start date
    if (delayStart > 0) {
      setTimeout(async () => {
        try {
          console.log("Price is getting updated.");
          await updateProductPrice(sku, newPrice);
          console.log(
            `Price updated to ${newPrice} for SKU ${sku} at ${new Date().toLocaleString()}`
          );
        } catch (error) {
          console.error("Error updating to new price:", error);
        }
      }, delayStart);
    } else {
      try {
        await updateProductPrice(sku, newPrice);
        console.log(`Price updated to ${newPrice} immediately for SKU ${sku}`);
      } catch (error) {
        console.error("Error updating to new price:", error);
      }
    }

    // Schedule the price revert at the end date if endDate is provided
    if (endDate) {
      const delayEnd = endDate - now;
      if (delayEnd > 0) {
        setTimeout(async () => {
          try {
            console.log("Price is getting reverted...");
            await updateProductPrice(sku, originalPrice);
            console.log(
              `Price reverted to ${originalPrice} for SKU ${sku} at ${new Date().toLocaleString()}`
            );
          } catch (error) {
            console.error("Error reverting to original price:", error);
          }
        }, delayEnd);
      }
    }
  };

  const addNewSchedule = () => {
    setSchedules([
      ...schedules,
      {
        price: "",
        currentPrice: "",
        startDate: new Date(),
        endDate: new Date(),
        indefiniteEndDate: false,
      },
    ]);
  };

  const removeSchedule = (index) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };
  const handleScheduleChange = (index, key, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[index][key] = value;
    setSchedules(updatedSchedules);
  };
  const disableAddNewButton = schedules.some(
    (schedule) => schedule.indefiniteEndDate
  );

  const addWeeklyTimeSlot = (day) => {
    setWeeklyTimeSlots((prevSlots) => ({
      ...prevSlots,
      [day]: [
        ...(prevSlots[day] || []),
        {
          startTime: new Date(),
          endTime: new Date(),
          newPrice: "",
          revertPrice: "",
        },
      ],
    }));
  };

  const addMonthlyTimeSlot = (date) => {
    setMonthlyTimeSlots((prevSlots) => ({
      ...prevSlots,
      [date]: [
        ...(prevSlots[date] || []),
        {
          startTime: new Date(),
          endTime: new Date(),
          newPrice: "",
          revertPrice: "",
        },
      ],
    }));
  };

  const removeTimeSlot = (scheduleType, identifier, index) => {
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
  const handleTimeChange = (scheduleType, identifier, index, key, value) => {
    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => {
        const newSlots = [...(prevSlots[identifier] || [])];
        newSlots[index][key] = value;
        return { ...prevSlots, [identifier]: newSlots };
      });
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => {
        const newSlots = [...(prevSlots[identifier] || [])];
        newSlots[index][key] = value;
        return { ...prevSlots, [identifier]: newSlots };
      });
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
        const newSlots = [...(prevSlots[identifier] || [])];
        newSlots[index][key] = value;

        return { ...prevSlots, [identifier]: newSlots };
      });
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => {
        const newSlots = [...(prevSlots[identifier] || [])];
        newSlots[index][key] = value;
        return { ...prevSlots, [identifier]: newSlots };
      });
    }
  };

  const fetchSchedules = async (sku) => {
    try {
      setLoading(true);
      const schedules = await fetchExistingSchedules(sku);

      setExistingSchedules(schedules);

      const hasWeekly = schedules.some(
        (schedule) => schedule.weekly && schedule.status != "deleted"
      );

      const hasMonthly = schedules.some(
        (schedule) => schedule.monthly && schedule.status != "deleted"
      );

      setWeeklyExists(hasWeekly);
      setMonthlyExists(hasMonthly);
    } catch (error) {
      setErrorMessage("Error fetching existing schedules.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="update-schedule-price-list-calender-modal"
      >
        <Modal.Header className="flex flex-col " closeButton>
          <div className="flex items-center justify-center ">
            <Modal.Title>
              {/* Update Scheduled Price{" "} */}
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}{" "}
            </Modal.Title>
          </div>

          <div className="flex  justify-center items-center gap-2">
            <img
              className="max-w-[70px] max-h-[70px]  object-fit"
              src={imageURL}
              alt=""
            />
            <h3>{title}</h3>
          </div>
        </Modal.Header>
        <Modal.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}

          <Form onSubmit={handleSubmit}>
            <div className="grid grid-cols-3  mx-auto gap-1  mb-2">
              <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm ">
                <h2 className=" text-black">SKU</h2>
              </div>

              <Form.Group
                controlId="formAsin"
                // style={modalStyles.formControl}
                className="flex flex-col col-span-2 relative"
              >
                {/* <Form.Label>ASIN</Form.Label> */}
                <Form.Control
                  type="text"
                  // className="custom-input"
                  placeholder="Enter SKU"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />

                {sku && (
                  <button
                    onClick={handleClearInput}
                    className="absolute right-2 top-1  p-1 z-10 text-xl rounded transition duration-500 text-gray-500"
                  >
                    <MdOutlineClose />
                  </button>
                )}
              </Form.Group>
            </div>
            {loading ? (
              <div className="mt-5">
                <Loading></Loading>
              </div>
            ) : (
              <div>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  {/* <Tabs defaultValue="account" className="w-[400px]"> */}
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single">Single</TabsTrigger>
                    <TabsTrigger disabled={weeklyExists} value="weekly">
                      Weekly
                    </TabsTrigger>
                    <TabsTrigger disabled={monthlyExists} value="monthly">
                      Monthly
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="single" className="py-2">
                    <div className="max-w-[55%] mx-auto mt-2  relative">
                      {schedules.map((schedule, index) => (
                        <div
                          key={index}
                          className=" mb-3 mx-auto bg-[#F1F1F2] px-4 pt-3 pb-2 rounded-sm relative shadow-sm"
                        >
                          <div className="grid grid-cols-3 gap-1 mt-3 ">
                            <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm ">
                              <h2 className=" text-black">Start </h2>
                            </div>

                            <Form.Group
                              className="flex flex-col"
                              controlId="formStartDate"
                            >
                              {/* <Form.Label>Start Date and Time</Form.Label> */}
                              <DatePicker
                                selected={schedule.startDate}
                                onChange={(date) =>
                                  handleScheduleChange(index, "startDate", date)
                                }
                                showTimeSelect
                                dateFormat="Pp"
                                className="form-control"
                                required
                              />
                            </Form.Group>

                            <Form.Group
                              controlId="formPrice"
                              className="flex flex-col"
                              // style={modalStyles.formControl}
                            >
                              {/* <Form.Label>New Price</Form.Label> */}
                              <Form.Control
                                type="number"
                                placeholder="Start Price"
                                value={schedule.price}
                                step="0.01"
                                onChange={(e) =>
                                  handleScheduleChange(
                                    index,
                                    "price",
                                    e.target.value
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </div>
                          {!schedule.indefiniteEndDate && (
                            <div className="grid grid-cols-3 gap-1 mt-3 ">
                              <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm ">
                                <h2 className=" text-black">End</h2>
                              </div>

                              {!schedule.indefiniteEndDate && (
                                <Form.Group
                                  controlId="formEndDate"
                                  className="flex flex-col"
                                >
                                  {/* <Form.Label>End Date and Time</Form.Label> */}
                                  <DatePicker
                                    selected={schedule.endDate}
                                    onChange={(date) =>
                                      handleScheduleChange(
                                        index,
                                        "endDate",
                                        date
                                      )
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                    required={!schedule.indefiniteEndDate}
                                  />
                                </Form.Group>
                              )}

                              <Form.Group
                                controlId="formPrice"
                                className="flex flex-col"
                              >
                                {/* <Form.Label>New Price</Form.Label> */}
                                <Form.Control
                                  type="number"
                                  placeholder="End Price"
                                  step="0.01"
                                  value={schedule.currentPrice}
                                  onChange={(e) =>
                                    handleScheduleChange(
                                      index,
                                      "currentPrice",
                                      e.target.value
                                    )
                                  }
                                  required
                                />
                              </Form.Group>
                            </div>
                          )}

                          {index === schedules.length - 1 && (
                            <Form.Group
                              controlId={`formIndefiniteEndDate-${index}`}
                              className="mt-2  bg-[#DCDCDC] inline-block w-[33%] p-2 rounded"
                            >
                              <Form.Check
                                type="checkbox"
                                label="Until change back"
                                checked={schedule.indefiniteEndDate}
                                onChange={() =>
                                  handleScheduleChange(
                                    index,
                                    "indefiniteEndDate",
                                    !schedule.indefiniteEndDate
                                  )
                                }
                              />
                            </Form.Group>
                          )}

                          {/* <Form.Group
                         controlId={`formIndefiniteEndDate-${index}`}
                       
                        className="mt-2  bg-[#DCDCDC] inline-block w-[33%] p-2 rounded"
                      >
                        <Form.Check
                          type="checkbox"
                          label="Until change back"
                          checked={indefiniteEndDate}
                          onChange={() =>
                            setIndefiniteEndDate(!indefiniteEndDate)
                          }
                        />
                      </Form.Group> */}

                          {index > -1 && (
                            <button
                              type="button"
                              onClick={() => removeSchedule(index)}
                              className="mt-2 absolute top-[-5px] right-1 shadow-sm "
                            >
                              <IoMdClose className=" text-center text-xl" />
                            </button>
                          )}
                        </div>
                      ))}

                      {!disableAddNewButton && (
                        <button
                          type="button"
                          onClick={addNewSchedule}
                          className="mt-1 ml-[4%] w-[30%] py-2 px-2 rounded-sm bg-[#DCDCDC] text-black"
                        >
                          Add Time Slot
                        </button>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="weekly">
                    {/* Weekly schedule handling */}
                    <Form.Group controlId="formWeekly" className="mt-3">
                      {/* <Form.Label>Repeat Weekly on:</Form.Label> */}
                      {/* Iterate through 7 days of the week */}
                      <div className="weekly-schedule">
                        {daysOptions.map((day) => (
                          <div key={day.value} className="day-box ">
                            <div className="flex items-center gap-1 mb-1">
                              <h2 className=" w-full py-1 rounded-sm bg-[#DCDCDC] px-2 text-center text-sm">
                                <span className="  rounded-sm text-black">
                                  {day.label}
                                </span>
                              </h2>
                              <Button
                                type="button"
                                size="sm"
                                className="px-2 py-2 text-xs bg-[#0662BB] text-white"
                                onClick={() => addWeeklyTimeSlot(day.value)}
                              >
                                <FaPlus />
                              </Button>
                            </div>

                            {/* Render the time slots for each day */}
                            {weeklyTimeSlots[day.value]?.map((slot, index) => (
                              <Card
                                key={index}
                                className="  p-2 border-0 bg-[#F1F1F2] shadow-md my-2 rounded-sm relative"
                              >
                                {/* start time and start price */}
                                {/* <div className="grid grid-cols-4 gap-1  my-1"> */}
                                <div className="flex justify-center items-center gap-1  mt-3">
                                  <h3 className="flex justify-center items-center w-[90px] text-sm ">
                                    Start
                                  </h3>
                                  <DatePicker
                                    selected={slot.startTime}
                                    onChange={(time) =>
                                      handleTimeChange(
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
                                    className="form-control modal-custom-input "
                                  />
                                  <Form.Control
                                    type="number"
                                    placeholder="Enter New Price "
                                    required
                                    step="0.01"
                                    value={slot.newPrice}
                                    onChange={(e) =>
                                      handleTimeSlotPriceChange(
                                        "weekly",
                                        day.value,
                                        index,
                                        "newPrice",
                                        e.target.value
                                      )
                                    }
                                    className="form-control modal-custom-input "
                                  />
                                </div>

                                <div className=" flex justify-center items-center gap-1">
                                  <h3 className="flex justify-center items-center w-[90px] text-sm">
                                    End
                                  </h3>
                                  <DatePicker
                                    selected={slot.endTime}
                                    onChange={(time) =>
                                      handleTimeChange(
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
                                    className="form-control modal-custom-input"
                                  />

                                  <Form.Control
                                    type="number"
                                    placeholder="Enter Revert Price"
                                    required
                                    step="0.01"
                                    value={slot.revertPrice} // Add input for revertPrice
                                    onChange={(e) =>
                                      handleTimeSlotPriceChange(
                                        "weekly",
                                        day.value,
                                        index,
                                        "revertPrice",
                                        e.target.value
                                      )
                                    }
                                    className="form-control modal-custom-input "
                                  />
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeTimeSlot("weekly", day.value, index)
                                    }
                                    className=" border-0 flex items-center justify-center px-1 py-1 rounded-sm text-black shadow-sm absolute top-0 right-0"
                                  >
                                    <IoMdClose className=" text-center text-base" />
                                  </button>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ))}
                      </div>
                    </Form.Group>
                  </TabsContent>
                  <TabsContent value="monthly">
                    {
                      <>
                        <Form.Group controlId="formDatesOfMonth">
                          <div className="grid grid-cols-4   my-3">
                            {/* Render 31 boxes for each day */}
                            {datesOptions.map((date) => (
                              <div key={date.value} className="day-box">
                                <div className="flex justify-center items-center gap-1 mb-1">
                                  <h2 className=" w-full py-1 rounded-sm bg-[#DCDCDC] px-2 text-center text-sm ">
                                    {/* <h2 className=" w-full py-1 rounded-sm bg-[#F1F1F2] px-2 text-center text-sm "> */}
                                    {/* <h2 className=" w-full py-1 rounded-sm bg-[#888888] px-2 text-center text-sm "> */}
                                    {/* <span className="  rounded-sm text-white"> */}
                                    <span className="  rounded-sm text-black">
                                      {date.label}
                                    </span>
                                  </h2>
                                  <Button
                                    type="button"
                                    size="sm"
                                    className="px-2 py-2 text-xs bg-[#0662BB] text-white"
                                    onClick={() =>
                                      addMonthlyTimeSlot(date.value)
                                    }
                                  >
                                    <FaPlus />
                                  </Button>
                                </div>

                                {monthlyTimeSlots[date.value]?.map(
                                  (slot, index) => (
                                    <Card
                                      key={index}
                                      className="  px-1 py-1  border-0 bg-[#F1F1F2] shadow-md my-2 rounded-sm relative"
                                    >
                                      {/* start time and start price */}
                                      {/* <div className="grid grid-cols-4 gap-1  my-1"> */}
                                      <div className="flex justify-center items-center gap-1  mt-4 mb-1">
                                        <h3 className="flex justify-center items-center w-[90px] text-[12px] ">
                                          Start
                                        </h3>
                                        <DatePicker
                                          selected={slot.startTime}
                                          onChange={(time) =>
                                            handleTimeChange(
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
                                          className="form-control modal-custom-input "
                                        />
                                        <Form.Control
                                          type="number"
                                          placeholder="Start Price"
                                          required
                                          step="0.01"
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
                                          className="form-control modal-custom-input"
                                        />
                                        {/* <Button className="w-[40px] border-0  bg-transparent ml-1  ">
                                        <span className=""></span>
                                      </Button> */}
                                      </div>

                                      <div className=" flex justify-center items-center gap-1">
                                        <h3 className="flex justify-center items-center w-[90px] text-[12px]">
                                          End
                                        </h3>
                                        <DatePicker
                                          selected={slot.endTime}
                                          onChange={(time) =>
                                            handleTimeChange(
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
                                          className="form-control modal-custom-input"
                                        />

                                        <Form.Control
                                          type="number"
                                          placeholder="End Price"
                                          required
                                          step="0.01"
                                          value={slot.revertPrice} // Add input for revertPrice
                                          onChange={(e) =>
                                            handleTimeSlotPriceChange(
                                              "monthly",
                                              date.value,
                                              index,
                                              "revertPrice",
                                              e.target.value
                                            )
                                          }
                                          className="form-control modal-custom-input "
                                        />

                                        <button
                                          type="button"
                                          onClick={() =>
                                            removeTimeSlot(
                                              "monthly",
                                              date.value,
                                              index
                                            )
                                          }
                                          className="  border-0 flex items-center justify-center px-1 py-1 rounded-sm text-black shadow-sm absolute top-0 right-0"
                                        >
                                          <IoMdClose className=" text-center text-base" />
                                        </button>
                                      </div>
                                    </Card>
                                  )
                                )}
                              </div>
                            ))}
                          </div>
                        </Form.Group>
                      </>
                    }
                  </TabsContent>
                </Tabs>
                <Button
                  style={{
                    width: "20%",
                    backgroundColor: "#0662BB",

                    margin: "0 auto",
                    display: "block",
                    position: "absolute",
                    bottom: 22,
                    right: 30,
                  }}
                  type="submit"
                >
                  {/* Schedule Price Update */}
                  {weekly
                    ? "Weekly Update"
                    : monthly
                    ? "Monthly Update Price"
                    : "Update Price"}
                </Button>
              </div>
            )}
          </Form>

          {/* <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formAsin" style={modalStyles.formControl}>
              <Form.Label>ASIN</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter ASIN"
                value={asin}
                onChange={handleAsinChange}
                required
              />
            </Form.Group>
            <Form.Group
              controlId="formCurrentPrice"
              style={modalStyles.formControl}
            >
              <Form.Label>Current Price: ${currentPrice}</Form.Label>
            </Form.Group>
            <Form.Group controlId="formPrice" style={modalStyles.formControl}>
              <Form.Label>New Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter New Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group
              controlId="formStartDate"
              style={modalStyles.formControl}
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
              style={modalStyles.formControl}
            >
              <Form.Check
                type="checkbox"
                label="Untill I change it."
                checked={indefiniteEndDate}
                onChange={() => setIndefiniteEndDate(!indefiniteEndDate)}
              />
            </Form.Group>
            {!indefiniteEndDate && (
              <Form.Group
                controlId="formEndDate"
                style={modalStyles.formControl}
              >
                <Form.Label>End Date and Time</Form.Label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="form-control"
                  required={!indefiniteEndDate} // Only required if not indefinite
                />
              </Form.Group>
            )}
            <Button variant="primary" type="submit" style={modalStyles.button}>
              Schedule Price Update
            </Button>
          </Form> */}
        </Modal.Body>
      </Modal>
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Successfully updated price!</Modal.Title>
        </Modal.Header>
      </Modal>
    </>
  );
};

export default UpdatePrice;
