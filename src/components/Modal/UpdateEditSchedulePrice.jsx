import React, { useState, useContext, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import axios from "axios";
import { useSelector } from "react-redux";

const BASE_URL = "https://api.priceobo.com";
// const BASE_URL = "http://localhost:3000";

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

const updateProductPrice = async (sku, value) => {
  try {
    const response = await axios.patch(`${BASE_URL}/product/${sku}/price`, {
      value: parseFloat(value),
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error updating product price:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const saveSchedule = async (
  userName,
  asin,
  sku,
  title,
  price,
  currentPrice,
  imageURL,
  startDate,
  endDate
) => {
  try {
    const response = await axios.post(`${BASE_URL}/api/schedule`, {
      userName,
      asin,
      sku,
      title,
      price: parseFloat(price),
      currentPrice,
      imageURL,
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error saving schedule:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
};

const UpdatePrice = ({ show, onClose }) => {
  const { addEvent } = useContext(PriceScheduleContext);
  const [asin, setAsin] = useState("");
  const [sku, setSku] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [indefiniteEndDate, setIndefiniteEndDate] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [startTimerId, setStartTimerId] = useState(null);
  const [endTimerId, setEndTimerId] = useState(null);

  const [title, setTitle] = useState("");
  const [imageURL, setImageUrl] = useState("");
  const { currentUser } = useSelector((state) => state.user);
  const userName = currentUser.userName;

  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show]);

  const resetForm = () => {
    setAsin("");
    setSku("");
    setCurrentPrice("");
    setPrice("");
    setStartDate(new Date());
    setEndDate(new Date());
    setIndefiniteEndDate(false);
    setSuccessMessage("");
    setErrorMessage("");
    if (startTimerId) clearTimeout(startTimerId);
    if (endTimerId) clearTimeout(endTimerId);
  };

  const handleAsinChange = async (e) => {
    const asinValue = e.target.value;
    setAsin(asinValue);
    if (asinValue) {
      try {
        const data = await fetchProductDetails(asinValue);
        const productDetails = data.payload[0].Product.Offers[0];
        setSku(productDetails.SellerSKU);
        setCurrentPrice(productDetails.BuyingPrice.ListingPrice.Amount);

        const additionalData = await fetchProductAdditionalDetails(asinValue);
        setTitle(additionalData.payload.AttributeSets[0].Title);
        setImageUrl(additionalData.payload.AttributeSets[0].SmallImage.URL);
      } catch (error) {
        setErrorMessage(
          "Error fetching product details: " +
            (error.response ? error.response.data.error : error.message)
        );
        console.error("Error fetching product details:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Schedule the price update and store the timer IDs
      const { startTimer, endTimer } = await schedulePriceUpdate(
        sku,
        currentPrice,
        price,
        startDate,
        indefiniteEndDate ? null : endDate
      );

      // Store timer IDs in state for potential future cancellation
      setStartTimerId(startTimer);
      setEndTimerId(endTimer);

      // Log the scheduling in MongoDB
      await saveSchedule(
        userName,
        asin,
        sku,
        title,
        price,
        currentPrice,
        imageURL,
        startDate,
        indefiniteEndDate ? null : endDate
      );

      // Add event to the context
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
      console.error("Error scheduling price update:", error);
    }
  };

  const schedulePriceUpdate = async (
    sku,
    originalPrice,
    newPrice,
    startDate,
    endDate
  ) => {
    const now = new Date();
    const delayStart = startDate - now;
    const delayEnd = endDate ? endDate - now : null;
    let startTimer = null;
    let endTimer = null;

    // Schedule the price update at the start date
    if (delayStart > 0) {
      startTimer = setTimeout(async () => {
        try {
          await updateProductPrice(sku, newPrice);
        } catch (error) {
          console.error("Error updating to new price:", error);
        }
      }, delayStart);
    } else {
      try {
        await updateProductPrice(sku, newPrice);
      } catch (error) {
        console.error("Error updating to new price:", error);
      }
    }

    // Schedule the price revert at the end date if endDate is provided
    if (endDate && delayEnd > 0) {
      endTimer = setTimeout(async () => {
        try {
          await updateProductPrice(sku, originalPrice);
        } catch (error) {
          console.error("Error reverting to original price:", error);
        }
      }, delayEnd);
    }

    return { startTimer, endTimer };
  };

  const handleCancel = () => {
    if (startTimerId) clearTimeout(startTimerId);
    if (endTimerId) clearTimeout(endTimerId);
    setSuccessMessage(`Price update for SKU ${sku} has been canceled.`);
    onClose();
  };

  const modalStyles = {
    formControl: {
      marginBottom: "15px",
    },
    button: {
      width: "100%",
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
            <Form.Group
              controlId="formCurrentPrice"
              style={modalStyles.formControl}
            >
              <Form.Label>Current Price: ${currentPrice}</Form.Label>
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
            <Form.Group
              controlId="formStartDate"
              style={modalStyles.formControl}
            >
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
            <Form.Group
              controlId="formIndefiniteEndDate"
              style={modalStyles.formControl}
            >
              <Form.Check
                type="checkbox"
                label="Until I change it."
                checked={indefiniteEndDate}
                onChange={() => setIndefiniteEndDate(!indefiniteEndDate)}
              />
            </Form.Group>
            {!indefiniteEndDate && (
              <Form.Group
                controlId="formEndDate"
                style={modalStyles.formControl}
              >
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
            <Button variant="primary" type="submit" style={modalStyles.button}>
              Schedule Price Update
            </Button>
          </Form>
          <Button
            variant="danger"
            onClick={handleCancel}
            style={{ ...modalStyles.button, marginTop: "15px" }}
          >
            Cancel Price Update
          </Button>
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
