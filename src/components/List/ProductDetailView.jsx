import React, { useContext, useEffect, useState } from "react";
import { Card, Table, Button, Modal } from "react-bootstrap";
import { LuPencilLine } from "react-icons/lu";
import { PiWarehouse } from "react-icons/pi";
import { CiEdit } from "react-icons/ci";
import { PenLine, Timer, TimerOff, Trash } from "lucide-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import EditScheduleFromList from "./EditScheduleFromList";
import DetailedCalendarView from "../Calendar/DetailedCalendarView";
import { daysOptions, datesOptions } from "../../utils/staticValue";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { MdCheck } from "react-icons/md";
import { BsClipboardCheck, BsFillInfoSquareFill } from "react-icons/bs";
import { FaArrowRightLong, FaRankingStar } from "react-icons/fa6";
import { Calendar } from "../ui/calendar";
import { DateTime } from "luxon";
import {
  Card as ShadCdnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaTrash } from "react-icons/fa";
import ProductDetailsWithNumbers from "../shared/ProductDetailsWithNumbers";
// import { PriceScheduleContext } from "@/contexts/PriceScheduleContext";

// const BASE_URL = `https://api.priceobo.com`;

const BASE_URL = "http://localhost:3000";
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

// function addHoursToTime(timeString, hoursToAdd) {
//   const [hours, minutes] = timeString.split(":").map(Number);
//   const newHours = (hours + hoursToAdd) % 24;
//   const formattedHours = newHours < 10 ? `0${newHours}` : newHours;
//   return `${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`;
// }
// function addHoursToTime(timeString, hoursToAdd) {
//   if (!timeString || typeof timeString !== "string") {
//     console.error("Invalid timeString:", timeString);
//     return "Invalid Time"; // Return a default value or handle it gracefully
//   }

//   const [hours, minutes] = timeString.split(":").map(Number);
//   const newHours = (hours + hoursToAdd) % 24; // Ensures the hour stays in 24-hour format
//   const formattedHours = newHours < 10 ? `0${newHours}` : newHours; // Add leading zero if necessary
//   return `${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`; // Add leading zero to minutes if necessary
// }
function addHoursToTime(timeString, hoursToAdd) {
  if (!timeString || typeof timeString !== "string") {
    console.error("Invalid timeString:", timeString);
    return "Invalid Time"; // Return a default value or handle it gracefully
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  const newHours = (hours + hoursToAdd) % 24; // Ensures the hour stays in 24-hour format
  const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero to minutes if necessary

  // Convert 24-hour time to 12-hour format with AM/PM
  const period = newHours >= 12 ? "PM" : "AM";
  const hours12 = newHours % 12 || 12; // Convert to 12-hour format
  const formattedHours = hours12 < 10 ? `0${hours12}` : hours12;

  return `${formattedHours}:${formattedMinutes} ${period}`; // Return time in 12-hour format with AM/PM
}
/*
function convertToUserLocalTime(utcTimeString) {
  if (!utcTimeString || typeof utcTimeString !== "string") {
    console.error("Invalid timeString:", utcTimeString);
    return "Invalid Time"; // Return a default value or handle it gracefully
  }

  // Parse the time string assuming it's in UTC
  const [hours, minutes] = utcTimeString.split(":").map(Number);

  // Create a DateTime object from the current date with the time provided
  const utcDateTime = DateTime.utc().set({ hour: hours, minute: minutes });

  // Convert UTC DateTime to America/New_York time zone (EDT/EST depending on daylight savings)
  const edtDateTime = utcDateTime.setZone("America/New_York");

  // Format the time in EDT with AM/PM
  return edtDateTime.toLocaleString(DateTime.TIME_SIMPLE);  // This will format with AM/PM
  
  return localTime;
}
*/

function convertToUserLocalTime(utcTimeString) {
  if (!utcTimeString || typeof utcTimeString !== "string") {
    console.error("Invalid timeString:", utcTimeString);
    return "Invalid Time"; // Return a default value or handle it gracefully
  }

  // Parse the time string assuming it's in UTC
  const [hours, minutes] = utcTimeString.split(":").map(Number);
  
  // Create a Date object using the current date and UTC time
  const now = new Date();
  const utcDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes));
// Convert to the user's local time zone with AM/PM format
const options = { hour: '2-digit', minute: '2-digit', hour12: true };
const localTime = utcDate.toLocaleTimeString([], options);  // This will format with AM/PM
  
  return localTime;
}


const getDayLabelFromNumber = (dayNumber) => {
  return dayNames[dayNumber] || "";
};
const getDateLabelFromNumber = (dateNumber) => {
  return dateNames[dateNumber - 1] || `Day ${dateNumber}`; // Fallback if dateNumber is out of range
};
/*
const displayTimeSlotsWithDayLabels = (
  timeSlots,
  addHours = 0,
  isWeekly = false
) => {
  return Object.entries(timeSlots).map(([key, slots]) => (
    <div key={key}>
      <strong>
        {isWeekly
          ? getDayLabelFromNumber(Number(key))
          : getDateLabelFromNumber(Number(key))}
      </strong>
      {slots.map((slot, index) => (
        <p key={index}>
          {addHoursToTime(slot.startTime, addHours)} -{" "}
          {addHoursToTime(slot.endTime, addHours)}
        </p>
      ))}
    </div>
  ));
}; */
const displayTimeSlotsWithDayLabels = (timeSlots, isWeekly = false) => {
  return Object.entries(timeSlots).map(([key, slots]) => (
    <div key={key}>
      <strong>
        {isWeekly
          ? getDayLabelFromNumber(Number(key))
          : getDateLabelFromNumber(Number(key))}
      </strong>
      {slots.map((slot, index) => (
        <p key={index}>
          {convertToUserLocalTime(slot.startTime)} -{" "}
          {convertToUserLocalTime(slot.endTime)}
        </p>
      ))}
    </div>
  ));
};


const ProductDetailView = ({
  product,
  listing,
  asin,
  sku1,
  price,
  fnSku,
  channelStockValue,
  fulfillmentChannel,
}) => {
  if (!product.AttributeSets) {
    return <p>Product data is not available for this ASIN.</p>;
  }
  const [priceSchedule, setPriceSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);
  const [editScheduleModalTitle, setEditScheduleModalTitle] = useState(null);
  const [currentPrice, setCurrentPrice] = useState("");
  const { addEvent, removeEvent } = useContext(PriceScheduleContext);

  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [copiedfnSkuIndex, setCopiedfnSkuIndex] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [singleLength, setSingleLength] = useState("");
  const [weeklyLength, setWeeklyLength] = useState("");
  const [monthlyLength, setMonthlyLength] = useState("");

  // const [weeklyTimeSlots, setWeeklyTimeSlots] = useState(
  //   editSchedule.weeklyTimeSlots || {}
  // );
  // const [weeklyTimeSlots, setWeeklyTimeSlots] = useState(
  //   existingSchedule.weeklyTimeSlots || {}
  // );
  // const [monthlyTimeSlots, setMonthlyTimeSlots] = useState(
  //   editSchedule.monthlyTimeSlots || {}
  // );
  // const [monthlyTimeSlots, setMonthlyTimeSlots] = useState(
  //   existingSchedule.monthlyTimeSlots || {}
  // );

  const { currentUser } = useSelector((state) => state.user);

  const { events } = useContext(PriceScheduleContext); // Get the events from the context
  const [selectedDays, setSelectedDays] = useState([]);

  useEffect(() => {
    // Map the events' start dates to selectedDays array
    const scheduleDates = events.map((event) => new Date(event.start));
    setSelectedDays(scheduleDates); // Set the selected dates
  }, [events]);

  const handleDateSelect = (dates) => {
    setSelectedDays(dates); // Update the selected days on user interaction
  };
  const [dates, setDates] = React.useState([]);
  const userName = currentUser?.userName || "";

  const formatDateTime = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  const getDayLabels = (daysOfWeek) => {
    return daysOfWeek
      .map((day) => daysOptions.find((option) => option.value === day)?.label)
      .join(", ");
  };
  const getDateLabels = (datesOfMonth) => {
    return datesOfMonth
      .map(
        (date) => datesOptions.find((option) => option.value === date)?.label
      )
      .join(", ");
  };

  useEffect(() => {
    const validSchedule = priceSchedule.find(
      (sc) =>
        sc.status !== "deleted" &&
        sc.weekly &&
        (sc.endDate === null || (sc.endDate && new Date(sc.endDate) >= now))
    );

    if (validSchedule) {
      setCurrentPrice(validSchedule.currentPrice);
    }
  }, [priceSchedule]);

  useEffect(() => {
    // Set dummy dates for testing
    const dummyDates = ["2024-08-06", "2024-09-02", "2024-09-10", "2024-09-25"];

    // Convert string dates to Date objects
    const dateObjects = dummyDates.map((date) => new Date(date));
    setDates(dateObjects);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const getData = async () => {
      try {
        setLoading(true);
        const encodedSku = encodeURIComponent(sku1);
        const response = await axios.get(
          `${BASE_URL}/api/schedule/${encodedSku}`
        );

        const sortedData = response.data.result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPriceSchedule(sortedData);

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        setPriceSchedule(data.result || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError("Error fetching schedule data.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (sku1) {
      getData();
    }

    return () => {
      controller.abort();
    };
  }, [sku1]);

  const handleEdit = (schedule, scheduleType) => {
    setEditSchedule(schedule);
    setEditScheduleModalTitle(scheduleType);
  };
  const handleShowConfirmation = () => {
    setShowConfirmationModal(true);
  };
  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
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

  // const handleDelete = async () => {
  //   try {
  //     await deleteSchedule(editSchedule._id);
  //     // await deleteSchedule(existingSchedule._id);
  //     removeEvent(editSchedule._id);
  //     setSuccessMessage(`Schedule deleted successfully for SKU: ${sku1}`);
  //     setShowSuccessModal(true);
  //     handleClose();
  //   } catch (error) {
  //     setErrorMessage(
  //       "Error deleting schedule: " +
  //         (error.response ? error.response.data.error : error.message)
  //     );
  //     console.error("Error deleting schedule:", error);
  //   }
  // };

  // const handleRemoveTimeSlot = (scheduleType, identifier, index) => {
  //   if (scheduleType === "weekly") {
  //     setWeeklyTimeSlots((prevSlots) => {
  //       const updatedSlots = { ...prevSlots };
  //       updatedSlots[identifier] = updatedSlots[identifier].filter(
  //         (_, i) => i !== index
  //       );
  //       // If no more time slots remain for the day, remove the day entirely
  //       if (updatedSlots[identifier].length === 0) {
  //         delete updatedSlots[identifier];
  //       }
  //       return updatedSlots;
  //     });
  //   } else if (scheduleType === "monthly") {
  //     setMonthlyTimeSlots((prevSlots) => {
  //       const updatedSlots = { ...prevSlots };
  //       updatedSlots[identifier] = updatedSlots[identifier].filter(
  //         (_, i) => i !== index
  //       );
  //       // If no more time slots remain for the date, remove the date entirely
  //       if (updatedSlots[identifier].length === 0) {
  //         delete updatedSlots[identifier];
  //       }
  //       return updatedSlots;
  //     });
  //   }
  // };

  const handleClose = () => {
    setEditSchedule(null);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "asin") {
          setCopiedAsinIndex(text);
          setTimeout(() => setCopiedAsinIndex(null), 2000);
        } else if (type === "sku") {
          setCopiedSkuIndex(text);
          setTimeout(() => setCopiedSkuIndex(null), 2000);
        } else {
          setCopiedfnSkuIndex(text);
          setTimeout(() => setCopiedfnSkuIndex(null), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  // const price = listing?.payload?.[0]?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice;
  // const offer = listing?.payload?.[0]?.Product?.Offers?.[0];
  // const price = offer?.BuyingPrice?.ListingPrice;
  // const sellerSKU = offer?.SellerSKU;
  // const amount = product?.AttributeSets[0]?.ListPrice?.Amount;

  const detailStyles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    image: {
      width: "50px",
      maxHeight: "50px",
      objectFit: "contain",
      marginRight: "20px",
    },
    card: {
      // padding: "20px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      height: "91.2vh",
      width: "100%",
      borderRadius: "2px",
    },
    title: {
      fontSize: "14px",
      textAlign: "left",
      fontWeight: "normal",
    },
    info: {
      fontSize: "14px",
      marginBottom: "5px",
      marginLeft: "10px",
    },
    tableContainer: {
      marginTop: "20px",
      width: "100%",
      maxHeight: "420px", // Set a max height for the table container
      // overflowY: "scroll", // Enable vertical scrolling
      overflowX: "hidden",
      padding: "20px",
    },
    table: {
      width: "100%",
      marginBottom: 0,
    },
  };

  const now = new Date();

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return daysOfWeek[date.getDay()];
  };

  const countActiveSingleDaySchedules = () => {
    return priceSchedule.filter(
      (sc) =>
        sc.status !== "deleted" &&
        !sc.weekly &&
        !sc.monthly && // Ensure it's not weekly or monthly
        sc.startDate && // Ensure there's a start date
        (!sc.endDate || new Date(sc.endDate) >= now) // Either no end date or end date is in the future
    ).length;
  };
  const getFilteredWeeklySlotLength = (priceSchedule) => {
    return priceSchedule
      .filter(
        (sc) => sc.status !== "deleted" && sc.weekly // Filter for weekly schedules
      )
      .reduce(
        (totalSlots, sc) =>
          totalSlots +
          Object.values(sc.weeklyTimeSlots).reduce(
            (acc, slots) => acc + slots.length,
            0
          ),
        0
      );
  };
  const getFilteredMonthlySlotLength = (priceSchedule) => {
    return priceSchedule
      .filter(
        (sc) => sc.status !== "deleted" && sc.monthly // Filter for monthly schedules
      )
      .reduce(
        (totalSlots, sc) =>
          totalSlots +
          Object.values(sc.monthlyTimeSlots).reduce(
            (acc, slots) => acc + slots.length,
            0
          ),
        0
      );
  };
  const singleDayLength = countActiveSingleDaySchedules();
  const weeklySlotLength = getFilteredWeeklySlotLength(priceSchedule);

  const monthlySlotLength = getFilteredMonthlySlotLength(priceSchedule);

  return (
    <div style={{ width: "100%", paddingTop: "10px" }}>
      <Card style={detailStyles.card} className=" p-0">
        {loading ? (
          <div
            style={{
              // marginTop: "100px",
              paddingTop: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "90vh",
              padding: "20px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* <Spinner animation="border" /> Loading... */}
            <img
              style={{ width: "30px", marginRight: "6px" }}
              className="animate-pulse"
              src={priceoboIcon}
              alt="Priceobo Icon"
            />
            <br />

            <div className="block">
              <p className="text-base"> Loading...</p>
            </div>
          </div>
        ) : (
          <Card.Body className="p-0">
            <div>
              <div className="border-b-2 mb-2 bg-[#F6F6F8] ">
                <h2 className="py-[6px] text-center text-sm">
                  Schedule Details
                </h2>
              </div>

              {/* product image and details with asin numbers */}

              <ProductDetailsWithNumbers
                product={product}
                channelStockValue={channelStockValue}
                fulfillmentChannel={fulfillmentChannel}
                price={price}
                asin={asin}
                sku1={sku1}
                fnSku={fnSku}
                updatePriceModal={false}
              ></ProductDetailsWithNumbers>

              <hr
                style={{ width: "90%", margin: "0 auto", marginTop: "10px" }}
              />

              <div className="m-3 ">
                <DetailedCalendarView sku1={sku1} />
              </div>
              {/* tabs  */}

              <div className="px-2 py-1 m-2 h-[45vh] overflow-y-auto">
                <Tabs defaultValue="single" className="">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="single">
                      Single ({singleDayLength})
                    </TabsTrigger>
                    <TabsTrigger value="weekly">
                      Weekly ({weeklySlotLength}){" "}
                    </TabsTrigger>
                    <TabsTrigger value="monthly">
                      Monthly ({monthlySlotLength})
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="single">
                    <>
                      {/* Filter schedules for single entries and check if data exists */}
                      {priceSchedule.filter(
                        (sc) =>
                          sc.status !== "deleted" &&
                          !sc.weekly &&
                          !sc.monthly &&
                          (sc.endDate === null ||
                            (sc.endDate && new Date(sc.endDate) >= now))
                      ).length > 0 ? (
                        // Map through the filtered schedules
                        priceSchedule
                          .filter(
                            (sc) =>
                              sc.status !== "deleted" &&
                              !sc.weekly &&
                              !sc.monthly &&
                              (sc.endDate === null ||
                                (sc.endDate && new Date(sc.endDate) >= now))
                          )
                          .map((sc, index) => (
                            <ShadCdnCard
                              className="flex justify-center w-full gap-2 mb-2 px-2 py-2"
                              key={sc.id}
                            >
                              <div key={index} className="w-full">
                                <h3 className="flex text-[12px] justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                  {formatDateTime(sc.startDate)}
                                  {sc.price && (
                                    <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                      ${sc?.price?.toFixed(2)}
                                    </span>
                                  )}
                                </h3>
                              </div>
                              <span className="flex justify-center items-center text-gray-400">
                                <FaArrowRightLong />
                              </span>
                              {sc.endDate ? (
                                <div className="w-full">
                                  <h3 className="flex justify-between text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                    {formatDateTime(sc.endDate)}
                                    {sc.currentPrice && (
                                      <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                        ${sc?.currentPrice?.toFixed(2)}
                                      </span>
                                    )}
                                  </h3>
                                </div>
                              ) : (
                                <div className="w-full">
                                  <h3 className="text-red-400 font-semibold text-[14px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                    <span className="">Until change back</span>
                                  </h3>
                                </div>
                              )}
                              <div className="w-[20%] text-center flex justify-center items-start mt-1">
                                <button
                                  onClick={() => handleEdit(sc, "Single")}
                                  disabled={
                                    (!sc.weekly &&
                                      !sc.monthly &&
                                      sc.endDate != null &&
                                      (sc.endDate && new Date(sc.endDate)) <
                                        now) ||
                                    !currentUser?.permissions?.write
                                  }
                                  className="bg-[#0662BB] py-1 px-1 rounded-sm"
                                >
                                  <PenLine size={18} className="text-white" />
                                </button>
                              </div>
                            </ShadCdnCard>
                          ))
                      ) : (
                        // Show this when no matching schedule is found
                        <ShadCdnCard className="text-center py-3">
                          <p className="text-2xl flex justify-center">
                            <BsFillInfoSquareFill className="text-[#0D6EFD]" />
                          </p>
                          <h5 className="text-base">Not Found</h5>
                        </ShadCdnCard>
                      )}
                    </>
                  </TabsContent>

                  <TabsContent value="weekly">
                    <>
                      <div>
                        {/* Filter the schedules that have weekly data */}
                        {priceSchedule.filter(
                          (sc) =>
                            sc.status !== "deleted" &&
                            sc.weekly &&
                            Object.keys(sc.weeklyTimeSlots).length > 0
                        ).length > 0 ? (
                          priceSchedule
                            .filter(
                              (sc) =>
                                sc.status !== "deleted" &&
                                (sc.weekly ||
                                  sc.monthly ||
                                  sc.endDate === null ||
                                  (sc.endDate && new Date(sc.endDate) >= now))
                            )
                            .map((sc, scheduleIndex) => {
                              return sc.weekly
                                ? Object.keys(sc.weeklyTimeSlots).map((day) => {
                                    // Check if there are time slots for this day
                                    if (sc.weeklyTimeSlots[day].length > 0) {
                                      return (
                                        <ShadCdnCard
                                          key={`${scheduleIndex}-${day}`}
                                          className="flex flex-col mb-1"
                                        >
                                          <div className=" ">
                                            {/* <div className="grid grid-cols-[93%_7%] "> */}
                                            <div className=" bg-[#DCDCDC] border-0 m-0 p-0 rounded-t-sm ">
                                              <span className="text-black text-start text-sm py-1 px-1 rounded-t-sm mr-2 border-0 m-0 p-0">
                                                {getDayLabelFromNumber(day)}
                                              </span>
                                            </div>

                                            {/* <button
                                              onClick={() => handleEdit(sc)}
                                              className="bg-[#0662BB] py-1 px-1 rounded-sm ml-2"
                                            >
                                              <PenLine
                                                size={20}
                                                className="text-white"
                                              />
                                            </button> */}
                                          </div>
                                          <div>
                                            {sc.weeklyTimeSlots[day].map(
                                              (timeSlot, timeIndex) => (
                                                <div
                                                  key={timeIndex}
                                                  className=""
                                                >
                                                  <div className="flex justify-center w-full gap-2 my-2 px-2 ">
                                                    <div className="w-full">
                                                      <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                      {/* {timeSlot.startTime} */}
                                                        {addHoursToTime(
                                                          timeSlot?.startTime,
                                                          0
                                                        )}
                                                        {/* {convertToUserLocalTime(timeSlot?.startTime)} */}
                                                        <span className="bg-blue-500 text-white p-1 rounded-sm">
                                                          $
                                                          {parseFloat(
                                                            timeSlot?.newPrice
                                                          ).toFixed(2)}
                                                        </span>
                                                      </h3>
                                                    </div>
                                                    <span className="flex justify-center items-center text-gray-400">
                                                      <FaArrowRightLong />
                                                    </span>
                                                    <div className="w-full">
                                                      <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                                      {/* {timeSlot.endTime} */}
                                                        {addHoursToTime(
                                                          timeSlot.endTime,
                                                          0
                                                        )}
                                                        {/* {convertToUserLocalTime(timeSlot?.endTime)} */}
                                                        {timeSlot.revertPrice ? (
                                                          <span className="bg-red-700 text-white p-1 rounded-sm">
                                                            $
                                                            {parseFloat(
                                                              timeSlot?.revertPrice
                                                            ).toFixed(2)}
                                                          </span>
                                                        ) : (
                                                          <span className="p-1">
                                                            <p className="py-2"></p>
                                                          </span>
                                                        )}
                                                      </h3>
                                                    </div>

                                                    <div className="w-[20%] text-center flex justify-center items-center mt-0">
                                                      <button
                                                        onClick={() =>
                                                          handleEdit(
                                                            sc,
                                                            "Weekly"
                                                          )
                                                        }
                                                        className="bg-[#0662BB] py-1  px-1 rounded-sm "
                                                      >
                                                        <PenLine
                                                          size={20}
                                                          className="text-white"
                                                        />
                                                      </button>
                                                    </div>
                                                  </div>
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </ShadCdnCard>
                                      );
                                    } else {
                                      return null; // Don't render anything if no time slots
                                    }
                                  })
                                : null;
                            })
                        ) : (
                          <ShadCdnCard className="text-center  py-3">
                            <p className="text-2xl flex  justify-center">
                              <BsFillInfoSquareFill className="text-[#0D6EFD]" />
                            </p>
                            <h5 className="text-base">Not Found</h5>
                          </ShadCdnCard>
                        )}
                      </div>
                    </>
                  </TabsContent>

                  <TabsContent value="monthly">
                    <>
                      {/* <div className="flex justify-center w-full gap-2 px-2">
                        <p className="text-center text-[14px] font-semibold flex items-center justify-center w-full">
                          <Timer size={16} className="mr-1" /> Start
                        </p>
                        <p className="text-center text-[14px] font-semibold flex items-center justify-center w-full">
                          <TimerOff size={16} className="mr-1" /> End
                        </p>
                        <p className="w-[20%]"></p>
                        <p className="w-[20%]"></p>
                      </div> */}

                      {priceSchedule.filter(
                        (sc) =>
                          sc.status !== "deleted" &&
                          sc.monthly &&
                          Object.keys(sc.monthlyTimeSlots).length > 0
                      ).length > 0 ? (
                        priceSchedule
                          .filter(
                            (sc) =>
                              sc.status !== "deleted" &&
                              sc.monthly &&
                              Object.keys(sc.monthlyTimeSlots).length > 0
                          )
                          .map((sc, index) =>
                            Object.keys(sc.monthlyTimeSlots).map((date) => (
                              <ShadCdnCard
                                key={index}
                                className="flex flex-col mb-1"
                              >
                                <div className="bg-[#DCDCDC] px-2 rounded-t py-1">
                                  <h5 className="text-black text-start text-sm">
                                    {getDateLabelFromNumber(date)}
                                  </h5>
                                </div>

                                {sc.monthlyTimeSlots[date].map(
                                  (timeSlot, timeIndex) => (
                                    <div
                                      key={timeIndex}
                                      className="flex justify-center w-full gap-2 px-2 py-2"
                                    >
                                      <div className="w-full">
                                        <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                          {addHoursToTime(
                                            timeSlot.startTime,
                                            0
                                          )}
                                          {/* {convertToUserLocalTime(timeSlot?.startTime)} */}
                                          <span className="bg-blue-500 text-white p-1 rounded-sm ">
                                            $
                                            {parseFloat(
                                              timeSlot?.newPrice
                                            ).toFixed(2)}
                                          </span>
                                        </h3>
                                      </div>

                                      <span className="flex justify-center items-center text-gray-400">
                                        <FaArrowRightLong />
                                      </span>

                                      <div className="w-full">
                                        <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                          {addHoursToTime(timeSlot.endTime, 0)}
                                          {/* {convertToUserLocalTime(timeSlot?.endTime)} */}
                                          {timeSlot?.revertPrice ? (
                                            <span className="bg-red-700 text-white p-1 rounded-sm">
                                              $
                                              {parseFloat(
                                                timeSlot?.revertPrice
                                              ).toFixed(2)}
                                            </span>
                                          ) : (
                                            <span className="p-1">
                                              <p className="py-2"></p>
                                            </span>
                                          )}
                                        </h3>
                                      </div>

                                      <div className="w-[20%] text-center flex justify-center items-start mt-1">
                                        <button
                                          onClick={() =>
                                            handleEdit(sc, "Monthly")
                                          }
                                          className="bg-[#0662BB] py-1 px-1 rounded-sm"
                                        >
                                          <PenLine
                                            size={20}
                                            className="text-white"
                                          />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                )}
                              </ShadCdnCard>
                            ))
                          )
                      ) : (
                        <ShadCdnCard className="text-center  py-3">
                          <p className="text-2xl flex  justify-center">
                            <BsFillInfoSquareFill className="text-[#0D6EFD]" />
                          </p>
                          <h5 className="text-base">Not Found</h5>
                        </ShadCdnCard>
                      )}
                    </>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </Card.Body>
        )}
      </Card>

      {editSchedule && (
        <EditScheduleFromList
          editScheduleModalTitle={editScheduleModalTitle}
          show={!!editSchedule}
          onClose={handleClose}
          asin={asin}
          existingSchedule={editSchedule}
        />
      )}

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
          <Button variant="danger">
            {/* <Button variant="danger" onClick={handleRemoveTimeSlot()}> */}
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductDetailView;
