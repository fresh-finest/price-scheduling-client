import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import axios from 'axios';
import { useSelector } from 'react-redux';


const BASE_URL ='http://dynamic-price-schedule.us-east-1.elasticbeanstalk.com'
// const BASE_URL ='http://localhost:3000'

// Fetch product details function (provided in your original code)
const fetchProductDetails = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/product/${asin}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Fetch additional product details function (provided in your original code)
const fetchProductAdditionalDetails = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/details/${asin}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching additional product details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

// Fetch existing schedules for an ASIN
const fetchExistingSchedules = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/schedule`);
    return response.data.result.filter(schedule => schedule.asin === asin);
  } catch (error) {
    console.error('Error fetching existing schedules:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const saveScheduleAndQueueJobs = async (userName, asin, sku, title, price, currentPrice, imageURL, startDate, endDate) => {
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
      endDate
    });
    return response.data;
  } catch (error) {
    console.error('Error saving schedule and queuing jobs:', error.response ? error.response.data : error.message);
    throw error;
  }
};


const UpdatePriceFromList = ({ show, onClose, asin }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [sku, setSku] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [indefiniteEndDate, setIndefiniteEndDate] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [existingSchedules, setExistingSchedules] = useState([]);

  const [title, setTitle] = useState('');
  const [imageURL, setImageUrl] = useState('');
  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || '';

  useEffect(() => {
    if (show && asin) {
      resetForm();
      fetchProductDetailsByAsin(asin);
      fetchSchedules(asin);
    } else if (show && !asin) {
      onClose();  // Close the modal if asin is not provided
    }
  }, [show, asin]);

  const resetForm = () => {
    setSku('');
    setCurrentPrice('');
    setPrice('');
    setStartDate(new Date());
    setEndDate(new Date());
    setIndefiniteEndDate(false);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const fetchSchedules = async (asin) => {
    try {
      const schedules = await fetchExistingSchedules(asin);
      setExistingSchedules(schedules);
    } catch (error) {
      setErrorMessage('Error fetching existing schedules.');
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
        if (additionalData && additionalData.payload && additionalData.payload.AttributeSets[0]) {
          setTitle(additionalData.payload.AttributeSets[0].Title);
          setImageUrl(additionalData.payload.AttributeSets[0].SmallImage.URL);
        } else {
          setErrorMessage('Failed to fetch additional product details.');
        }
      } else {
        setErrorMessage('Failed to fetch product details.');
      }
    } catch (error) {
      setErrorMessage('Error fetching product details: ' + (error.response ? error.response.data.error : error.message));
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!userName || !asin || !sku || !price || !startDate) {
        setErrorMessage('All fields are required to update the price.');
        setLoading(false);
        return;
      }

      // Check for overlapping schedules
      const overlappingSchedule = existingSchedules.find(schedule => {
        const existingStart = new Date(schedule.startDate);
        const existingEnd = new Date(schedule.endDate || startDate); // if no endDate, treat as ongoing
        return (
          (startDate >= existingStart && startDate <= existingEnd) || // new start is within existing range
          (endDate && endDate >= existingStart && endDate <= existingEnd) || // new end is within existing range
          (startDate <= existingStart && (endDate ? endDate >= existingEnd : true)) // new range completely overlaps existing
        );
      });

      if (overlappingSchedule) {
        setErrorMessage('Cannot create a schedule during an existing scheduled period.');
        setLoading(false);
        return;
      }

      await saveScheduleAndQueueJobs(userName, asin, sku, title, price, currentPrice, imageURL, startDate, indefiniteEndDate ? null : endDate);


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
      setErrorMessage('Error scheduling price update: ' + (error.response ? error.response.data.error : error.message));
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
            <Form.Group controlId="formAsin" style={{ marginBottom: '15px' }}>
              <Form.Label>ASIN: {asin || 'Not available'}</Form.Label>
            </Form.Group>
            <Form.Group controlId="formCurrentPrice" style={{ marginBottom: '15px' }}>
              <Form.Label>Current Price: ${currentPrice || 'Not available'}</Form.Label>
            </Form.Group>
            <Form.Group controlId="formPrice" style={{ marginBottom: '15px' }}>
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
            <Form.Group controlId="formStartDate" style={{ marginBottom: '15px' }}>
              <Form.Label>Start Date and Time</Form.Label>
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
            <Form.Group controlId="formIndefiniteEndDate" style={{ marginBottom: '15px' }}>
              <Form.Check
                type="checkbox"
                label="Until I change."
                checked={indefiniteEndDate}
                onChange={() => setIndefiniteEndDate(!indefiniteEndDate)}
                disabled={loading}
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
                  disabled={loading}
                />
              </Form.Group>
            )}
            <Button
              style={{ width: "50%", backgroundColor: "black" }}
              type="submit"
              disabled={loading}
            >
              Update Price
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