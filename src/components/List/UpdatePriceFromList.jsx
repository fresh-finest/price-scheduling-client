import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert, Spinner } from "react-bootstrap";
import DatePicker from "react-datepicker";
import { MultiSelect } from "react-multi-select-component";
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";
import{daysOptions,datesOptions} from "../../utils/staticValue"

const BASE_URL = `https://api.priceobo.com`;
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
  daysOfWeek = [],
  monthly = false,
  datesOfMonth = [],
  startTime,
  endTime
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
      daysOfWeek,
      monthly,
      datesOfMonth,
      startTime,
      endTime
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
  const [startTime,setStartTime] = useState(new Date());
  const [endTime,setEndTime] = useState(new Date());
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
    setStartTime(new Date());
    setEndTime(new Date());
    setIndefiniteEndDate(false);
    setSuccessMessage("");
    setErrorMessage("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userName || !asin || !sku || !price || !startDate || !startTime || !endTime) {
        setErrorMessage("All fields are required to update the price.");
        setLoading(false);
        return;
      }

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
        daysOfWeek.map((day) => day.value),
        monthly,
        datesOfMonth.map((date) => date.value),
        startTime.toTimeString().slice(0, 5), 
        endTime.toTimeString().slice(0, 5),   
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
              <Form.Group controlId="formWeeklyStartTime">
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
              </Form.Group>
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
              <Form.Group controlId="formMonthlyStartTime">
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
              </Form.Group>
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
