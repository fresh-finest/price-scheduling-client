import React, { useState, useContext, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import axios from 'axios';

const BASE_URL = 'https://price-scheduling-server-2.onrender.com';

const updateProductPrice = async (sku, value) => {
  try {
    console.log(`Updating price for SKU: ${sku} with value: ${value}`);
    const response = await axios.patch(`${BASE_URL}/product/${sku}/price`, { value });
    console.log('Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating product price:', error.response ? error.response.data : error.message);
    throw error;
  }
};

const UpdatePriceModal = ({ show, onClose, event }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [asin, setAsin] = useState('');
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [skus, setSkus] = useState([]);
  const originalPriceRef = useRef(null);

  useEffect(() => {
    if (show) {
      setAsin('');
      setPrice('');
      setCurrentPrice(null);
      setStartDate(new Date());
      setEndDate(new Date());
      setSkus([]);
    }
  }, [show]);

  const fetchCurrentPrice = async (asin) => {
    try {
      const response = await fetch(`${BASE_URL}/product/${asin}`);
      const data = await response.json();
      const offers = data.payload[0].Product.Offers;
      setSkus(offers);
      if (offers.length > 0) {
        const firstOffer = offers[0];
        setCurrentPrice(firstOffer.BuyingPrice.ListingPrice.Amount);
        originalPriceRef.current = firstOffer.BuyingPrice.ListingPrice.Amount;
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!originalPriceRef.current) {
        await fetchCurrentPrice(asin);
      }
      await schedulePriceUpdate();
      skus.forEach((offer) => {
        addEvent({
          title: `SKU: ${offer.SellerSKU} - $${price}`,
          start: startDate,
          end: endDate,
          allDay: false,
        });
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

    const updateAllSkus = async (newPrice) => {
      await Promise.all(skus.map(async (offer) => {
        try {
          await updateProductPrice(offer.SellerSKU, newPrice);
        } catch (error) {
          console.error(`Error updating SKU ${offer.SellerSKU}:`, error.response ? error.response.data : error.message);
        }
      }));
    };

    if (delayStart > 0) {
      setTimeout(async () => {
        await updateAllSkus(price);
      }, delayStart);
    } else {
      await updateAllSkus(price);
    }

    if (delayEnd > 0) {
      setTimeout(async () => {
        await updateAllSkus(originalPriceRef.current);
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
          <Form.Group controlId="formAsin" style={modalStyles.formControl}>
            <Form.Label>ASIN</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter ASIN"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" onClick={() => fetchCurrentPrice(asin)} style={{ marginBottom: '15px' }}>
            Fetch Current Price and SKUs
          </Button>
          {skus.length > 0 && (
            <>
              <Form.Group controlId="formCurrentPrice" style={modalStyles.formControl}>
                <Form.Label>Current Price</Form.Label>
                <Form.Control
                  type="text"
                  value={`$${currentPrice}`}
                  readOnly
                />
              </Form.Group>
              <Form.Group controlId="formSkuList" style={modalStyles.formControl}>
                <Form.Label>SKUs</Form.Label>
                <Form.Control
                  as="textarea"
                  value={skus.map((offer) => offer.SellerSKU).join('\n')}
                  readOnly
                  rows={skus.length}
                />
              </Form.Group>
            </>
          )}
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

export default UpdatePriceModal;
