import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import axios from 'axios';

const BASE_URL = 'https://dps-server-b829cf5871b7.herokuapp.com';

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
    console.log(`Attempting to update price for SKU: ${sku} to value: ${value}`);
    const response = await axios.patch(`${BASE_URL}/product/${sku}/price`, { value: parseFloat(value) });
    console.log('Update response:', response.data);

    if (response.data.issues && response.data.issues.length > 0) {
      console.warn('Price update issues:', response.data.issues);
    }

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

const UpdatePriceFromList = ({ show, onClose, asin }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [sku, setSku] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (show && asin) {
      resetForm();
      fetchProductDetailsByAsin(asin);
    }
  }, [show, asin]);

  const resetForm = () => {
    setSku('');
    setCurrentPrice('');
    setPrice('');
    setStartDate(new Date());
    setEndDate(new Date());
    setSuccessMessage('');
    setErrorMessage('');
  };

  const fetchProductDetailsByAsin = async (asin) => {
    try {
      const data = await fetchProductDetails(asin);
      const productDetails = data.payload[0].Product.Offers[0];
      setSku(productDetails.SellerSKU);
      setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);
    } catch (error) {
      setErrorMessage('Error fetching product details: ' + (error.response ? error.response.data.error : error.message));
      console.error('Error fetching product details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schedulePriceUpdate(sku, currentPrice, price, startDate, endDate);

      const scheduleResponse = await saveSchedule(sku, price, startDate, endDate);

      addEvent({
        title: `SKU: ${sku} - $${price}`,
        start: startDate,
        end: endDate,
        allDay: false,
      });

      setSuccessMessage(`Price update scheduled successfully for SKU: ${sku}`);
      setShowSuccessModal(true);
      onClose();
    } catch (error) {
      setErrorMessage('Error scheduling price update: ' + (error.response ? error.response.data.error : error.message));
      console.error('Error scheduling price update:', error);
    }
  };

  const schedulePriceUpdate = async (sku, originalPrice, newPrice, startDate, endDate) => {
    const now = new Date();
    const delayStart = startDate - now;
    const delayEnd = endDate - now;

    if (delayStart > 0) {
      setTimeout(async () => {
        try {
          console.log("Price is getting updated.");
          await updateProductPrice(sku, newPrice);
          console.log(`Price updated to ${newPrice} for SKU ${sku} at ${new Date().toLocaleString()}`);
        } catch (error) {
          console.error('Error updating to new price:', error);
        }
      }, delayStart);
    } else {
      try {
        await updateProductPrice(sku, newPrice);
        console.log(`Price updated to ${newPrice} immediately for SKU ${sku}`);
      } catch (error) {
        console.error('Error updating to new price:', error);
      }
    }

    if (delayEnd > 0) {
      setTimeout(async () => {
        try {
          console.log("Price is getting reverted...");
          await updateProductPrice(sku, originalPrice);
          console.log(`Price reverted to ${originalPrice} for SKU ${sku} at ${new Date().toLocaleString()}`);
        } catch (error) {
          console.error('Error reverting to original price:', error);
        }
      }, delayEnd);
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
          <Modal.Title>Update Schedule Price</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formCurrentPrice" style={modalStyles.formControl}>
              <Form.Label>ASIN: {asin}</Form.Label>
              {/* <Form.Control
                type="text"
                placeholder="Current price will be auto-filled"
                value={asin}
                readOnly
              /> */}
            </Form.Group>
            <Form.Group controlId="formCurrentPrice" style={modalStyles.formControl}>
              <Form.Label>Current Price: ${currentPrice}</Form.Label>
              {/* <Form.Control
                type="number"
                placeholder="Current price will be auto-filled"
                value={currentPrice}
                readOnly
              /> */}
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
              <Form.Label>Start Date and Time </Form.Label>
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
              <Form.Label>End Date and Time </Form.Label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                showTimeSelect
                dateFormat="Pp"
                className="form-control"
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
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

export default UpdatePriceFromList;