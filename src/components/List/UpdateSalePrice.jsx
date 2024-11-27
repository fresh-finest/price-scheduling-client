import axios from "axios";
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import Swal from "sweetalert2";

// const BASE_URL = "http://192.168.0.152:3000";
const BASE_URL = "https://api.priceobo.com";
// const BASE_URL = "http://localhost:3000";

function UpdateSalePrice({ sku1, onClose, saleInformation }) {
  const [sku, setSku] = useState("");
  const [value, setValue] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (sku1) {
      setSku(sku1);
    }
    if (saleInformation) {
      setValue(saleInformation.value_with_tax);
      setStartDate(new Date(saleInformation.start_at));
      setEndDate(new Date(saleInformation.end_at));
    }
  }, [sku1, saleInformation]);

  const validateFields = () => {
    const newErrors = {};

    if (!value) {
      newErrors.value = "Price is required.";
    }

    if (!startDate || isNaN(startDate.getTime())) {
      newErrors.startDate = "Start date is required.";
    }

    if (!endDate || isNaN(endDate.getTime())) {
      newErrors.endDate = "End date is required.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSalePriceSubmit = async () => {
    if (!validateFields()) {
      return;
    }

    const payload = {
      sku,
      value: parseFloat(value),
      startDate,
      endDate,
    };

    try {
      setLoading(true);
      await axios.patch(`${BASE_URL}/sale-price`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      Swal.fire({
        title: "Successfully Created Sale Price!",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      onClose();
    } catch (error) {
      setMessage(
        `Error: ${error.response?.data?.message || "Something went wrong."}`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes and clear field-specific errors
  const handleValueChange = (e) => {
    setValue(e.target.value);
    if (errors.value) {
      setErrors((prevErrors) => ({ ...prevErrors, value: null }));
    }
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
    if (errors.startDate) {
      setErrors((prevErrors) => ({ ...prevErrors, startDate: null }));
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    if (errors.endDate) {
      setErrors((prevErrors) => ({ ...prevErrors, endDate: null }));
    }
  };

  return (
    <>
      <div
        onClick={(e) => e.stopPropagation()}
        className="mb-3 mx-auto bg-[#F1F1F2] px-4 pt-1 pb-2 rounded-sm shadow-sm"
      >
        <div className="mt-4">
          <div className="mb-3 flex gap-2">
            <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm w-[40%]">
              <h2 className="text-black">SKU </h2>
            </div>
            <input
              type="text"
              id="sku"
              className="form-control update-custom-input"
              value={sku}
              disabled
            />
          </div>

          <div className="mb-3 flex gap-2">
            <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm w-[40%]">
              <h2 className="text-black">Price </h2>
            </div>
            <div className="w-full">
              <input
                type="number"
                id="price"
                className="form-control update-custom-input"
                step="0.01"
                defaultValue={saleInformation?.value_with_tax}
                onChange={handleValueChange}
              />
              {errors.value && (
                <span className="text-red-400 ">{errors.value}</span>
              )}
            </div>
          </div>

          <div className="mb-3 flex gap-2">
            <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm w-[40%]">
              <h2 className="text-black">Start Date</h2>
            </div>
            <div className="w-full">
              <div className="flex flex-col">
                <DatePicker
                  selected={startDate}
                  onChange={handleStartDateChange}
                  className="form-control update-custom-input"
                  required
                />
                {errors.startDate && (
                  <span className="text-red-400">{errors.startDate}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-3 flex gap-2">
            <div className="bg-[#DCDCDC] flex justify-center items-center rounded-sm w-[40%]">
              <h2 className="text-black">End Date</h2>
            </div>
            <div className="w-full">
              <div className="flex flex-col">
                <DatePicker
                  selected={endDate}
                  onChange={handleEndDateChange}
                  className="form-control update-custom-input"
                  required
                />
                {errors.endDate && (
                  <span className="text-red-400">{errors.endDate}</span>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <Button
              style={{
                width: "20%",
                backgroundColor: "#0662BB",
                margin: "0 auto",
                display: "block",
                position: "absolute",
                bottom: 22,
                right: 30,
              }}
              disabled={loading}
            >
              Loading...
            </Button>
          ) : (
            <Button
              style={{
                width: "20%",
                backgroundColor: "#0662BB",
                margin: "0 auto",
                display: "block",
                position: "absolute",
                bottom: 22,
                right: 30,
              }}
              onClick={handleSalePriceSubmit}
              disabled={loading}
            >
              Update Sale Price
            </Button>
          )}
        </div>
        {message && (
          <div
            className={`alert mt-4 ${
              message.startsWith("Success") ? "alert-success" : "alert-danger"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </>
  );
}

export default UpdateSalePrice;