import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { MultiSelect } from 'react-multi-select-component';
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";
import moment from 'moment-timezone';
import {daysOptions,datesOptions} from "../../utils/staticValue";

// const BASE_URL ='http://localhost:3000'
const BASE_URL = `https://api.priceobo.com`;

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dateNames = [
  "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th",
  "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th",
  "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"
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
  weeklyTimeSlots={},
  monthly,
  monthlyTimeSlots={}
 
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
  const [daysOfWeek, setDaysOfWeek] = useState(
    existingSchedule.daysOfWeek || []
  );
  const [monthly, setMonthly] = useState(existingSchedule.monthly || false);
  const [datesOfMonth, setDatesOfMonth] = useState(
    existingSchedule.datesOfMonth || []
  );
  const [weeklyTimeSlots, setWeeklyTimeSlots] = useState(existingSchedule.weeklyTimeSlots || {});
  const [monthlyTimeSlots, setMonthlyTimeSlots] = useState(existingSchedule.monthlyTimeSlots || {});

  const [startTime,setStartTime] = useState(new Date());
  const [endTime,setEndTime] = useState(new Date());
  const [scheduleType, setScheduleType] = useState(''); 
  const [scheduleId, setScheduleId] = useState("");
  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPriceInput, setShowPriceInput] = useState(false); // New state variable for controlling price input visibility

  const { currentUser } = useSelector((state) => state.user);
  console.log(datesOfMonth);
  const userName = currentUser.userName;

  console.log("data:" + existingSchedule.endDate);

  const handleTimeSlotChange = (scheduleType, day, index, key, newTime) => {
    if (newTime instanceof Date && !isNaN(newTime)) {
      const formattedTime = formatDateToTimeString(newTime); // Format to 'HH:mm'
      if (scheduleType === 'weekly') {
        setWeeklyTimeSlots((prevSlots) => {
          const updatedSlots = { ...prevSlots };
          updatedSlots[day][index][key] = formattedTime;
          return updatedSlots;
        });
      } else if (scheduleType === 'monthly') {
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
  
  const formatDateToTimeString = (date) => {
    if (!(date instanceof Date) && !isNaN(date)) {
      console.error("Invalid date passed to formatDateToTimeString:", date);
      return ''; // Return empty string or fallback value
    }
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    console.log(hours+minutes+"formated")
    return `${hours}:${minutes}`;
  };
  // const convertTimeStringToDate = (timeString) => {
  //   if (!timeString || typeof timeString !== 'string') {
  //     console.error('Invalid timeString:', timeString);
  //     return new Date(); 
  //   }
  
  //   const [hours, minutes] = timeString.split(':').map(Number);
  //   const now = new Date();
  //   now.setHours(hours, minutes, 0, 0);
  //   return now;
  // };
  function convertTimeStringToDate(timeString) {
    if (timeString instanceof Date && !isNaN(timeString)) {
      return timeString; // If it's already a valid Date object, return it as is.
    }
  
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);
      return date;
    }
  
    console.error('Invalid time string:', timeString);
    return new Date(); // Fallback to the current date if the time is invalid.
  }
  
  
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
      setEndTime(new  Date());
     
      if (existingSchedule.weekly) {
        setScheduleType('weekly');
        setWeeklyTimeSlots(existingSchedule.weeklyTimeSlots || {});
      } else if (existingSchedule.monthly) {
        setScheduleType('monthly');
        setMonthlyTimeSlots(existingSchedule.monthlyTimeSlots || {});
      } else {
        setScheduleType('one-time');
      }
    }
  }, [show, existingSchedule]);

  console.log("weekly: "+JSON.stringify(weeklyTimeSlots));
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
      setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);

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
  const convertTimeToUtc = (time) => {
    return moment(time).utc().format("HH:mm");
  };
  //const handleTimeChange = (scheduleType,identifier, index, key, value)=>{

    // const handleTimeSlotChange = (scheduleType,identifier, index, key, value)=>{
    //   if(scheduleType === 'weekly'){
    //     setWeeklyTimeSlots((prevSlots)=>{
    //       const newSlots = [...(prevSlots[identifier]|| [])];
    //       newSlots[index][key] = value;
    //       return {...prevSlots, [identifier]: newSlots};
    //     })
    //   } else if(scheduleType === 'monthly'){
    //     setMonthlyTimeSlots((prevSlots)=>{
    //       const newSlots = [...(prevSlots[identifier] || [])];
    //       newSlots[index][key] = value;
    //       return {...prevSlots, [identifier]: newSlots};
    //     })
    //   }
    // }
   

    // const handleTimeSlotPriceChange = (scheduleType, identifier, index, value) => {
    //   if (scheduleType === 'weekly') {
    //     setWeeklyTimeSlots((prevSlots) => {
    //       const newSlots = [...(prevSlots[identifier] || [])];
    //       newSlots[index]['newPrice'] = value;
    //       return { ...prevSlots, [identifier]: newSlots };
    //     });
    //   } else if (scheduleType === 'monthly') {
    //     setMonthlyTimeSlots((prevSlots) => {
    //       const newSlots = [...(prevSlots[identifier] || [])];
    //       newSlots[index]['newPrice'] = value;
    //       return { ...prevSlots, [identifier]: newSlots };
    //     });
    //   }
    // }
    const handleTimeSlotPriceChange = (scheduleType, identifier, index, value) => {
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

 
  const handleAddTimeSlot = (scheduleType, identifier) => {
    if (scheduleType === "weekly") {
      setWeeklyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: [...(prevSlots[identifier] || []), { startTime: new Date(), endTime: new Date(), newPrice: '' }],
      }));
    } else if (scheduleType === "monthly") {
      setMonthlyTimeSlots((prevSlots) => ({
        ...prevSlots,
        [identifier]: [...(prevSlots[identifier] || []), { startTime: new Date(), endTime: new Date(), newPrice: '' }],
      }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      

      // const utcStartTime = convertTimeToUtc(startTime);
      // const utcEndTime = convertTimeToUtc(endTime);
      

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
        for (const [day, timeSlots] of Object.entries(weeklyTimeSlots)) {
          utcWeeklySlots[day] = timeSlots.map(({ startTime, endTime, newPrice}) => ({
            startTime: convertTimeToUtc(startTime),
            endTime: convertTimeToUtc(endTime),
            newPrice: parseFloat(newPrice)
          }));
        }
      }
  
      if (monthly) {
        for (const [date, timeSlots] of Object.entries(monthlyTimeSlots)) {
          utcMonthlySlots[date] = timeSlots.map(({ startTime, endTime, newPrice }) => ({
            startTime: convertTimeToUtc(startTime),
            endTime: convertTimeToUtc(endTime),
            newPrice: parseFloat(newPrice)
          }));
        }
      }
      console.log("weekly utc: "+ JSON.stringify(utcWeeklySlots));

      // const updatedDaysOfWeek = daysOfWeek.filter(day => day).map(day => day.value || day);
      // const updatedDatesOfMonth = datesOfMonth.filter(date => date).map(date => date.value || date);
      // console.log("time and sinn "+asin+utcStartTime+utcEndTime);
      const updateData = { 
        startDate,
        endDate: indefiniteEndDate ? null : endDate,
        price: parseFloat(price),  // Ensure price is a number
        currentPrice: parseFloat(currentPrice),  // Ensure currentPrice is a number
        userName,
        title,
        asin,
        sku,
        imageURL,
        weekly: scheduleType === 'weekly',
        weeklyTimeSlots: utcWeeklySlots,
        monthly: scheduleType === 'monthly',
        monthlyTimeSlots: utcMonthlySlots,
      };
         //startTime:startTime.toTimeString().slice(0, 5),
        //endTime:endTime.toTimeString().slice(0, 5)
      await axios.put(`${BASE_URL}/api/schedule/change/${existingSchedule._id}`, updateData);

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
    setDaysOfWeek(prevDays =>
      prevDays.includes(value)
        ? prevDays.filter(day => day !== value)
        : [...prevDays, value]
    );
  };

  const handleDateChange = (value) => {
    setDatesOfMonth(prevDates =>
      prevDates.includes(value)
        ? prevDates.filter(date => date !== value)
        : [...prevDates, value]
    );
  };

  const parseTimeString = (timeString) => {
    if (!timeString || typeof timeString !== 'string') {
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
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
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
            <Form.Group controlId="formAsin" style={{ marginBottom: '15px' }}>
              <Form.Label>ASIN: {asin}</Form.Label>
            </Form.Group>
            <Form.Group controlId="formPrice" style={{ marginBottom: '15px' }}>
              <Form.Label>Changed to: ${existingSchedule.price}</Form.Label>
            </Form.Group>
            <Button
              variant="success"
              style={{ width: "40%", marginBottom: "15px" }}
              onClick={handleSetPriceClick}
            >
              Set Price
            </Button>
            {showPriceInput && (
              <Form.Group controlId="formNewPrice" style={{ marginBottom: '15px' }}>
                <Form.Label>New Price</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="Enter New Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </Form.Group>
            )}
            {scheduleType === 'one-time' && (
              <>
                <Form.Group controlId="formStartDate" style={{ marginBottom: '15px' }}>
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
                <Form.Group controlId="formIndefiniteEndDate" style={{ marginBottom: '15px' }}>
                  <Form.Check
                    type="checkbox"
                    label="Until I change."
                    checked={indefiniteEndDate}
                    onChange={() => setIndefiniteEndDate(!indefiniteEndDate)}
                  />
                </Form.Group>
                {!indefiniteEndDate && (
                  <Form.Group controlId="formEndDate" style={{ marginBottom: '15px' }}>
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
            {scheduleType === 'weekly' && (
              <>
              {daysOptions.map((day) => (
                <div key={day.value}>
                  <Form.Label>{day.label}</Form.Label>
                  {(weeklyTimeSlots[day.value] || []).map((slot, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                    {/* <p>{convertTimeStringToDate(slot.startTime)}</p> */}
                    <DatePicker
                        // selected={slot.startTime ? parseTimeString(slot.startTime) : new Date()} 
                        selected={slot.startTime ? convertTimeStringToDate(slot.startTime) : new Date()} 
                        // selected={slot.startTime instanceof Date ? slot.startTime : new Date()}
                        // selected={slot.startTime}

                        // selected={slot.startTime}
                        onChange={(time) =>
                          handleTimeSlotChange("weekly", day.value, index, "startTime", time)
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
                        selected={slot.endTime ? convertTimeStringToDate(slot.endTime) : new Date()} 
                        // selected={slot.endTime instanceof Date ? slot.endTime : new Date()}

                        // selected={slot.endTime}
                        // onChange={(time) =>
                        //   handleTimeSlotChange("weekly", day.value, index, "endTime", time)
                        // }
                        onChange={(time) => handleTimeSlotChange("weekly", day.value, index, "endTime", time)}

                        showTimeSelect
                          showTimeSelectOnly
                          timeIntervals={15}
                          timeCaption="End"
                          dateFormat="h:mm aa"
                          className="form-control me-2"
                      />
                      <Form.Control
                        type="number"
                        value={slot.newPrice}
                        placeholder="Price"
                        // onChange={(e) => handleTimeSlotPriceChange('monthly', date.value, index, e.target.value)}
                        onChange={(e) =>
                          handleTimeSlotPriceChange("weekly", day.value, index, e.target.value)
                        }
                        className="me-2"
                      />
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveTimeSlot("weekly", day.value, index)}
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
            {scheduleType === 'monthly' && (
              <>
              {datesOptions.map((date) => (
                <div key={date.value}>
                  <Form.Label>{date.label}</Form.Label>
                  {(monthlyTimeSlots[date.value] || []).map((slot, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                    <DatePicker
                        selected={slot.startTime ? parseTimeString(slot.startTime) : new Date()} // Parse the time string
                        onChange={(time) =>
                          handleTimeSlotChange("monthly", date.value, index, "startTime", time)
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={15}
                        timeCaption="Start"
                        dateFormat="h:mm aa"
                        className="form-control me-2"
                      />
                      <DatePicker
                         selected={slot.endTime ? parseTimeString(slot.endTime) : new Date()} // Parse the time string
                        onChange={(time) =>
                          handleTimeSlotChange("monthly", date.value, index, "endTime", time)
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
                        placeholder="Price"
                        onChange={(e) =>
                          handleTimeSlotChange("monthly", date.value, index, "newPrice", e.target.value)
                        }
                        className="me-2"
                      />
                      <Button
                        variant="danger"
                        onClick={() => handleRemoveTimeSlot("monthly", date.value, index)}
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
            <Button style={{ width: "40%", backgroundColor: "black" }} type="submit">
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
        <Modal.Body>
          Are you sure you want to delete this schedule?
        </Modal.Body>
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