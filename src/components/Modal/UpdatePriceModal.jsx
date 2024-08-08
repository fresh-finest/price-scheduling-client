import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import axios from 'axios';

const BASE_URL = 'https://price-scheduling-server-2.onrender.com';

const fetchProductDetails = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/product/${asin}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product details:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const updateProductPrice = async (sku, value) => {
  try {
    const response = await axios.patch(`${BASE_URL}/product/${sku}/price`, { value: parseFloat(value) });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating product price:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const saveSchedule = async (sku, price, startDate, endDate) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/schedule`, { sku, price: parseFloat(price), startDate, endDate });
    return response.data;
  } catch (error) {
    console.error('Error saving schedule:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const UpdatePrice = ({ show, onClose }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [asin, setAsin] = useState('');
  const [sku, setSku] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (show) {
      setAsin('');
      setSku('');
      setCurrentPrice('');
      setPrice('');
      setStartDate(new Date());
      setEndDate(new Date());
      setSuccessMessage('');
      setErrorMessage('');
    }
  }, [show]);

  const handleAsinChange = async (e) => {
    const asinValue = e.target.value;
    setAsin(asinValue);
    if (asinValue) {
      try {
        const data = await fetchProductDetails(asinValue);
        const productDetails = data.payload[0].Product.Offers[0];
        setSku(productDetails.SellerSKU);
        setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);
      } catch (error) {
        setErrorMessage('Error fetching product details: ' + (error.response ? error.response.data.error : error.message));
        console.error('Error fetching product details:', error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // First, update the product price immediately
      await updateProductPrice(sku, currentPrice);

      // Save the schedule
      const scheduleResponse = await saveSchedule(sku, price, startDate, endDate);

      // Schedule the price update and the revert to original price
      const now = new Date();
      const delayStart = startDate - now;
      const delayEnd = endDate - now;

      const updateSku = async (newPrice) => {
        try {
          await updateProductPrice(sku, newPrice);
        } catch (error) {
          console.error(`Error updating SKU ${sku}:`, error.response ? error.response.data : error.message);
        }
      };

      if (delayStart > 0) {
        setTimeout(() => {
          updateSku(price);
        }, delayStart);
      } else {
        await updateSku(price);
      }

      if (delayEnd > 0) {
        setTimeout(() => {
          updateSku(currentPrice);
        }, delayEnd);
      }

      // Add event to the context
      addEvent({
        title: `SKU: ${sku} - $${price}`,
        start: startDate,
        end: endDate,
        allDay: false,
      });

      // Set success message
      setSuccessMessage(`Price update accepted. SKU: ${scheduleResponse.sku}, Submission ID: ${scheduleResponse.submissionId}`);

      // Show success modal
      setShowSuccessModal(true);

      // Close the main modal
      onClose();
    } catch (error) {
      setErrorMessage('Error updating price: ' + (error.response ? error.response.data.error : error.message));
      console.error('Error updating price:', error);
    }
  };

  const modalStyles = {
    formControl: {
      marginBottom: '15px',
    },
    button: {
      width: '100%',
    },
  };

  return (
    <>
      <Modal show={show} onHide={onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Scheduled Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
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
            {/* <Form.Group controlId="formSku" style={modalStyles.formControl}>
              <Form.Label>SKU</Form.Label>
              <Form.Control
                type="text"
                placeholder="SKU will be auto-filled"
                value={sku}
                readOnly
              />
            </Form.Group> */}
            <Form.Group controlId="formCurrentPrice" style={modalStyles.formControl}>
              <Form.Label>Current Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Current price will be auto-filled"
                value={currentPrice}
                readOnly
              />
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
            <Form.Group controlId="formStartDate" style={modalStyles.formControl}>
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
            <Form.Group controlId="formEndDate" style={modalStyles.formControl}>
              <Form.Label>End Date and Time</Form.Label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" style={modalStyles.button}>
              Schedule Price Update
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

export default UpdatePrice;
