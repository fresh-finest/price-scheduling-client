import { useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./AutomatePrice.css";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { Checkbox, DatePicker, Space } from "antd";
import dayjs from "dayjs";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.109:3000";
const BASE_URL = `https://api.priceobo.com`;

const AutomatePrice = ({ sku, productDetails, product }) => {
  const [showModal, setShowModal] = useState(false);
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState(null);
  const [validateErrors, setValidateErrors] = useState(null);
  const [isDaySelected, setIsDaySelected] = useState(false);
  const [isHourSelected, setIsHourSelected] = useState(false);
  const [isAmountSelected, setIsAmountSelected] = useState(false);
  const [isPercentageSelected, setIsPercentageSelected] = useState(false);
  const [scheduleType, setScheduleType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [dayInput, setDayInput] = useState("");
  const [hourInput, setHourInput] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [percentageInput, setPercentageInput] = useState("");
  const [loading, setLoading] = useState(false);

  const { currentUser } = useSelector((state) => state.user);

  const handleCloseModal = () => {
    setShowModal(false);
    setMaxPriceInput(null);
    setMinPriceInput(null);
    setValidateErrors(null);
    setStartDate(null);
    setEndDate(null);
    setIsDaySelected(false);
    setIsHourSelected(false);
    setIsAmountSelected(false);
    setIsPercentageSelected(false);
    setScheduleType("");
    setDayInput("");
    setHourInput("");
    setAmountInput("");
    setPercentageInput("");
  };

  const productName = productDetails?.summaries[0]?.itemName;
  const productImage = productDetails?.summaries[0]?.mainImage?.link;

  const formattedStartDate = startDate?.format("YYYY-MM-DD");
  const formattedEndDate = endDate?.format("YYYY-MM-DD");

  const handleShowModal = () => {
    setShowModal(true);
  };

  // const handleMaxPriceChange = (e) => {
  //   const maxPrice = parseFloat(e.target.value);
  //   setMaxPriceInput(maxPrice);
  //   setValidateErrors(null);
  // };

  const handleMaxPriceChange = (e) => {
    const value = parseFloat(e.target.value);

    setMaxPriceInput(value);

    validateMaxPriceInput(value, minPriceInput);
  };
  // const handleMinPriceChange = (e) => {
  //   const minPrice = parseFloat(e.target.value);
  //   setMinPriceInput(minPrice);
  //   setValidateErrors(null);
  // };

  const handleMinPriceChange = (e) => {
    const value = parseFloat(e.target.value);

    setMinPriceInput(value);

    // Validate Min Price dynamically
    validateMinPriceInput(value, maxPriceInput);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  // const handleDayCheckbox = (e) => {
  //   setIsDaySelected(e.target.checked);
  //   setIsHourSelected(!e.target.checked);
  //   setHourInput("");
  //   if (!e.target.checked) setDayInput("");
  // };

  const handleDayCheckbox = (e) => {
    const isChecked = e.target.checked;
    setIsDaySelected(isChecked);
    setDayInput("");

    if (isChecked) {
      setIsHourSelected(false);
      setHourInput("");
    }
  };

  // const handleHourCheckbox = (e) => {
  //   setIsHourSelected(e.target.checked);
  //   setIsDaySelected(!e.target.checked);
  //   setDayInput("");
  //   if (!e.target.checked) setHourInput("");
  // };
  const handleHourCheckbox = (e) => {
    const isChecked = e.target.checked;
    setIsHourSelected(isChecked);
    setHourInput("");

    if (isChecked) {
      setIsDaySelected(false);
      setDayInput("");
    }
  };

  const validateMaxPriceInput = (maxPriceValue, minPriceValue) => {
    if (!maxPriceValue || parseFloat(maxPriceValue) <= 0) {
      setValidateErrors("Max price must be greater than 0.");
      return false;
    }

    if (
      minPriceValue &&
      parseFloat(maxPriceValue) <= parseFloat(minPriceValue)
    ) {
      setValidateErrors("Max price must be greater than Min price.");
      return false;
    }

    setValidateErrors(null); // Clear errors if valid
    return true;
  };

  const validateDayInput = (dayValue, start, end) => {
    const startDate = dayjs(start);
    const endDate = dayjs(end);

    if (!dayValue) {
      setValidateErrors(null);
      return true;
    }

    if (parseInt(dayValue) <= 0) {
      setValidateErrors("Day input must be greater than or equal 1.");
      return false;
    }

    if (startDate.isValid() && endDate.isValid() && dayValue) {
      const diffDays = endDate.diff(startDate, "day") + 1;

      if (parseInt(dayValue) > diffDays) {
        setValidateErrors(`Day input cannot exceed ${diffDays} days.`);
        return false;
      } else {
        setValidateErrors(null);
        return true;
      }
    }
    return false;
  };

  const validateMinPriceInput = (minPriceValue, maxPriceValue) => {
    if (!minPriceValue || parseFloat(minPriceValue) <= 0) {
      setValidateErrors("Min price must be greater than 0.");
      return false;
    }

    if (
      maxPriceValue &&
      parseFloat(minPriceValue) >= parseFloat(maxPriceValue)
    ) {
      setValidateErrors("Min price must be less than Max price.");
      return false;
    }

    setValidateErrors(null);
    return true;
  };

  const validateHourInput = (hourValue) => {
    if (!hourValue) {
      setValidateErrors(null);
      return true;
    }

    if (parseInt(hourValue) <= 0) {
      setValidateErrors("Hour input must be greater than 0.");
      return false;
    } else if (parseInt(hourValue) > 24) {
      setValidateErrors("Hour input cannot exceed 24 hours.");
      return false;
    } else {
      setValidateErrors(null);
      return true;
    }
  };
  const validatePercentageInput = (percentageValue) => {
    if (!percentageValue) {
      setValidateErrors(null);
      return true;
    }

    if (parseFloat(percentageValue) <= 0) {
      setValidateErrors("Percentage must be greater than 0");
      return false;
    }

    if (parseFloat(percentageValue) > 100) {
      setValidateErrors("Percentage cannot exceed 100");
      return false;
    }

    setValidateErrors(null);
    return true;
  };

  const validateAmountInput = (amountValue, minPrice, maxPrice) => {
    const priceDiff = maxPrice - minPrice;

    if (!amountValue) {
      setValidateErrors(null);
      return true;
    }

    if (parseFloat(amountValue) <= 0) {
      setValidateErrors("Amount must be greater than 0.");
      return false;
    }

    if (parseFloat(amountValue) > priceDiff) {
      setValidateErrors(`Amount cannot exceed ${priceDiff.toFixed(2)}`);
      return false;
    }

    setValidateErrors(null);
    return true;
  };

  const handleDayInputChange = (e) => {
    const value = e.target.value;

    setDayInput(value);

    validateDayInput(value, startDate, endDate);
  };

  const handleHourInputChange = (e) => {
    const value = e.target.value;

    setHourInput(value);
    validateHourInput(value);
  };

  const handleAmountInputChange = (e) => {
    const value = e.target.value;

    setAmountInput(value);

    validateAmountInput(
      value,
      parseFloat(minPriceInput),
      parseFloat(maxPriceInput)
    );
  };

  const handlePercentageInputChange = (e) => {
    const value = e.target.value;

    setPercentageInput(value);

    validatePercentageInput(value);
  };

  // const handleAmountCheckbox = (e) => {
  //   setIsAmountSelected(e.target.checked);
  //   setPercentageInput("");
  //   if (!isAmountSelected) setIsPercentageSelected(false);
  //   setIsPercentageSelected(!e.target.checked);
  //   if (!e.target.checked) setAmountInput("");
  // };

  const handleAmountCheckbox = (e) => {
    const isChecked = e.target.checked;
    setIsAmountSelected(isChecked);
    setAmountInput("");

    if (isChecked) {
      setIsPercentageSelected(false);
      setPercentageInput("");
    }
  };

  // const handlePercentageCheckbox = (e) => {
  //   setIsPercentageSelected(e.target.checked);
  //   setAmountInput("");
  //   setIsAmountSelected(!e.target.checked);
  //   if (!e.target.checked) setPercentageInput("");
  // };

  const handlePercentageCheckbox = (e) => {
    const isChecked = e.target.checked;
    setIsPercentageSelected(isChecked);
    setPercentageInput("");

    if (isChecked) {
      setIsAmountSelected(false);
      setAmountInput("");
    }
  };

  // const handleScheduleCheckbox = (type) => {
  //   if (type === "random") {
  //     setScheduleType("random");
  //     setAmountInput("");
  //     setPercentageInput("");
  //     setIsAmountSelected(false);
  //     setIsPercentageSelected(false);
  //   } else if (type === "increasing") {
  //     setScheduleType("increasing");
  //   } else if (type === "decreasing") {
  //     setScheduleType("decreasing");
  //   }
  // };

  const handleScheduleCheckbox = (type) => {
    if (scheduleType === type) {
      setScheduleType("");
      setAmountInput("");
      setPercentageInput("");
      setIsAmountSelected(false);
      setIsPercentageSelected(false);
    } else {
      setScheduleType(type);

      if (type === "random") {
        setAmountInput("");
        setPercentageInput("");
        setIsAmountSelected(false);
        setIsPercentageSelected(false);
        setValidateErrors(null);
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (validateErrors) {
      return;
    }
    if (!scheduleType) {
      setValidateErrors("Please select a schedule type.");
      return;
    }
    if (!dayInput?.toString().trim() && !hourInput?.toString().trim()) {
      setValidateErrors("Please select either day or hour.");
      return;
    }

    if (
      scheduleType !== "random" &&
      !amountInput?.toString().trim() &&
      !percentageInput?.toString().trim()
    ) {
      setValidateErrors("Please select either amount or percentage.");
      return;
    }

    const isValidMaxPrice = validateMaxPriceInput(maxPriceInput, minPriceInput);
    const isValidMinPrice = validateMinPriceInput(minPriceInput, maxPriceInput);

    const period = isDaySelected
      ? `${dayInput} ${parseInt(dayInput) > 1 ? "days" : "day"}`
      : isHourSelected
      ? `${hourInput} ${parseInt(hourInput) > 1 ? "hours" : "hour"}`
      : null;

    const rulePeriod = isDaySelected
      ? `${dayInput}${parseInt(dayInput) > 1 ? "days" : "day"}`
      : isHourSelected
      ? `${hourInput}${parseInt(hourInput) > 1 ? "hours" : "hour"}`
      : null;

    const pivot =
      isPercentageSelected && percentageInput
        ? `percentage`
        : isAmountSelected && amountInput
        ? `amount`
        : null;

    const rule =
      pivot !== null
        ? `${scheduleType}-${rulePeriod}-${pivot}`
        : `${scheduleType}-${rulePeriod}`;

    if (!isValidMaxPrice || !isValidMinPrice) return;

    if (!startDate || !endDate) {
      setValidateErrors("Please select both start and end dates.");
      return;
    }

    const payload = {
      sku: sku,
      title: productName,
      imageUrl: productImage,
      category: scheduleType,
      maxPrice: parseFloat(maxPriceInput.toFixed(2)),
      minPrice: parseFloat(minPriceInput.toFixed(2)),

      perchantage:
        isPercentageSelected && percentageInput
          ? parseFloat(percentageInput) / 100
          : null,

      amount: isAmountSelected && amountInput ? parseFloat(amountInput) : null,

      userName: currentUser.userName,

      interval: period,
      startAt: formattedStartDate,
      endAt: formattedEndDate,

      rule: rule,
    };

    try {
      setLoading(true);
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
        setLoading(false);
        handleCloseModal();
      } else {
        const errorData = await response.json();
        Swal.fire({
          title: "Something Went Wrong!",
          icon: "error",
          showConfirmButton: false,
          timer: 2000,
        });
        setLoading(false);
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
            <div className="flex justify-between gap-2">
              <DatePicker
                placeholder="Start date"
                value={startDate}
                onChange={handleStartDateChange}
                className="w-[50%] py-1.5"
                required
              />

              <DatePicker
                placeholder="End date"
                value={endDate}
                onChange={handleEndDateChange}
                className="w-[50%] py-1.5"
                required
              />
            </div>
            <div className="flex justify-between gap-2">
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
            </div>

            <div className="flex justify-between">
              <Checkbox
                checked={scheduleType === "random"}
                onChange={() => handleScheduleCheckbox("random")}
              >
                Random
              </Checkbox>
              <Checkbox
                checked={scheduleType === "increasing"}
                onChange={() => handleScheduleCheckbox("increasing")}
              >
                Increase
              </Checkbox>
              <Checkbox
                checked={scheduleType === "decreasing"}
                onChange={() => handleScheduleCheckbox("decreasing")}
              >
                Decrease
              </Checkbox>
            </div>

            <div className="flex  gap-2">
              <div>
                <div className="flex  items-center">
                  <Checkbox
                    checked={isDaySelected}
                    onChange={handleDayCheckbox}
                  >
                    Day
                  </Checkbox>

                  <Form.Control
                    className="update-custom-input mb-2"
                    type="number"
                    placeholder="Day"
                    value={dayInput}
                    // onChange={(e) => setDayInput(e.target.value)}
                    onChange={handleDayInputChange}
                    disabled={!isDaySelected}
                    required
                  />
                </div>
                <div className="flex  items-center">
                  <Checkbox
                    checked={isHourSelected}
                    onChange={handleHourCheckbox}
                  >
                    Hour
                  </Checkbox>

                  <Form.Control
                    className="update-custom-input mb-2"
                    type="number"
                    placeholder="Hour"
                    value={hourInput}
                    // onChange={(e) => setHourInput(e.target.value)}
                    onChange={handleHourInputChange}
                    disabled={!isHourSelected || isDaySelected}
                    required
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center">
                  <Checkbox
                    checked={isAmountSelected}
                    onChange={handleAmountCheckbox}
                    disabled={scheduleType === "random"}
                  >
                    Amount
                  </Checkbox>
                  <Form.Control
                    className="update-custom-input mb-2"
                    type="number"
                    placeholder="Amount"
                    value={amountInput}
                    // onChange={(e) => setAmountInput(e.target.value)}
                    onChange={handleAmountInputChange}
                    disabled={
                      !isAmountSelected ||
                      isPercentageSelected ||
                      scheduleType === "random"
                    }
                    required
                  />
                </div>
                <div className="flex items-center">
                  <Checkbox
                    checked={isPercentageSelected}
                    onChange={handlePercentageCheckbox}
                    disabled={scheduleType === "random"}
                  >
                    Percentage
                  </Checkbox>
                  <Form.Control
                    className="update-custom-input"
                    type="number"
                    placeholder="Percentage"
                    value={percentageInput}
                    // onChange={(e) => setPercentageInput(e.target.value)}
                    onChange={handlePercentageInputChange}
                    disabled={
                      !isPercentageSelected ||
                      isAmountSelected ||
                      scheduleType === "random"
                    }
                    required
                  />
                </div>
              </div>
            </div>

            {validateErrors && (
              <p className="text-red-500 text-sm text-center">
                {validateErrors}
              </p>
            )}

            <Button
              className="px-5 w-full"
              style={{
                backgroundColor: "#0B5ED7",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              disabled={loading}
              type="submit"
            >
              {loading ? "Loading.." : "Automate"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default AutomatePrice;
