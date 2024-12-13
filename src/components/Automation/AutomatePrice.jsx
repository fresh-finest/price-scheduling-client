import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./AutomatePrice.css";
import Swal from "sweetalert2";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.141:3000";
const BASE_URL = `https://api.priceobo.com`;


const AutomatePrice = ({ sku }) => {
  const [showModal, setShowModal] = useState(false);
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState(null);
  const [validateErrors, setValidateErrors] = useState(null);

  const handleCloseModal = () => {
    setShowModal(false);
    setMaxPriceInput(null);
    setMinPriceInput(null);
    setValidateErrors(null);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleMaxPriceChange = (e) => {
    const maxPrice = parseFloat(e.target.value);
    setMaxPriceInput(maxPrice);
    setValidateErrors(null);
  };
  const handleMinPriceChange = (e) => {
    const minPrice = parseFloat(e.target.value);
    setMinPriceInput(minPrice);
    setValidateErrors(null);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!maxPriceInput || !minPriceInput) {
      setValidateErrors("Please fill in both max and min prices.");
      return;
    }

    if (parseFloat(minPriceInput) >= parseFloat(maxPriceInput)) {
      setValidateErrors("Min price should be less than max price.");
      return;
    }

    const payload = {
      sku,

      maxPrice: parseFloat(maxPriceInput.toFixed(2)),
      minPrice: parseFloat(minPriceInput.toFixed(2)),
    };

    try {
      const response = await fetch(`${BASE_URL}/auto-pricing`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        Swal.fire({
          title: "Successfully Created Automation Price!",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
        });
        setMaxPriceInput(null);
        setMinPriceInput(null);
        handleCloseModal();
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: "Something Went Wrong!",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
      }
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <>
      <div className="ml-[-7%]">
        <Button onClick={handleShowModal} className="bg-[#0662BB] text-white">
          Automate
        </Button>
      </div>
      <Modal
        dialogClassName="automate-price-modal"
        show={showModal}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Automation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form className="space-y-3" onSubmit={handleFormSubmit}>
            <Form.Control
              className="update-custom-input"
              type="text"
              name="sku"
              value={sku}
              disabled
              placeholder="SKU"
            />
            <Form.Control
              type="number"
              className="update-custom-input"
              defaultValue={maxPriceInput}
              onChange={handleMaxPriceChange}
              placeholder="Max Price"
              step="0.01"
              required
            />
            <Form.Control
              type="text"
              className="update-custom-input"
              defaultValue={minPriceInput}
              onChange={handleMinPriceChange}
              placeholder="Min Price"
              step="0.01"
              required
            />
            {validateErrors && (
              <p className="text-red-500 text-sm">{validateErrors}</p>
            )}

            <Button
              className="px-5 w-full"
              style={{
                backgroundColor: "#0B5ED7",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              type="submit"
            >
              Update Schedule
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AutomatePrice;