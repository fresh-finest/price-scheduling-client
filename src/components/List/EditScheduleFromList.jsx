import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import axios from 'axios';
import { useSelector } from 'react-redux';

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

const fetchProductAdditionalDetails = async (asin) => {
  try {
    const response = await axios.get(`${BASE_URL}/details/${asin}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching additional product details:', error.response ? error.response.data : error.message);
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

const deleteSchedule = async (scheduleId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/api/schedule/${scheduleId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting schedule:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const updateSchedule = async (scheduleId, startDate, endDate, userName) => {
  try {
    const response = await axios.put(`${BASE_URL}/api/schedule/${scheduleId}`, {
      startDate,
      endDate,
      userName,
      firstChange: false
    });
    return response.data;
  } catch (error) {
    console.error('Error updating schedule:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const EditScheduleFromList = ({ show, onClose, asin, existingSchedule }) => {
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
  const [scheduleId, setScheduleId] = useState('');
  const [title, setTitle] = useState('');
  const [imageURL, setImageUrl] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // State for confirmation modal

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser.userName;

  console.log("data:" + existingSchedule.endDate);
  useEffect(() => {
    if (show && existingSchedule) {
      setStartDate(new Date(existingSchedule.startDate));
      setEndDate(existingSchedule.endDate ? new Date(existingSchedule.endDate) : new Date());
      setIndefiniteEndDate(!existingSchedule.endDate);
    }
  }, [show, existingSchedule]);

  useEffect(() => {
    if (show && asin) {
      fetchProductDetailsByAsin(asin);
      setPrice(existingSchedule.price);
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
      setErrorMessage('Error fetching product details: ' + (error.response ? error.response.data.error : error.message));
      console.error('Error fetching product details:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schedulePriceUpdate(sku, currentPrice, price, startDate, indefiniteEndDate ? null : endDate);

      await updateSchedule(existingSchedule._id, startDate, indefiniteEndDate ? null : endDate, userName);

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
      console.error('Error scheduling price update:', error);
    }
  };

  const schedulePriceUpdate = async (sku, originalPrice, newPrice, startDate, endDate) => {
    const now = new Date();
    const delayStart = startDate - now;

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

    if (endDate) {
      const delayEnd = endDate - now;
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
    }
  };

  const handleDelete = async () => {
    try {
      await deleteSchedule(existingSchedule._id);
      setSuccessMessage(`Schedule deleted successfully for SKU: ${sku}`);
      setShowSuccessModal(true);
      onClose();
    } catch (error) {
      setErrorMessage('Error deleting schedule: ' + (error.response ? error.response.data.error : error.message));
      console.error('Error deleting schedule:', error);
    }
  };

  const handleShowConfirmation = () => {
    setShowConfirmationModal(true);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmationModal(false);
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
            <Form.Group controlId="formCurrentPrice" style={{ marginBottom: '15px' }}>
              <Form.Label>Current Price: ${currentPrice}</Form.Label>
            </Form.Group>
            <Form.Group controlId="formPrice" style={{ marginBottom: '15px' }}>
              <Form.Label>Changed to : {existingSchedule.price}</Form.Label>
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
            <Button style={{ width: "40%", backgroundColor: "black" }} type="submit">
              Update Price
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
