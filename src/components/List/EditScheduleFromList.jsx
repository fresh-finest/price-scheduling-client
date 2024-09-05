import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { MultiSelect } from 'react-multi-select-component';
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";
import { current } from "@reduxjs/toolkit";
import {daysOptions,datesOptions} from "../../utils/staticValue";
// const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com'
// const BASE_URL = 'https://price-scheduling-server-2.onrender.com'

// const BASE_URL ='http://localhost:3000'
const BASE_URL = `https://quiet-stream-22437-07fa6bb134e0.herokuapp.com/http://100.26.185.72:3000`;


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
  scheduleId,
  startDate,
  endDate,
  price,
  currentPrice,
  userName,
  weekly,
  daysOfWeek,
  monthly,
  datesOfMonth,
  startTime,
  endTime
) => {
  try {
    const response = await axios.put(
      `${BASE_URL}/api/schedule/change/${scheduleId}`,
      {
        asin,
        scheduleId,
        startDate,
        endDate,
        price,
        currentPrice,
        userName,
        weekly,
        daysOfWeek,
        monthly,
        datesOfMonth,
        startTime,
        endTime,
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
      // setWeekly(existingSchedule.weekly);
      // setDaysOfWeek(existingSchedule.daysOfWeek);
      // setMonthly(existingSchedule.monthly);
      // setDatesOfMonth(existingSchedule.datesOfMonth);
      if (existingSchedule.weekly) {
        setScheduleType('weekly');
        setDaysOfWeek(existingSchedule.daysOfWeek || []);
      } else if (existingSchedule.monthly) {
        setScheduleType('monthly');
        setDatesOfMonth(existingSchedule.datesOfMonth || []);
      } else {
        setScheduleType('one-time');
      }
    }
  }, [show, existingSchedule]);

  useEffect(() => {
    if (show && asin) {
      fetchProductDetailsByAsin(asin);
      setPrice(existingSchedule.price);
      // setCurrentPrice(existingSchedule.currentPrice);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // await updateSchedule(
      //   asin,
      //   existingSchedule._id,
      //   startDate,
      //   indefiniteEndDate ? null : endDate,
      //   price,
      //   existingSchedule.currentPrice,
      //   userName,
      //   weekly,
      //   daysOfWeek.map(day=>day.value),
      //   monthly,
      //   datesOfMonth.map(date=>date.value)
      // );
      // currentPrice = existingSchedule.currentPrice;
      const updateData = {
        startDate,
        endDate: indefiniteEndDate ? null : endDate,
        price,
        currentPrice,
        userName,
        daysOfWeek: scheduleType === 'weekly' ? daysOfWeek : [],
        datesOfMonth: scheduleType === 'monthly' ? datesOfMonth : [],
        weekly: scheduleType === 'weekly',
        monthly: scheduleType === 'monthly',
        startTime:startTime.toTimeString().slice(0, 5),
        endTime:endTime.toTimeString().slice(0, 5)
      };

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
              <Form.Group controlId="formDaysOfWeek" style={{ marginBottom: '15px' }}>
                <Form.Label>Update Weekly on</Form.Label>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {daysOptions.map((day) => (
                    <Form.Check
                      key={day.value}
                      type="checkbox"
                      label={day.label}
                      checked={daysOfWeek.includes(day.value)}
                      onChange={() => handleDayChange(day.value)}
                      style={{ marginBottom: '8px' }}
                    />
                  ))}
                </div>
                <div>
                  <strong>Selected Days:</strong> {daysOfWeek.map(day => daysOptions.find(opt => opt.value === day)?.label).join(', ')}
                </div>
              </Form.Group>
              <Form.Group controlId="formWeeklyStartTime">
                <Form.Label>Start Time</Form.Label>
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
                <Form.Label>End Time</Form.Label>
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
              </Form.Group>
              </>
            )}
            {scheduleType === 'monthly' && (
              <>
              <Form.Group controlId="formDatesOfMonth" style={{ marginBottom: '15px' }}>
                <Form.Label>Update Monthly on</Form.Label>
                <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {datesOptions.map((date) => (
                    <Form.Check
                      key={date.value}
                      type="checkbox"
                      label={date.label}
                      checked={datesOfMonth.includes(date.value)}
                      onChange={() => handleDateChange(date.value)}
                      style={{ marginBottom: '8px' }}
                    />
                  ))}
                </div>
                <div>
                  <strong>Selected Dates:</strong> {datesOfMonth.map(date => datesOptions.find(opt => opt.value === date)?.label).join(', ')}
                </div>
              </Form.Group>
              <Form.Group controlId="formMonthlyStartTime">
                <Form.Label>Start Time</Form.Label>
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
                <Form.Label>End Time</Form.Label>
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
              </Form.Group>
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