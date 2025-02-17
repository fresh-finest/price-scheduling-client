import { Button, Form, Modal } from "react-bootstrap";
import "./AutomationEditModal.css";
import { MdOutlineClose } from "react-icons/md";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Swal from "sweetalert2";


// const BASE_URL = `https://api.priceobo.com`;
const BASE_URL = `http://localhost:3000`;

const AutomationEditModal = ({
  automationEditModalShow,
  handleAutomationEditModalClose,
  ruleId,
  automationDetailData,
  setAutomationDetailData,
}) => {
  const [automationDeatailLoading, setAutomationDetailLoading] =
    useState(false);

  const [intervalValue, setIntervalValue] = useState("");
  const [intervalUnit, setIntervalUnit] = useState("");

  const [valueType, setValueType] = useState("");
  const [valueInput, setValueInput] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  console.log("auto",automationDetailData);
  const fetchData = async () => {
    setAutomationDetailLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/automation/rules/${ruleId}`
      );
      if (response.data) {
        console.log("automation detail data response", response.data.rules);
        // setProductData(response.data.data.products);
        // setRuleData(response.data.data.rule);
        setAutomationDetailData(response.data.rules);
        setAutomationDetailLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      // setError(error.message);
      setAutomationDetailLoading(false);
    } finally {
      setAutomationDetailLoading(false);
    }
  };

  useEffect(() => {
    if (automationEditModalShow) {
      fetchData();
    }
  }, [automationEditModalShow]);

  useEffect(() => {
    if (automationDetailData.interval) {
      const [value, unit] = automationDetailData.interval.split(" ");
      setIntervalValue(value);

      const normalizedUnit = unit.toLowerCase().endsWith("s")
        ? unit.slice(0, -1)
        : unit;

      setIntervalUnit(normalizedUnit);
    }

    if (automationDetailData.amount !== null) {
      setValueType("amount");
      setValueInput(automationDetailData.amount);
    } else if (automationDetailData.percentage !== null) {
      setValueType("percentage");
      setValueInput(automationDetailData.percentage * 100);
    }

    if (automationDetailData.category) {
      setCategory(automationDetailData.category);
    }

    if (automationDetailData.ruleName) {
      setRuleName(automationDetailData.ruleName);
    }
  }, [automationDetailData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const intervalFormatted = `${intervalValue} ${
        intervalValue > 1 ? intervalUnit + "s" : intervalUnit
      }`;

      const payload = {
        ruleName,
        category,
        interval: intervalFormatted,
        amount: valueType === "amount" ? parseFloat(valueInput) : null,
        percentage:
          valueType === "percentage" ? parseFloat(valueInput) / 100 : null,
      };

      console.log("Payload:", payload);

      // PUT request
      const response = await axios.put(
        `${BASE_URL}/api/automation/rules/${ruleId}/update`,
        payload
      );

      console.log("Update response:", response.data);

      if (response.status === 200) {
        Swal.fire({
          title: "Rule updated successfully!",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
        });
        handleAutomationEditModalClose();
      }
    } catch (error) {
      console.error("Error updating rule:", error);

      Swal.fire({
        title: "Something Went Wrong!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Modal
        show={automationEditModalShow}
        onHide={handleAutomationEditModalClose}
        dialogClassName="automation-edit-modal"
      >
        <Modal.Body>
          <div>
            <h2 className="text-center text-xl font-semibold">Edit Rules</h2>
          </div>
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
            onClick={handleAutomationEditModalClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>

          <Form onSubmit={handleSubmit} className="mt-2 space-y-2">
            <Form.Control
              className="update-custom-input"
              type="text"
              name="sku"
              value={automationDetailData.ruleId}
              disabled
              placeholder="Rule ID"
            />
            <Form.Control
              className="update-custom-input"
              type="text"
              name="sku"
              value={ruleName}
              // onValueChange={(value) => setRuleName(value)}
              onChange={(e) => setRuleName(e.target.value)}
              placeholder="Rule Name"
            />

            <Select
              value={category}
              onValueChange={(value) => setCategory(value)}
            >
              <SelectTrigger className="w-full my-2">
                <SelectValue placeholder="Rule Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="random">Random</SelectItem>
                  <SelectItem value="increasing">Increasing and Stop</SelectItem>
                  <SelectItem value="decreasing">Decreasing and Stop</SelectItem>
                  <SelectItem value="increasingRepeat">Increasing and Repeat</SelectItem>
                  <SelectItem value="decreasingRepeat">Decreasing and Repeat</SelectItem>
                  <SelectItem value="increasing-cycling">Increasing Cycle</SelectItem>
                  <SelectItem value= "decreasing-cycling">Decreasing Cycle</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="mt-2 flex justify-between gap-2">
              <Select
                value={intervalUnit}
                onValueChange={(value) => setIntervalUnit(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Day/Hour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="hour">Hour</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Form.Control
                className="update-custom-input"
                type="number"
                step="0.01"
                name="sku"
                value={intervalValue}
                onChange={(e) => setIntervalValue(e.target.value)}
                placeholder="Value"
              />
            </div>

            <div className="mt-2 flex justify-between gap-2">
              <Select
                value={valueType}
                onValueChange={(value) => setValueType(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Amount/Percentage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Form.Control
                className="update-custom-input"
                type="number"
                name="valueInput"
                value={valueInput}
                step="0.01"
                onChange={(e) => setValueInput(e.target.value)}
                placeholder="Value"
              />
            </div>

            <div className="mt-2 flex justify-end">
              <Button
                className="text-sm flex items-center gap-1 "
                style={{
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "#0662BB",
                  borderRadius: "3px",
                }}
                disabled={loading}
                type="submit"
              >
                {loading ? "Loading.." : "Submit"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AutomationEditModal;