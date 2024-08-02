import React, { useEffect, useRef, useState } from 'react'
import {Form, Button, Modal } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function UpdatePriceModal({ show, onClose, event }) {
  
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