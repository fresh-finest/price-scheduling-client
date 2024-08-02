import React, { useContext, useEffect, useRef, useState } from 'react'
import {Form, Button, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
function UpdatePriceModal({ show, onClose, event }) {

  const {addEvents} = useContext(PriceScheduleContext);
  const[asin,setAsin] = useState('');
  const [sku,setSku]= useState('');
  const [price,setPrice] = useState('');
  const [currentPrice,setCurrentPrice] = useState(null);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [skus,setSkus] = useState([]);
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

  const handleSkuChange = (e)=>{
    const selectedSku = e.target.value();
    setSku(selectedSku);
    const selectedOffer = skus.find(offer=>offer.SellerSKU === selectedSku);
    if(selectedOffer){
      setCurrentPrice(selectedOffer.BuyingPrice.ListingPrice.Amount);
      originalPriceRef.current = selectedOffer.BuyingPrice.ListingPrice.Amount;
    }
  }

  const handleSubmit = async (e)=>{
    e.preventDefault();
    try {
      if(!originalPriceRef.current){
        await fetchCurrentPrice(aisn); 
      }
      // call schedule Price update
      addEvent({
        title: `SKU: ${sku} - $${price}`,
        start: startDate,
        end: endDate,
        allDay: false,
      });
      onClose();

    } catch (error) {
      console.error("Error updating price:",error);
    }
  }

  return (
    <div><Modal show={show} onHide={onClose}>
    <Modal.Header closeButton>
      <Modal.Title>Update Scheduled Price</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form >
        <Form.Group>
          <Form.Label>ASIN</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter ASIN"
            value=""
           
            required
          />
        </Form.Group>
        <Button variant="primary" style={{ marginBottom: '15px',marginTop:"10px" }}>
          Search by ASIN
        </Button>
       
        <Form.Group style={{marginBottom:"5px"}} >
          <Form.Label>New Price</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter Price"
            value=""
          
            required
          />
        </Form.Group>
        <Form.Group >
          <Form.Label style={{marginRight:"5px"}}>Start Date and Time</Form.Label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="form-control"
            required
          />
        </Form.Group>
        <Form.Group >
          <Form.Label style={{marginRight:"11px"}}>End Date and Time</Form.Label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            showTimeSelect
            dateFormat="Pp"
            className="form-control"
            required
          />
        </Form.Group>
        <Button variant="primary" type="submit" style={{ marginBottom: '15px',marginTop:"10px" }} >
          Schedule Price Update
        </Button>
      </Form>
    </Modal.Body>
  </Modal></div>
  )
}

export default UpdatePriceModal