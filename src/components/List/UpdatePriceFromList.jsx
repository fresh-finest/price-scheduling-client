import { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { MultiSelect } from "react-multi-select-component";
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from "moment-timezone";
import priceoboIcon from "../../assets/images/pricebo-icon.png";

import { daysOptions, datesOptions } from "../../utils/staticValue";

import "./UpdatePriceFromList.css";
import ProductDetailsWithNumbers from "../shared/ProductDetailsWithNumbers";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { FaPlus } from "react-icons/fa";
import { Card } from "../ui/card";
import { IoMdClose } from "react-icons/io";


const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const BASE_URL = "https://api.priceobo.com";
// const BASE_URL ='http://localhost:3000'
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
      timeZone
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

const UpdatePriceFromList = ({
  show,
  onClose,
  asin,
  sku1,
  product,
  fnSku,
  channelStockValue,
  fulfillmentChannel,
}) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [sku, setSku] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [indefiniteEndDate, setIndefiniteEndDate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingSchedules, setExistingSchedules] = useState([]);
  const [weekly, setWeekly] = useState(false);
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const [monthly, setMonthly] = useState(false);
  const [datesOfMonth, setDatesOfMonth] = useState([]);
  // const [startTime,setStartTime] = useState(new Date());
  // const [endTime,setEndTime] = useState(new Date());
  const [weeklyTimeSlots, setWeeklyTimeSlots] = useState({});
  const [monthlyTimeSlots, setMonthlyTimeSlots] = useState({});
  const [schedules, setSchedules] = useState([
    {
      price: "",
      currentPrice: "",
      startDate: new Date(),
      endDate: new Date(),
      indefiniteEndDate: false,
    },
  ]);
  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || "";

  const [weeklyExists, setWeeklyExists] = useState(false);
  const [monthlyExists, setMonthlyExists] = useState(false);

  const [activeTab, setActiveTab] = useState("single");
  // const datesOptions = Array.from({ length: 31 }, (_, i) => ({
  //   label: `${i + 1}`,
  //   value: i + 1,
  // }));

  useEffect(() => {
    if (show && asin) {
      setActiveTab("single");
      resetForm();
      fetchProductPriceBySku(sku1);
      fetchProductDetailsByAsin(asin);

      fetchSchedules(sku1);
    } else if (show && !asin) {
      onClose();
    }
  }, [show, asin]);

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
    setSku("");
    setCurrentPrice("");
    setPrice("");
    setStartDate(new Date());
    setEndDate(new Date());
    // setStartTime(new Date());
    // setEndTime(new Date());
    setIndefiniteEndDate(false);
    setSuccessMessage("");
    setErrorMessage("");
    setWeeklyTimeSlots({});
    setMonthlyTimeSlots({});
    setSchedules([ {
      price: "",
      currentPrice: "",
      startDate: new Date(),
      endDate: new Date(),
      indefiniteEndDate: false,
    }]);
  };

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

  // Function to handle adding time slots for monthly dates
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
    
    for (const day in weeklyTimeSlots) {
     
      const slots = weeklyTimeSlots[day];
      /*
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
      } */
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
/*
      if (parseInt(date) === currentDayOfMonth) {
        // If the selected date is today, check the time
        for (let slot of slots) {
          if (slot.startTime < now) {
            setErrorMessage(
              "The selected start time is in the past for today's time slot. Please select a future time."
            );
            return false;
          }
        }
      } */
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
/*
// Helper function to convert time to EDT if the timezone is Bangladesh
const convertToEDT = (timeString, userTimeZone, date = new Date()) => {
  const [hours, minutes] = timeString.split(":").map(Number);
  date.setHours(hours, minutes, 0, 0); // Set the time

  // Only convert if the user's time zone is Bangladesh (Asia/Dhaka)
  if (userTimeZone === "Asia/Dhaka") {
    const edtDate = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);

    // Extract the converted hours and minutes in EDT
    const edtHours = parseInt(edtDate.find((part) => part.type === "hour").value);
    const edtMinutes = parseInt(edtDate.find((part) => part.type === "minute").value);

    return new Date(date.setHours(edtHours, edtMinutes, 0, 0)); // Return as a Date object in EDT
  } else {
    // Return the original date object if no conversion is needed
    return date;
  }
};

// Helper function to format time for messages
const formatTime = (date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// Main validation function
const validateTimeSlots = () => {
  const isTimeSlotOverlapping = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
  };

  const now = convertToEDT(formatTime(new Date()), timeZone); // Get the current time in EDT if in Bangladesh
  const today = now.getDay(); // Get today's day index
  const currentDayOfMonth = now.getDate(); // Get today's date in the month

  // Validate schedules for overlapping
  for (let i = 0; i < schedules.length; i++) {
    const schedule1 = schedules[i];
    const start1 = convertToEDT(formatTime(new Date(schedule1.startDate)), timeZone); // Convert start date to EDT if Bangladesh
    const end1 = convertToEDT(formatTime(new Date(schedule1.endDate || schedule1.startDate)), timeZone); // Convert end date to EDT if Bangladesh

    for (let j = i + 1; j < schedules.length; j++) {
      const schedule2 = schedules[j];
      const start2 = convertToEDT(formatTime(new Date(schedule2.startDate)), timeZone); // Convert start date to EDT if Bangladesh
      const end2 = convertToEDT(formatTime(new Date(schedule2.endDate || schedule2.startDate)), timeZone); // Convert end date to EDT if Bangladesh

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

  // Validate "Until Changed" option
  for (let i = 0; i < schedules.length - 1; i++) {
    const prevSchedule = schedules[i];
    const currentSchedule = schedules[schedules.length - 1];

    const prevEndDate = convertToEDT(formatTime(new Date(prevSchedule.endDate || prevSchedule.startDate)), timeZone);
    const currentStartDate = convertToEDT(formatTime(new Date(currentSchedule.startDate)), timeZone);

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

  // Validate weekly time slots
  for (const day in weeklyTimeSlots) {
    const slots = weeklyTimeSlots[day];
    if (parseInt(day) === today) {
      for (let slot of slots) {
        const startTimeEDT = convertToEDT(slot.startTime, timeZone);
        if (startTimeEDT < now) {
          setErrorMessage(
            "The selected start time is in the past for today's time slot. Please select a future time."
          );
          return false;
        }
      }
    }

    for (let i = 0; i < slots.length; i++) {
      const slot1 = slots[i];
      const startTimeEDT1 = convertToEDT(slot1.startTime, timeZone);
      const endTimeEDT1 = convertToEDT(slot1.endTime, timeZone);

      if (startTimeEDT1 >= endTimeEDT1) {
        setErrorMessage(
          `For day ${day}, start time must be earlier than end time.`
        );
        return false;
      }

      for (let j = i + 1; j < slots.length; j++) {
        const slot2 = slots[j];
        const startTimeEDT2 = convertToEDT(slot2.startTime, timeZone);
        const endTimeEDT2 = convertToEDT(slot2.endTime, timeZone);

        if (
          isTimeSlotOverlapping(
            startTimeEDT1,
            endTimeEDT1,
            startTimeEDT2,
            endTimeEDT2
          )
        ) {
          setErrorMessage(
            `Time slots for day ${day} overlap between ${formatTime(
              startTimeEDT1
            )} - ${formatTime(endTimeEDT1)} and ${formatTime(
              startTimeEDT2
            )} - ${formatTime(endTimeEDT2)}.`
          );
          return false;
        }
      }
    }
  }

  // Validate monthly time slots
  for (const date in monthlyTimeSlots) {
    const slots = monthlyTimeSlots[date];
    if (parseInt(date) === currentDayOfMonth) {
      for (let slot of slots) {
        const startTimeEDT = convertToEDT(slot.startTime, timeZone);
        if (startTimeEDT < now) {
          setErrorMessage(
            "The selected start time is in the past for today's time slot. Please select a future time."
          );
          return false;
        }
      }
    }

    for (let i = 0; i < slots.length; i++) {
      const slot1 = slots[i];
      const startTimeEDT1 = convertToEDT(slot1.startTime, timeZone);
      const endTimeEDT1 = convertToEDT(slot1.endTime, timeZone);

      if (startTimeEDT1 >= endTimeEDT1) {
        setErrorMessage(
          `For date ${date}, start time must be earlier than end time.`
        );
        return false;
      }

      for (let j = i + 1; j < slots.length; j++) {
        const slot2 = slots[j];
        const startTimeEDT2 = convertToEDT(slot2.startTime, timeZone);
        const endTimeEDT2 = convertToEDT(slot2.endTime, timeZone);

        if (
          isTimeSlotOverlapping(
            startTimeEDT1,
            endTimeEDT1,
            startTimeEDT2,
            endTimeEDT2
          )
        ) {
          setErrorMessage(
            `Time slots for date ${date} overlap between ${formatTime(
              startTimeEDT1
            )} - ${formatTime(endTimeEDT1)} and ${formatTime(
              startTimeEDT2
            )} - ${formatTime(endTimeEDT2)}.`
          );
          return false;
        }
      }
    }
  }

  return true;
};

*/

  const fetchSchedules = async (sku1) => {
    try {
      setLoading(true);
      const schedules = await fetchExistingSchedules(sku1);
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

  const fetchProductPriceBySku = async (SellerSKU) => {
    setLoading(true);
    try {
      const priceData = await fetchPriceBySku(SellerSKU);
      setCurrentPrice(priceData?.offerAmount);
      setProductPrice(priceData?.offerAmount);
      setSku(priceData?.sku);
    } catch (error) {
      console.error(
        `Error fetching price for SKU ${SellerSKU}:`,
        error.message
      );
      throw error;
    }
  };

  const fetchProductDetailsByAsin = async (asin) => {
    setLoading(true);
    try {
      const data = await fetchProductDetails(asin);
      if (data && data.payload && data.payload[0] && data.payload[0].Product) {
        const productDetails = data.payload[0].Product.Offers[0];
        // setSku(productDetails.SellerSKU);
        // setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);

        const additionalData = await fetchProductAdditionalDetails(asin);
        if (
          additionalData &&
          additionalData.payload &&
          additionalData.payload.AttributeSets[0]
        ) {
          setTitle(additionalData.payload.AttributeSets[0].Title);
          setImageUrl(additionalData.payload.AttributeSets[0].SmallImage.URL);
        } else {
          setErrorMessage("Failed to fetch additional product details.");
        }
      } else {
        setErrorMessage("Failed to fetch product details.");
      }
    } catch (error) {
      setErrorMessage(
        "Error fetching product details: " +
          (error.response ? error.response.data.error : error.message)
      );
    } finally {
      setLoading(false);
    }
  };

  // Convert time to UTC before sending to backend
  const convertTimeToUtc = (time) => {
    return moment(time).utc().format("HH:mm");
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

        for (const [day, timeSlots] of Object.entries(weeklyTimeSlots)) {
          weeklySlotsInUtc[day] = timeSlots.map(
            ({ startTime, endTime, newPrice, revertPrice }) => ({
              startTime: convertTimeToUtc(startTime),
              endTime: convertTimeToUtc(endTime),
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

        for (const [date, timeSlots] of Object.entries(monthlyTimeSlots)) {
          monthlySlotsInUtc[date] = timeSlots.map(
            ({ startTime, endTime, newPrice, revertPrice }) => ({
              startTime: convertTimeToUtc(startTime),
              endTime: convertTimeToUtc(endTime),
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

  const disableAddNewButton = schedules.some(
    (schedule) => schedule.indefiniteEndDate
  );

  useEffect(() => {
    if (showSuccessModal) {
      const timer = setTimeout(() => {
        setShowSuccessModal(false);
      }, 1000); // 1000ms = 1 second

      return () => clearTimeout(timer); 
    }
  }, [showSuccessModal, setShowSuccessModal]);


  return (
    <>
      <Modal
        centered={true}
        show={show}
        onHide={onClose}
        dialogClassName="update-price-list-modal"
      >
        {loading ? (
          // Display only the spinner when loading
          <div
            className="flex items-center justify-center"
            style={{ height: "75vh" }}
          >
            {/* <Spinner animation="border" role="status" /> */}
            <div
              className=""
              style={{
                // marginTop: "100px",
                paddingTop: "30px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                padding: "20px",
                width: "100%",
                textAlign: "center",
              }}
            >
              {/* <Spinner animation="border" /> Loading... */}
              <img
                style={{
                  width: "30px",
                  marginRight: "6px",
                }}
                className="animate-pulse flex justify-center items-center"
                src={priceoboIcon}
                alt="Priceobo Icon"
              />
              <br />

              <div className="block">
                <p className="text-base"> Loading...</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <Modal.Header closeButton>
              <ProductDetailsWithNumbers
                product={product}
                channelStockValue={channelStockValue}
                fulfillmentChannel={fulfillmentChannel}
                price={parseFloat(productPrice).toFixed(2)}
                asin={asin}
                sku1={sku1}
                fnSku={fnSku}
                updatePriceModal={true}
              ></ProductDetailsWithNumbers>
            </Modal.Header>

            <Modal.Body className="update-price-list-modal-body">
              {successMessage && (
                <Alert variant="success">{successMessage}</Alert>
              )}
              {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
              <Form onSubmit={handleSubmit}>
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className=" "
                >
                  {/* <Tabs defaultValue="single" className=" "> */}
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single">Single </TabsTrigger>
                    <TabsTrigger
                      // disabled={loading || monthly || weeklyExists}
                      disabled={weeklyExists}
                      value="weekly"
                    >
                      Weekly{" "}
                    </TabsTrigger>
                    <TabsTrigger
                      // disabled={loading || weekly || monthlyExists}
                      disabled={monthlyExists}
                      value="monthly"
                    >
                      Monthly{" "}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="single" className="py-2">
                    <div className="max-w-[55%] mx-auto mt-2  ">
                      {!weekly && !monthly && (
                        <>
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
                                  controlId={`formStartDate-${index}`}
                                >
                                  {/* <Form.Label>Start Date and Time</Form.Label> */}
                                  <DatePicker
                                    selected={schedule.startDate}
                                    onChange={(date) =>
                                      handleScheduleChange(
                                        index,
                                        "startDate",
                                        date
                                      )
                                    }
                                    showTimeSelect
                                    dateFormat="Pp"
                                    className="form-control"
                                    required
                                    disabled={loading}
                                  />
                                </Form.Group>

                                <Form.Group controlId={`formNewPrice-${index}`}>
                                  <Form.Control
                                    type="number"
                                    className="update-custom-input"
                                    placeholder="Start Price"
                                    step="0.01"
                                    value={schedule.price}
                                    onChange={(e) =>
                                      handleScheduleChange(
                                        index,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    required
                                    disabled={loading}
                                  />
                                </Form.Group>
                              </div>

                              <div className="grid grid-cols-3 gap-1 mt-2">
                                {!schedule.indefiniteEndDate && (
                                  <div className="bg-[#DCDCDC]  flex justify-center items-center rounded-sm ">
                                    <h2 className="text-black">End</h2>
                                  </div>
                                )}

                                {!schedule.indefiniteEndDate && (
                                  <Form.Group
                                    className="flex flex-col"
                                    controlId={`formEndDate-${index}`}
                                  >
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
                                      disabled={loading}
                                    />
                                  </Form.Group>
                                )}

                                {!schedule.indefiniteEndDate && (
                                  <Form.Group
                                    controlId={`formRevertPrice-${index}`}
                                  >
                                    {/* <Form.Label>Enter Revert Price</Form.Label> */}
                                    <Form.Control
                                      type="number"
                                      step="0.01"
                                      value={schedule.currentPrice}
                                      onChange={(e) =>
                                        handleScheduleChange(
                                          index,
                                          "currentPrice",
                                          e.target.value
                                        )
                                      }
                                      className="form-control update-custom-input"
                                      placeholder="End Price"
                                      required={!schedule.indefiniteEndDate}
                                    />
                                  </Form.Group>
                                )}
                              </div>
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
                                    disabled={loading}
                                  />
                                </Form.Group>
                              )}

                              {index > -1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSchedule(index)}
                                  className="mt-2 absolute top-[-5px] right-1 shadow-sm "
                                  disabled={loading}
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
                              disabled={loading || disableAddNewButton}
                              className={`mt-1 ml-[4%] w-[30%] ${
                                disableAddNewButton
                                  ? "bg-[#DCDCDC] text-slate-500"
                                  : "bg-[#DCDCDC] text-black"
                              }  py-2 px-2 rounded-sm `}
                            >
                              {/* <FaPlus /> */}
                              Add Time Slot
                            </button>
                          )}
                        </>
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
                    {monthly && (
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
                    )}
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
                  disabled={loading}
                >
                  {weekly
                    ? "Weekly Update"
                    : monthly
                    ? "Monthly Update Price"
                    : "Update Price"}
                </Button>
              </Form>
            </Modal.Body>
          </>
        )}
      </Modal>

      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Successfully updated price!</Modal.Title>
        </Modal.Header>
      </Modal>
    </>
  );
};

export default UpdatePriceFromList;