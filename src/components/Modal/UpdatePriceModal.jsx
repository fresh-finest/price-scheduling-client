import React, { useState, useContext, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import { updateProductPrice } from '../../api/amazonSellerAPI';


const UpdatePriceModal = ({ show, onClose, event }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [asin, setAsin] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [skus, setSkus] = useState([]);
  const originalPriceRef = useRef(null);


  useEffect(() => {
    if (show) {
      setAsin('');
      setSku('');
      setPrice('');
      setCurrentPrice(null);
      setStartDate(new Date());
      setEndDate(new Date());
      setSkus([]);
    }
  }, [show]);


  const fetchCurrentPrice = async (asin) => {
    try {
      const response = await fetch(`http://localhost:3000/product/${asin}`);
      const data = await response.json();
      const offers = data.payload[0].Product.Offers;
      setSkus(offers);
      // Default to the first offer
      if (offers.length > 0) {
        const firstOffer = offers[0];
        setSku(firstOffer.SellerSKU);
        setCurrentPrice(firstOffer.BuyingPrice.ListingPrice.Amount);
        originalPriceRef.current = firstOffer.BuyingPrice.ListingPrice.Amount;
      }
    } catch (error) {
      console.error('Error fetching current price:', error);
    }
  };


  const handleSkuChange = (e) => {
    const selectedSku = e.target.value;
    setSku(selectedSku);
    const selectedOffer = skus.find(offer => offer.SellerSKU === selectedSku);
    if (selectedOffer) {
      setCurrentPrice(selectedOffer.BuyingPrice.ListingPrice.Amount);
      originalPriceRef.current = selectedOffer.BuyingPrice.ListingPrice.Amount;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!originalPriceRef.current) {
        await fetchCurrentPrice(asin);
      }
      // await schedulePriceUpdate();
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


    if (delayStart > 0) {
      setTimeout(async () => {
        await updateProductPrice(sku, price);
      }, delayStart);
    } else {
      await updateProductPrice(sku, price);
    }


    if (delayEnd > 0) {
      setTimeout(async () => {
        await updateProductPrice(sku, originalPriceRef.current);
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
              <Form.Group controlId="formSku" style={modalStyles.formControl}>
                <Form.Label>Select SKU</Form.Label>
                <Form.Control as="select" value={sku} onChange={handleSkuChange} required>
                  {skus.map((offer, index) => (
                    <option key={index} value={offer.SellerSKU}>
                      {offer.SellerSKU}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group controlId="formCurrentPrice" style={modalStyles.formControl}>
                <Form.Label>Current Price</Form.Label>
                <Form.Control
                  type="text"
                  value={`$${currentPrice}`}
                  readOnly
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



