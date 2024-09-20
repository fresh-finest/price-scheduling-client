import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { MultiSelect } from "react-multi-select-component";
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from 'moment-timezone';

import{daysOptions,datesOptions} from "../../utils/staticValue"

const BASE_URL = 'https://api.priceobo.com';
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
  weeklyTimeSlots={},
  monthly = false,
  // datesOfMonth = [],
  monthlyTimeSlots={}
) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/schedule/change`, {
      userName,
      asin,
      sku,
      title,
      price: parseFloat(price),
      currentPrice,
      imageURL,
      startDate,
      endDate,
      weekly,
      // daysOfWeek,
      weeklyTimeSlots,
      monthly,
      // datesOfMonth,
      monthlyTimeSlots
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

const UpdatePriceFromList = ({ show, onClose, asin }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [sku, setSku] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
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
  const [weeklyTimeSlots,setWeeklyTimeSlots] = useState({});
  const [monthlyTimeSlots,setMonthlyTimeSlots]= useState({});
  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || "";

  const [weeklyExists, setWeeklyExists] = useState(false);
  const [monthlyExists, setMonthlyExists] = useState(false);

 

  // const datesOptions = Array.from({ length: 31 }, (_, i) => ({
  //   label: `${i + 1}`,
  //   value: i + 1,
  // }));

  useEffect(() => {
    if (show && asin) {
      resetForm();
      fetchProductDetailsByAsin(asin);
      fetchSchedules(asin);
    } else if (show && !asin) {
      onClose();
    }
  }, [show, asin]);

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
      [day]: [...(prevSlots[day] || []), { startTime: new Date(), endTime: new Date(), newPrice:'' }],
    }));
  };

  // Function to handle adding time slots for monthly dates
  const addMonthlyTimeSlot = (date) => {
    setMonthlyTimeSlots((prevSlots) => ({
      ...prevSlots,
      [date]: [...(prevSlots[date] || []), { startTime: new Date(), endTime: new Date(), newPrice:''}],
    }));
  };


  const removeTimeSlot = (scheduleType, identifier, index) => {
    if (scheduleType === 'weekly') {
      setWeeklyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: prevSlots[identifier].filter((_, i) => i !== index),
      }));
    } else if (scheduleType === 'monthly') {
      setMonthlyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: prevSlots[identifier].filter((_, i) => i !== index),
      }));
    }
  };

  const handleTimeChange = (scheduleType,identifier, index, key, value)=>{
    if(scheduleType === 'weekly'){
      setWeeklyTimeSlots((prevSlots)=>{
        const newSlots = [...(prevSlots[identifier]|| [])];
        newSlots[index][key] = value;
        return {...prevSlots, [identifier]: newSlots};
      })
    } else if(scheduleType === 'monthly'){
      setMonthlyTimeSlots((prevSlots)=>{
        const newSlots = [...(prevSlots[identifier] || [])];
        newSlots[index][key] = value;
        return {...prevSlots, [identifier]: newSlots};
      })
    }
  }

  const handleTimeSlotPriceChange = (scheduleType, identifier, index, value) => {
    if (scheduleType === 'weekly') {
      setWeeklyTimeSlots((prevSlots) => {
        const newSlots = [...(prevSlots[identifier] || [])];
        newSlots[index]['newPrice'] = value;
        return { ...prevSlots, [identifier]: newSlots };
      });
    } else if (scheduleType === 'monthly') {
      setMonthlyTimeSlots((prevSlots) => {
        const newSlots = [...(prevSlots[identifier] || [])];
        newSlots[index]['newPrice'] = value;
        return { ...prevSlots, [identifier]: newSlots };
      });
    }
  }

  const validateTimeSlots = () => {
    // Check weekly slots
    for (const day in weeklyTimeSlots) {
      for (const slot of weeklyTimeSlots[day]) {
        if (slot.startTime >= slot.endTime) {
          setErrorMessage(`For day ${day}, start time must be earlier than end time.`);
          return false;
        }
      }
    }

    // Check monthly slots
    for (const date in monthlyTimeSlots) {
      for (const slot of monthlyTimeSlots[date]) {
        if (slot.startTime >= slot.endTime) {
          setErrorMessage(`For date ${date}, start time must be earlier than end time.`);
          return false;
        }
      }
    }

    return true;
  };

  const fetchSchedules = async (asin) => {
    try {
      const schedules = await fetchExistingSchedules(asin);
      setExistingSchedules(schedules);

      const hasWeekly = schedules.some((schedule) => schedule.weekly && schedule.status !="deleted");
      const hasMonthly = schedules.some((schedule) => schedule.monthly && schedule.status !="deleted");

      setWeeklyExists(hasWeekly);
      setMonthlyExists(hasMonthly);
      
    } catch (error) {
      setErrorMessage("Error fetching existing schedules.");
    }
  };

  const fetchProductDetailsByAsin = async (asin) => {
    setLoading(true);
    try {
      const data = await fetchProductDetails(asin);
      if (data && data.payload && data.payload[0] && data.payload[0].Product) {
        const productDetails = data.payload[0].Product.Offers[0];
        setSku(productDetails.SellerSKU);
        setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);

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
      if (!userName || !asin || !sku ) {
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

      if (overlappingSchedule) {
        setErrorMessage(
          "Cannot create a schedule during an existing scheduled period."
        );
        setLoading(false);
        return;
      }

      const weeklySlotsInUtc = {};
      const monthlySlotsInUtc = {};
  
      if (weekly) {
        for (const [day, timeSlots] of Object.entries(weeklyTimeSlots)) {
          weeklySlotsInUtc[day] = timeSlots.map(({ startTime, endTime, newPrice}) => ({
            startTime: convertTimeToUtc(startTime),
            endTime: convertTimeToUtc(endTime),
            newPrice: parseFloat(newPrice)
          }));
        }
      }
  
      if (monthly) {
        for (const [date, timeSlots] of Object.entries(monthlyTimeSlots)) {
          monthlySlotsInUtc[date] = timeSlots.map(({ startTime, endTime, newPrice }) => ({
            startTime: convertTimeToUtc(startTime),
            endTime: convertTimeToUtc(endTime),
            newPrice: parseFloat(newPrice)
          }));
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
      console.log("weekly:"+weeklySlotsInUtc);
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
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Scheduled Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading && <Spinner animation="border" />}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formAsin">
              <Form.Label>ASIN: {asin || "Not available"}</Form.Label>
            </Form.Group>
            <Form.Group controlId="formCurrentPrice">
              <Form.Label>
                Current Price: ${currentPrice || "Not available"}
              </Form.Label>
            </Form.Group>
            <Form.Group controlId="formPrice">
              <Form.Label>New Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter New Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                disabled={loading}
              />
            </Form.Group>
            <Form.Group controlId="formWeekly">
              <Form.Check
                type="checkbox"
                label="Repeat Weekly"
                checked={weekly}
                onChange={() => setWeekly(!weekly)}
                disabled={loading || monthly || weeklyExists}
              />
            </Form.Group>
            {weekly && (
            <>
              <Form.Group controlId="formDaysOfWeek">
                <Form.Label>Repeat Weekly on</Form.Label>
                <MultiSelect
                  options={daysOptions}
                  value={daysOfWeek}
                  onChange={setDaysOfWeek}
                  labelledBy="Select"
                />
              </Form.Group>
              {daysOfWeek.map((day) => (
                  <div key={day.value}>
                    <h5>{day.label}</h5>
                    {weeklyTimeSlots[day.value]?.map((slot, index) => (
                      <div key={index} className="d-flex mb-2">
                        <DatePicker
                          selected={slot.startTime}
                          onChange={(time) => handleTimeChange('weekly', day.value, index, 'startTime', time)}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Start"
                          dateFormat="h:mm aa"
                          className="form-control me-2"
                        />
                        <DatePicker
                          selected={slot.endTime}
                          onChange={(time) => handleTimeChange('weekly', day.value, index, 'endTime', time)}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="End"
                          dateFormat="h:mm aa"
                          className="form-control"
                        />
                         <Form.Control
                           type="number"
                           placeholder="Enter New Price"
                           value={slot.newPrice}
                           onChange={(e) => handleTimeSlotPriceChange('weekly', day.value, index, e.target.value)}
                           className="form-control me-2"
                         />
                        <Button variant="danger" onClick={() => removeTimeSlot('weekly', day.value, index)} className="ms-2">
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => addWeeklyTimeSlot(day.value)}>Add Time Slot</Button>
                  </div>
                ))}

              {/* <Form.Group controlId="formWeeklyStartTime">
                <Form.Label style={{ marginRight: "25px" }}>Start Time</Form.Label>
                <DatePicker
                  selected={startTime}
                  onChange={(time) => setStartTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="form-control"
                />
              </Form.Group>
              <Form.Group controlId="formWeeklyEndTime">
                <Form.Label style={{ marginRight: "25px" }}>End Time</Form.Label>
                <DatePicker
                  selected={endTime}
                  onChange={(time) => setEndTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="form-control"
                />
              </Form.Group> */}
            </>
          )}

            <Form.Group controlId="formMonthly">
              <Form.Check
                type="checkbox"
                label="Repeat Monthly"
                checked={monthly}
                onChange={() => setMonthly(!monthly)}
                disabled={loading || weekly || monthlyExists}
              />
            </Form.Group>
            {monthly && (
            <>
              <Form.Group controlId="formDatesOfMonth">
                <Form.Label>Repeat Monthly on</Form.Label>
                <MultiSelect
                  options={datesOptions}
                  value={datesOfMonth}
                  onChange={setDatesOfMonth}
                  labelledBy="Select"
                />
              </Form.Group>
              {datesOfMonth.map((date) => (
                  <div key={date.value}>
                    <h5>Date: {date.label}</h5>
                    {monthlyTimeSlots[date.value]?.map((slot, index) => (
                      <div key={index} className="d-flex mb-2">
                        <DatePicker
                          selected={slot.startTime}
                          onChange={(time) => handleTimeChange('monthly', date.value, index, 'startTime', time)}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="Start"
                          dateFormat="h:mm aa"
                          className="form-control me-2"
                        />
                        <DatePicker
                          selected={slot.endTime}
                          onChange={(time) => handleTimeChange('monthly', date.value, index, 'endTime', time)}
                          showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="End"
                          dateFormat="h:mm aa"
                          className="form-control"
                        />
                        <Form.Control
                           type="number"
                           placeholder="Enter New Price"
                           value={slot.newPrice}
                           onChange={(e) => handleTimeSlotPriceChange('monthly', date.value, index, e.target.value)}
                           className="form-control me-2"
                         />
                        <Button variant="danger" onClick={() => removeTimeSlot('monthly', date.value, index)} className="ms-2">
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={() => addMonthlyTimeSlot(date.value)}>Add Time Slot</Button>
                  </div>
                ))}
              {/* <Form.Group controlId="formMonthlyStartTime">
                <Form.Label style={{ marginRight: "25px" }}>Start Time</Form.Label>
                <DatePicker
                  selected={startTime}
                  onChange={(time) => setStartTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="form-control"
                />
              </Form.Group>
              <Form.Group controlId="formMonthlyEndTime">
                <Form.Label style={{ marginRight: "25px" }}>End Time</Form.Label>
                <DatePicker
                  selected={endTime}
                  onChange={(time) => setEndTime(time)}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="h:mm aa"
                  className="form-control"
                />
              </Form.Group> */}
            </>
          )}
            {!weekly && !monthly && (
              <>
                <Form.Group controlId="formStartDate">
                  <Form.Label style={{ marginRight: "20px" }}>
                    Start Date and Time
                  </Form.Label>
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
                <Form.Group controlId="formIndefiniteEndDate">
                  <Form.Check
                    type="checkbox"
                    label="Until I change."
                    checked={indefiniteEndDate}
                    onChange={() => setIndefiniteEndDate(!indefiniteEndDate)}
                    disabled={loading}
                  />
                </Form.Group>
                {!indefiniteEndDate && (
                  <Form.Group controlId="formEndDate">
                    <Form.Label style={{ marginRight: "25px" }}>
                      End Date and Time
                    </Form.Label>
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
              </>
            )}
            <Button
              style={{ width: "100%", backgroundColor: "black", marginTop: "30px" }}
              type="submit"
              disabled={loading}
            >
              {weekly ? 'Weekly Update' : monthly ? 'Monthly Update Price' : 'Update Price'}
            </Button>
          </Form>
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

export default UpdatePriceFromList;
