import React, { useState, useContext, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

const updateProductPrice = async (sku, value) => {
  try {
    console.log(`Updating price for SKU: ${sku} with value: ${value}`);
    const response = await axios.patch(`${BASE_URL}/product/${sku}/price`, { value: parseFloat(value) });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating product price:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const UpdatePrice = ({ show, onClose }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    if (show) {
      setSku('');
      setPrice('');
      setStartDate(new Date());
      setEndDate(new Date());
    }
  }, [show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await schedulePriceUpdate();
      addEvent({
        title: `SKU: ${sku} - $${price}`,
        start: startDate,
        end: endDate,
        allDay: false,
      });
      onClose();
    } catch (error) {
      console.error('Error updating price:', error);
    }
  };

  const schedulePriceUpdate = async () => {
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
        updateSku(price); // Assuming you want to update to the new price even at the end
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
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Update Scheduled Price</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formSku" style={modalStyles.formControl}>
            <Form.Label>SKU</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group controlId="formPrice" style={modalStyles.formControl}>
            <Form.Label>New Price</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter Price"
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
  );
};

export default UpdatePrice;
