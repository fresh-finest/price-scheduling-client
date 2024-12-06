import { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
// import DatePicker from "react-datepicker";
import { DatePicker, TimePicker } from "antd";

import "react-datepicker/dist/react-datepicker.css";

import axios from "axios";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import moment from "moment-timezone";
import { daysOptions, datesOptions } from "../../utils/staticValue";

import { FaPlus } from "react-icons/fa";
import { Card } from "../ui/card";
import { IoMdClose } from "react-icons/io";
import "./EditScheduleFromList.css";

import Swal from "sweetalert2";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = "http://192.168.0.141:3000";
// const BASE_URL = `https://api.priceobo.com`;

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

const fetchProductDetails = async (sku) => {
  const encodedSku = encodeURIComponent(sku);
  try {
    const response = await axios.get(`${BASE_URL}/image/${encodedSku}`);
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
    const encodedSku = encodeURIComponent(sku);
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
  sku1,
  editScheduleModalTitle,
  productDetailLoading,
  setProductDetailLoading,
}) => {
  const [sku, setSku] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [price, setPrice] = useState("");
  const [productPrice, setProductPrice] = useState("");

  // const [startDate, setStartDate] = useState(new Date());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [indefiniteEndDate, setIndefiniteEndDate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [weekly, setWeekly] = useState(existingSchedule.weekly || false);

  const [monthly, setMonthly] = useState(existingSchedule.monthly || false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
  const [showPriceInput, setShowPriceInput] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser.userName;

  // const handleTimeSlotChange = (scheduleType, day, index, key, newTime) => {
  //   if (newTime instanceof Date && !isNaN(newTime)) {
  //     const formattedTime = formatTimeToHHMM(newTime);
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
    if (newTime && dayjs.isDayjs(newTime)) {
      const formattedTime = newTime.format("HH:mm"); // Format to HH:mm
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
      console.error("Invalid time object for time:", newTime);
    }
  };

  const formatTimeToHHMM = (date) => {
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    const encodedSku = encodeURIComponent(existingSchedule.sku);
    fetch(`${BASE_URL}/list/${encodedSku}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setProductPrice(data?.offerAmount);
      })
      .catch((error) => {
        console.error("Error:", error.message);
      });
  }, []);

  // const convertTimeToLocalFormat = (timeString) => {
  //   console.log("convert ");
  //   const date = convertTimeStringToDate(timeString);
  //   return moment(date).format("HH:mm");
  // };
  const convertTimeToLocalFormat = (timeString) => {
    if (timeString && typeof timeString === "string") {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        return dayjs().hour(hours).minute(minutes).format("HH:mm");
      }
    }
    return "00:00"; // Default to midnight if invalid
  };

  // const convertTimeStringToDate = (timeString) => {
  //   if (typeof timeString === "string" && timeString.includes(":")) {
  //     const [hours, minutes] = timeString.split(":").map(Number);
  //     if (!isNaN(hours) && !isNaN(minutes)) {
  //       const date = new Date();
  //       date.setHours(hours, minutes, 0, 0);
  //       return date;
  //     }
  //   }
  //   return new Date();
  // };

  const convertTimeStringToDate = (timeString) => {
    if (typeof timeString === "string" && timeString.includes(":")) {
      const [hours, minutes] = timeString.split(":").map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        return dayjs().hour(hours).minute(minutes);
      }
    }
    return dayjs(); // Default to current time
  };

  useEffect(() => {
    if (show && existingSchedule) {
      // setStartDate(new Date(existingSchedule.startDate));
      setStartDate(dayjs(existingSchedule.startDate));
      // setEndDate(
      //   existingSchedule.endDate
      //     ? new Date(existingSchedule.endDate)
      //     : new Date()
      // );
      setEndDate(
        existingSchedule.endDate ? dayjs(existingSchedule.endDate) : dayjs()
      );
      setIndefiniteEndDate(!existingSchedule.endDate);
      setStartTime(new Date());
      setEndTime(new Date());
      setPrice(existingSchedule.price);
      setCurrentPrice(existingSchedule.currentPrice);

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

  useEffect(() => {
    if (show && sku1) {
      fetchProductDetailsByAsin(sku1);
      setPrice(existingSchedule.price);
      setCurrentPrice(existingSchedule.currentPrice);
    }
  }, [show, sku1]);

  const fetchProductDetailsByAsin = async (sku) => {
    try {
      const data = await fetchProductDetails(sku);

      if (data) {
        setTitle(data?.summaries[0]?.itemName);
        setImageUrl(data?.summaries[0]?.mainImage.link);
      }
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

  const handleAddTimeSlot = (scheduleType, identifier) => {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, "0");
    const minutes = currentDate.getMinutes().toString().padStart(2, "0");

    const formattedTime = `${hours}:${minutes}`;
    const endDate = new Date(currentDate.getTime() + 60 * 60 * 1000);

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
    setLoading(true);
    try {
      if (!indefiniteEndDate && endDate < startDate) {
        setErrorMessage("End Date cannot be earlier than Start Date.");

        return;
      }
      if (!validateTimeSlots()) {
        setErrorMessage("Set correct time.");
        return;
      }

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

      const updateData = {
        startDate,
        endDate: indefiniteEndDate ? null : endDate,
        price: parseFloat(price),
        currentPrice: parseFloat(currentPrice),
        userName,
        title,
        asin,
        sku: sku1,
        imageURL,
        weekly: scheduleType === "weekly",
        weeklyTimeSlots: utcWeeklySlots,
        monthly: scheduleType === "monthly",
        monthlyTimeSlots: utcMonthlySlots,
        timeZone,
      };

      console.log("timeZone", timeZone);

      await axios.put(
        `${BASE_URL}/api/schedule/change/${existingSchedule._id}`,
        updateData
      );
      setLoading(false);

      Swal.fire({
        title: `Successfully updated schedule!`,
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      setProductDetailLoading(true);
      onClose();
    } catch (error) {
      setLoading(false);
      Swal.fire({
        title: "Error!",
        text: `Failed to update schedule`,
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });

      console.error("Error scheduling price update:", error);
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeleteLoading(true);
        try {
          await deleteSchedule(existingSchedule._id);

          setSuccessMessage(`Schedule deleted successfully for SKU: ${sku}`);
          setShowSuccessModal(true);
          Swal.fire({
            title: "Deleted!",
            text: "Your Schedule has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setProductDetailLoading(true);
          setDeleteLoading(false);
          onClose();
        } catch (error) {
          const errorMessage = error.response
            ? error.response.data.error
            : error.message;
          setErrorMessage("Error deleting schedule: " + errorMessage);
          console.error("Error deleting schedule:", error);
          setDeleteLoading(false);
          Swal.fire({
            title: "Error!",
            text: `Failed to delete schedule: ${errorMessage}`,
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  const handleShowConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
  };

  const handleSetPriceClick = () => {
    setShowPriceInput(!showPriceInput);
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
      return new Date();
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

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
                      {productPrice ? (
                        <h2 style={{ fontSize: "13px" }}>
                          ${parseFloat(productPrice).toFixed(2)}
                        </h2>
                      ) : (
                        <h2 style={{ fontSize: "13px" }}>Loading...</h2>
                      )}
                    </div>

                    {/* fba/fbm  */}
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                      {/* <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        showTimeSelect
                        dateFormat="Pp"
                        className="form-control"
                        required
                      /> */}
                      <DatePicker
                        className="py-[0.45rem]"
                        showTime={{
                          format: "hh:mm A",
                          use12Hours: true,
                        }}
                        format="YYYY-MM-DD hh:mm A"
                        value={startDate}
                        onChange={(date) => setStartDate(date)}
                      />
                    </Form.Group>

                    <Form.Group
                      controlId="formNewPrice"
                      style={{ height: "37px" }}
                    >
                      {/* <Form.Label>Start Price</Form.Label> */}
                      <Form.Control
                        type="number"
                        className="w-full update-schedule-custom-input"
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
                        {/* <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          showTimeSelect
                          dateFormat="Pp"
                          className="form-control"
                          required={!indefiniteEndDate}
                        /> */}
                        <DatePicker
                          className="py-[0.45rem]"
                          showTime={{
                            format: "hh:mm A",
                            use12Hours: true,
                          }}
                          format="YYYY-MM-DD hh:mm A"
                          value={endDate}
                          onChange={(date) => setEndDate(date)}
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
                          className="w-full update-schedule-custom-input"
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
                          className="p-2 border-0 bg-[#F1F1F2] shadow-md rounded-sm relative"
                        >
                          {/* Start Time and Price */}
                          <div className="flex justify-between items-center gap-2 my-1 mt-4">
                            <h3 className=" text-center w-[35px]">Start</h3>
                            {/* <DatePicker
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
                            /> */}

                            <TimePicker
                              use12Hours
                              format="hh:mm A" // Hour, minute, and AM/PM
                              className="form-control edit-modal-custom-input"
                              value={
                                slot.startTime
                                  ? convertTimeStringToDate(slot.startTime) // Convert string to dayjs object
                                  : dayjs() // Default to current time
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
                          </div>

                          {/* End Time and Revert Price */}
                          <div className="flex justify-between items-center gap-2 my-1">
                            <h3 className=" text-center w-[80px]">End</h3>
                            {/* <DatePicker
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
                            /> */}

                            <TimePicker
                              use12Hours
                              format="hh:mm A" // Hour, minute, and AM/PM
                              className="form-control edit-modal-custom-input"
                              value={
                                slot.endTime
                                  ? convertTimeStringToDate(slot.endTime) // Convert string to dayjs object
                                  : dayjs() // Default to current time
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
                              className="border-0 flex items-center justify-center px-1 py-1 rounded-sm text-black shadow-sm absolute top-0 right-0"
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
                            className="my-2 px-1 py-1 border-0 bg-[#F1F1F2] rounded-sm relative"
                          >
                            <div className="flex justify-center items-center gap-1 my-1 mt-4">
                              <h3 className="w-[40px] flex justify-center items-center text-[13px]">
                                Start
                              </h3>
                              {/* <DatePicker
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
                              /> */}

                              <TimePicker
                                use12Hours
                                format="hh:mm A" // Hour, minute, and AM/PM
                                className="form-control edit-modal-custom-input w-[230px]"
                                value={
                                  slot.startTime
                                    ? convertTimeStringToDate(slot.startTime) // Convert string to dayjs object
                                    : dayjs() // Default to current time
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
                            </div>

                            <div className="flex justify-center items-center gap-1">
                              <h3 className="flex justify-center items-center  text-[13px] w-[75px]">
                                End
                              </h3>
                              {/* <DatePicker
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
                              /> */}
                              <TimePicker
                                use12Hours
                                format="hh:mm A" // Hour, minute, and AM/PM
                                className="form-control edit-modal-custom-input w-[230px]"
                                value={
                                  slot.endTime
                                    ? convertTimeStringToDate(slot.endTime) // Convert string to dayjs object
                                    : dayjs() // Default to current time
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
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveTimeSlot(
                                    "monthly",
                                    date.value,
                                    index
                                  )
                                }
                                className="border-0 flex items-center justify-center px-1 py-1 rounded-sm text-black shadow-sm absolute top-0 right-0"
                              >
                                <IoMdClose />
                              </button>
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
              {deleteLoading ? (
                <Button variant="danger" className="px-5" disabled>
                  Loading...
                </Button>
              ) : (
                <Button
                  variant="danger"
                  className="px-5"
                  onClick={handleDelete}
                >
                  Delete Schedule
                </Button>
              )}
              {loading ? (
                <Button
                  className="px-5"
                  style={{
                    backgroundColor: "#0B5ED7",
                    marginLeft: "10px",
                  }}
                  disabled
                >
                  Loading...
                </Button>
              ) : (
                <Button
                  className="px-5"
                  style={{
                    backgroundColor: "#0B5ED7",
                    marginLeft: "10px",
                  }}
                  type="submit"
                >
                  Update Schedule
                </Button>
              )}
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
