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

const fetchExistingSchedules = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/schedule`);
    return response.data.result.filter((schedule) => schedule.asin === asin);
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
  monthlyTimeSlots = {}
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
  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || "";

  const [weeklyExists, setWeeklyExists] = useState(false);
  const [monthlyExists, setMonthlyExists] = useState(false);

  console.log("weekly exists", weeklyExists);
  console.log("monthly exists", monthlyExists);

  const [activeTab, setActiveTab] = useState("single");
  console.log(activeTab);
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

      fetchSchedules(asin);
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

    for (const day in weeklyTimeSlots) {
      const slots = weeklyTimeSlots[day];
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

  const fetchSchedules = async (asin) => {
    try {
      setLoading(true);
      const schedules = await fetchExistingSchedules(asin);
      setExistingSchedules(schedules);

      const hasWeekly = schedules.some(
        (schedule) => schedule.weekly && schedule.status != "deleted"
      );
      console.log(hasWeekly);
      const hasMonthly = schedules.some(
        (schedule) => schedule.monthly && schedule.status != "deleted"
      );
      console.log("has monthly", hasMonthly);

      setWeeklyExists(hasWeekly);
      setMonthlyExists(hasMonthly);
    } catch (error) {
      setErrorMessage("Error fetching existing schedules.");
    } finally {
      setLoading(false);
    }
  };

  console.log("SKUUUU: " + sku);
  const fetchProductPriceBySku = async (SellerSKU) => {
    setLoading(true);
    try {
      const priceData = await fetchPriceBySku(SellerSKU);
      setCurrentPrice(priceData?.offerAmount);
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
      // if (endTime < startTime) {
      //   setErrorMessage("End Time cannot be earlier than Start Time.");
      //   setLoading(false);
      //   return;
      // }
      // Convert startTime and endTime to UTC
      //  const utcStartTime = convertTimeToUtc(startTime);
      //  const utcEndTime = convertTimeToUtc(endTime);

      // Check for overlapping schedules
      const overlappingSchedule = existingSchedules.find((schedule) => {
        console.log(schedule.status);
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
      console.log(overlappingSchedule);

      // if (overlappingSchedule) {
      //   setErrorMessage(
      //     "Cannot create a schedule during an existing scheduled period."
      //   );
      //   setLoading(false);
      //   return;
      // }

      const weeklySlotsInUtc = {};
      const monthlySlotsInUtc = {};

      if (weekly) {
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
      }

      if (monthly) {
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
      }

      /* if (weekly) {
        for (const [day, timeSlots] of Object.entries(weeklySlots)) {
          for (const { startTime, endTime } of timeSlots) {
            if (!startTime || !endTime) {
              setErrorMessage("Start time and end time are required for each weekly time slot.");
              setLoading(false);
              return;
            }
            if (endTime < startTime) {
              setErrorMessage("End time cannot be earlier than start time.");
              setLoading(false);
              return;
            }
          }
        }
      }*/

      // for (const date in monthlyTimeSlots){
      //   monthlyTimeSlots[date] = monthlyTimeSlots[date].map((slot)=>({
      //     startTime: convertTimeToUtc(slot.startTime),
      //     endTime: convertTimeToUtc(slot.endTime),
      //   }))
      // }
      // await saveScheduleAndQueueJobs(
      //   userName,
      //   asin,
      //   sku,
      //   title,
      //   price,
      //   currentPrice,
      //   imageURL,
      //   startDate,
      //   indefiniteEndDate ? null : endDate,
      //   weekly,
      //   daysOfWeek.map((day) => day.value),
      //   monthly,
      //   datesOfMonth.map((date) => date.value),
      //   utcStartTime,
      //   utcEndTime

      // );
      console.log("weekly:", JSON.stringify(weeklySlotsInUtc, null, 2));
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
        monthlySlotsInUtc
      );
      console.log("weekly:" + weeklySlotsInUtc);
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
    } finally {
      setLoading(false);
    }
  };

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
                price={productPrice}
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
                    <div className="max-w-[93%] mx-auto mt-2">
                      {/* <Form.Control
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
                                  /> */}

                      {!weekly && !monthly && (
                        <>
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm ">
                              <h2 className=" text-black">Start </h2>
                            </div>
                            <Form.Group
                              className="flex flex-col"
                              controlId="formStartDate"
                            >
                              {/* <Form.Label>Start Date and Time</Form.Label> */}
                              <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                showTimeSelect
                                dateFormat="Pp"
                                className="form-control"
                                required
                                disabled={loading}
                              />
                            </Form.Group>

                            <Form.Group controlId="formPrice">
                              {/* <Form.Label>New Price</Form.Label> */}
                              <Form.Control
                                type="number"
                                placeholder="Start Price"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                required
                                disabled={loading}
                              />
                            </Form.Group>
                          </div>

                          <div className="grid grid-cols-3 gap-4 my-2">
                            {!indefiniteEndDate && (
                              <div className="bg-[#DCDCDC]  flex justify-center items-center rounded-sm ">
                                <h2 className="text-black">End</h2>
                              </div>
                            )}

                            {!indefiniteEndDate && (
                              <Form.Group
                                className="flex flex-col"
                                controlId="formEndDate"
                              >
                                {/* <Form.Label>End Date and Time</Form.Label> */}
                                <DatePicker
                                  selected={endDate}
                                  onChange={(date) => setEndDate(date)}
                                  showTimeSelect
                                  dateFormat="Pp"
                                  className="form-control"
                                  required={!indefiniteEndDate}
                                  disabled={loading}
                                />
                              </Form.Group>
                            )}

                            {!indefiniteEndDate && (
                              // <Form.Group controlId="formPrice">
                              //   <Form.Control
                              //     type="number"
                              //     placeholder="Enter New Price"
                              //     value={price}
                              //     onChange={(e) => setPrice(e.target.value)}
                              //     required
                              //     disabled={loading}
                              //   />
                              // </Form.Group>

                              //  <Form.Control
                              //       type="number"
                              //       placeholder="Enter Revert Price"
                              //       required
                              //       step="0.01"
                              //       value={slot.revertPrice} // Add input for revertPrice
                              //       onChange={(e) =>
                              //         handleTimeSlotPriceChange(
                              //           "weekly",
                              //           day.value,
                              //           index,
                              //           "revertPrice",
                              //           e.target.value
                              //         )
                              //       }
                              //       className="form-control modal-custom-input "
                              //     />

                              <Form.Group controlId="formCurrentPrice">
                                {/* <Form.Label>Enter Revert Price</Form.Label> */}
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  // value={parseFloat(currentPrice).toFixed(2)}
                                  // value={parseFloat(currentPrice).toFixed(2)}
                                  onChange={(e) =>
                                    setCurrentPrice(e.target.value)
                                  }
                                  className="form-control "
                                  placeholder="End Price"
                                  // onChange={(e)=>{
                                  //   const inputPrice = parseFloat(e.target.value);

                                  //   if(!isNaN(inputPrice)){
                                  //     setCurrentPrice(inputPrice.toFixed(2));
                                  //   }
                                  // }}
                                />
                              </Form.Group>
                            )}
                          </div>

                          <Form.Group controlId="formIndefiniteEndDate">
                            <Form.Check
                              type="checkbox"
                              label="Until I change."
                              checked={indefiniteEndDate}
                              onChange={() =>
                                setIndefiniteEndDate(!indefiniteEndDate)
                              }
                              disabled={loading}
                            />
                          </Form.Group>
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
                                className="  p-2 border-0 bg-[#F1F1F2] shadow-md my-2 rounded-sm"
                              >
                                {/* start time and start price */}
                                {/* <div className="grid grid-cols-4 gap-1  my-1"> */}
                                <div className="flex justify-center items-center gap-1  my-1">
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
                                    placeholder="Enter New Price"
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
                                    className="form-control modal-custom-input"
                                  />
                                  {/* <Button className="w-[40px] border-0  bg-transparent ml-1  ">
                                    <span className=""></span>
                                  </Button> */}

                                  <span className=" w-[50px] border-0 flex items-center justify-center   py-2 rounded text-white">
                                    <span className=""></span>
                                  </span>
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
                                    onClick={() =>
                                      removeTimeSlot("weekly", day.value, index)
                                    }
                                    className=" w-[40px] bg-red-600 border-0 flex items-center justify-center hover:bg-red-500 px-1 py-1 rounded-sm text-white"
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
                                      className="  px-1 py-1  border-0 bg-[#F1F1F2] shadow-md my-2 rounded-sm"
                                    >
                                      {/* start time and start price */}
                                      {/* <div className="grid grid-cols-4 gap-1  my-1"> */}
                                      <div className="flex justify-center items-center gap-1  my-1">
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

                                        <span className=" w-[63px] border-0 flex items-center justify-center   py-2 rounded text-white">
                                          <span className=""></span>
                                        </span>
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
                                          onClick={() =>
                                            removeTimeSlot(
                                              "monthly",
                                              date.value,
                                              index
                                            )
                                          }
                                          className=" w-[40px] bg-red-600 border-0 flex items-center justify-center hover:bg-red-500 px-1 py-1 rounded-sm text-white"
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
