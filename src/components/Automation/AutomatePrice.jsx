import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./AutomatePrice.css";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import axios from "axios";
import { Checkbox } from "antd";

// const BASE_URL = "http://localhost:3000";

const BASE_URL = `https://api.priceobo.com`;

const AutomatePrice = ({ sku, productDetails }) => {
  const [showModal, setShowModal] = useState(false);
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [minPriceInput, setMinPriceInput] = useState(null);
  const [saleChecked, setSaleChecked] = useState(false);
  const [validateErrors, setValidateErrors] = useState(null);
  const [isDaySelected, setIsDaySelected] = useState(false);
  const [isHourSelected, setIsHourSelected] = useState(false);
  const [isAmountSelected, setIsAmountSelected] = useState(false);
  const [isPercentageSelected, setIsPercentageSelected] = useState(false);
  const [scheduleType, setScheduleType] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [automationRules, setAutomationRules] = useState([]);
  const [error, setError] = useState("");
  const [selectedRule, setSelectedRule] = useState("");
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
    setSelectedRule("");
    setSaleChecked(false);
  };

  const handleRuleChange = (value) => {
    setSelectedRule(value);
  };

  const fetchData = async () => {
    // setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/automation/rules`);
      console.log("automation rules", response.data.rules);
      if (response.data) {
        setLoading(false);
        setAutomationRules(response.data.rules);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
      // setLoading(false);
    } finally {
      // setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal) {
      fetchData();
    }
  }, [showModal]);

  const productName =
    productDetails?.summaries?.[0]?.itemName || "Unknown Product";
  const productImage =
    productDetails?.summaries?.[0]?.mainImage?.link ||
    "https://via.placeholder.com/150";

  const formattedStartDate = startDate?.format("YYYY-MM-DD");
  const formattedEndDate = endDate?.format("YYYY-MM-DD");

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleSaleCheckboxChange = (e) => {
    setSaleChecked(e.target.checked);
  };

  const handleMaxPriceChange = (e) => {
    const value = parseFloat(e.target.value);

    setMaxPriceInput(value);

    validateMaxPriceInput(value, minPriceInput);
  };

  const handleMinPriceChange = (e) => {
    const value = parseFloat(e.target.value);

    setMinPriceInput(value);

    // Validate Min Price dynamically
    validateMinPriceInput(value, maxPriceInput);
  };

  const validateMaxPriceInput = (maxPriceValue, minPriceValue) => {
    if (!maxPriceValue || parseFloat(maxPriceValue) <= 0) {
      setValidateErrors("Max price must be greater than 0.");
      return false;
    }

    if (
      minPriceValue &&
      parseFloat(maxPriceValue) < parseFloat(minPriceValue)
    ) {
      setValidateErrors("Max price must be greater than Min price.");
      return false;
    }

    setValidateErrors(null); // Clear errors if valid
    return true;
  };

  const validateMinPriceInput = (minPriceValue, maxPriceValue) => {
    if (!minPriceValue || parseFloat(minPriceValue) <= 0) {
      setValidateErrors("Min price must be greater than 0.");
      return false;
    }

    if (
      maxPriceValue &&
      parseFloat(minPriceValue) > parseFloat(maxPriceValue)
    ) {
      setValidateErrors("Min price must be less than Max price.");
      return false;
    }

    setValidateErrors(null);
    return true;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (validateErrors) {
      return;
    }

    const isValidMaxPrice = validateMaxPriceInput(maxPriceInput, minPriceInput);
    const isValidMinPrice = validateMinPriceInput(minPriceInput, maxPriceInput);

    if (!isValidMaxPrice || !isValidMinPrice) return;

    console.log("selected rule", selectedRule);
    // if (!selectedRule) {
    //   setValidateErrors("Please Select an Automation Rule.");
    //   return;
    // }

    const payload = {
      products: [
        {
          sku: sku,
          title: productName,
          imageUrl: productImage,

          maxPrice: parseFloat(maxPriceInput.toFixed(2)),
          minPrice: parseFloat(minPriceInput.toFixed(2)),
          sale: saleChecked,
        },
      ],
      hitAutoPricing: true,
    };

    console.log("payload", payload);

    try {
      setLoading(true);
      const response = await fetch(
        `${BASE_URL}/api/automation/rules/${selectedRule}/products`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

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

  console.log(saleChecked);

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

            <div className="">
              <Select onValueChange={handleRuleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an Automation Rule" />
                </SelectTrigger>
                <SelectContent>
                  {automationRules.map((rule, index) => (
                    <SelectItem key={index} value={rule.ruleId}>
                      {rule.ruleName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-1">
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
              <div>
                <Checkbox onChange={handleSaleCheckboxChange}>
                  Sale Price
                </Checkbox>
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
