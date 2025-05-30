import React, { useState } from "react";
import { Button, ButtonGroup, Form, Modal } from "react-bootstrap";
import { GoLaw } from "react-icons/go";
import { IoMdAdd } from "react-icons/io";
import { MdOutlineClose } from "react-icons/md";
import "./CreateRuleFrom.css";
import { useForm } from "react-hook-form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AutomationSelectProductModal from "../AutomationSelectProductModal/AutomationSelectProductModal";
import axios from "axios";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { IoCloseOutline } from "react-icons/io5";
import { Checkbox } from "antd";

const BASE_URL = `https://api.priceobo.com`;
// const BASE_URL = `http://192.168.0.15:3000`;
// const BASE_URL = "http://192.168.0.26:3000";

const CreateRuleForm = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onSubmit", // Validation mode
  });

  const [ruleFormOpen, setRuleFormOpen] = useState(false);
  const [timeType, setTimeType] = useState("");
  const [unitType, setUnitType] = useState("");
  const [selectProductModalOpen, setSelectProductModalOpen] = useState(false);
  const [searchedProducts, setSearchedProducts] = useState("");
  const [searchingError, setSearchingError] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [finalSelectedProducts, setFinalSelectedProducts] = useState([]);
  const [targetQuantity, setTargetQuantity] = useState("");

  const [loading, setLoading] = useState(false);
  const [saleChecked, setSaleChecked] = useState(false);
  const { currentUser } = useSelector((state) => state.user);

  const isQuantityCycling = watch("ruleType") === "quantity-cycling";
  const isQuantityTarget = watch("ruleType") === "age-by-day";
  const requiresTargetQuantity = isQuantityCycling;
  const handleRuleFormClose = () => {
    reset();
    setRuleFormOpen(false);
    setTimeType("");
    setUnitType("");
    setFinalSelectedProducts([]);
    setSaleChecked(false);
  };
  const handleRuleFormOpen = () => {
    setRuleFormOpen(true);
  };
  const handleSelectProductModalOpen = () => {
    setSelectProductModalOpen(true);
  };
  const handleSelectProductModalClose = () => {
    setSelectProductModalOpen(false);
    setSearchedProducts("");
    setSelectedProducts([]);
  };

  const handleAddSelectedProducts = (products) => {
    setFinalSelectedProducts((prevProducts) => {
      const mergedProducts = [...prevProducts]; // Clone existing products

      // Add only unique products to avoid duplicates
      products.forEach((product) => {
        if (!mergedProducts.some((p) => p.sellerSku === product.sellerSku)) {
          mergedProducts.push(product);
        }
      });

      return mergedProducts;
    });

    setSelectProductModalOpen(false);
    setSelectedProducts([]);
    setSearchedProducts("");
  };

  const handleRemoveProduct = (sku) => {
    const updatedProducts = finalSelectedProducts.filter(
      (product) => product.sellerSku !== sku
    );
    setFinalSelectedProducts(updatedProducts); // Update the state
  };

  const handleSaleCheckboxChange = (e) => {
    setSaleChecked(e.target.checked);
  };

  console.log("final selected products", finalSelectedProducts);

  const onSubmit = async (data) => {
    const { ruleName, ruleType, timeType, timeValue, unitType, unitValue } =
      data;
    // const parsedUnitValue = parseFloat(unitValue);

    // const interval = `${timeValue} ${timeType}`;
    // const interval = `${timeValue} ${timeType}${timeValue > 1 ? "s" : ""}`;
   const interval = isQuantityCycling
  ? "30 minutes"
  : isQuantityTarget
  ? "1 day"
  : `${timeValue} ${timeType}${timeValue > 1 ? "s" : ""}`;

    const products = finalSelectedProducts.map((product) => {
      return {
        sku: product.sellerSku,
        title: product.itemName,
        imageUrl: product.imageUrl,
        maxPrice: parseFloat(
          document.getElementById(`maxPrice-${product.sellerSku}`).value
        ),
        minPrice: parseFloat(
          document.getElementById(`minPrice-${product.sellerSku}`).value
        ),
        sale: saleChecked,
        // targetQuantity: requiresTargetQuantity
        //   ? parseInt(
        //       document.getElementById(`targetQuantity-${product.sellerSku}`)
        //         .value
        //     )
        //   : 1,

          targetQuantity:
  (requiresTargetQuantity || isQuantityTarget)
    ? parseInt(
        document.getElementById(`targetQuantity-${product.sellerSku}`).value
      )
    : 1,

      };
    });
    setLoading(true);

    // const parsedUnitValue = parseFloat(unitValue);
    // const percentageValue =
    //   unitType === "percentage" ? parsedUnitValue / 100 : null;
    // const amountValue = unitType === "amount" ? parsedUnitValue : null;
    const parsedUnitValue = isQuantityCycling ? 0 : parseFloat(unitValue);
    const percentageValue =
      !isQuantityCycling && unitType === "percentage"
        ? parsedUnitValue / 100
        : null;
    const amountValue =
      !isQuantityCycling && unitType === "amount" ? parsedUnitValue : null;

    const payload = {
      rule: {
        ruleName,
        category: ruleType,
        percentage: percentageValue,
        amount: amountValue,
        interval,
        userName: currentUser.userName,
      },
      products,
      hitAutoPricing: true,
    };

    console.log("Payload:", payload);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/automation/rules-with-products`,
        payload
      );

      setRuleFormOpen(false);
      Swal.fire({
        title: "Successfully Created Automation rules!",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });

      console.log("Rule created successfully:", response.data);
    } catch (error) {
      Swal.fire({
        title: "Something Went Wrong!",
        icon: "error",
        showConfirmButton: false,
        timer: 2000,
      });
      console.error("Error creating rule:", error);
    } finally {
      // Set loading to false once the request completes (success or failure)
      setLoading(false);
    }
  };

  console.log("final selected products", finalSelectedProducts);

  return (
    <div className="mb-2">
      <Button
        onClick={handleRuleFormOpen}
        className="text-sm flex items-center gap-1 "
        style={{
          padding: "8px 12px",
          border: "none",
          backgroundColor: "#0662BB",
          borderRadius: "3px",
        }}
      >
        <IoMdAdd className="text-[21px]" /> Create Rule
      </Button>

      <Modal
        show={ruleFormOpen}
        onHide={handleRuleFormClose}
        dialogClassName="create-rule-modal"
      >
        <Modal.Body>
          <div>
            <h2 className="text-center text-xl font-semibold">Create Rules</h2>
          </div>
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
            onClick={handleRuleFormClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>

          <form className="mt-3" onSubmit={handleSubmit(onSubmit)}>
            <div className="">
              <Form.Control
                {...register("ruleName", { required: true })}
                className="update-custom-input "
                type="text"
                placeholder="Rule Name"
              />
              {errors.ruleName && (
                <p className="text-red-500 ">Rule Name is required</p>
              )}
            </div>

            <div className="mt-2">
              <Select
                onValueChange={(value) => {
                  setValue("ruleType", value); // Update form value
                  trigger("ruleType"); // Trigger validation
                }}
                {...register("ruleType", { required: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Rule Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="increasing">
                      Increasing and Stop
                    </SelectItem>
                    <SelectItem value="decreasing">
                      Decreasing and Stop
                    </SelectItem>
                    <SelectItem value="increasingRepeat">
                      Increasing and Repeat
                    </SelectItem>
                    <SelectItem value="decreasingRepeat">
                      Decreasing and Repeat
                    </SelectItem>
                    <SelectItem value="increasing-cycling">
                      Increasing Cycle
                    </SelectItem>
                    <SelectItem value="decreasing-cycling">
                      Decreasing Cycle
                    </SelectItem>
                    <SelectItem value="quantity-cycling">
                      Quantity Cycle
                    </SelectItem>
                    <SelectItem value="age-by-day">Quantity Target</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              {errors.ruleType && (
                <p className="text-red-500 ">Rule Type is required</p>
              )}
            </div>
            {!["quantity-cycling", "age-by-day"].includes(
              watch("ruleType")
            ) && (
              <div className="mt-2 flex justify-between gap-2">
                <Select
                  onValueChange={(value) => {
                    setValue("timeType", value);
                    setTimeType(value);
                    trigger("timeType");
                  }}
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

                <input
                  type="hidden"
                  step="0.01"
                  {...register("timeType", {
                    required: "Day/Hour selection is required",
                  })}
                />

                {errors.timeType && (
                  <p className="text-red-500">{errors.timeType.message}</p>
                )}

                {timeType && (
                  <div className="w-full">
                    <Form.Control
                      {...register("timeValue", {
                        required: `${
                          timeType === "day"
                            ? "Day value is required"
                            : "Hour value is required"
                        }`,
                        min: {
                          value: 1,
                          message: "Value must be greater than 0",
                        },
                      })}
                      className="update-custom-input"
                      type="number"
                      step="0.01"
                      placeholder={timeType === "day" ? "Days" : "Hours"}
                    />

                    {errors.timeValue && (
                      <p className="text-red-500">{errors.timeValue.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            {!["quantity-cycling", "age-by-day"].includes(
              watch("ruleType")
            ) && (
              <div className="mt-2 flex justify-between gap-2">
                <Select
                  onValueChange={(value) => {
                    setValue("unitType", value);
                    setUnitType(value);
                    trigger("unitType");
                  }}
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

                <input
                  step="0.01"
                  type="hidden"
                  {...register("unitType", {
                    required: "Amount/Percentage selection is required",
                  })}
                />

                {errors.unitType && (
                  <p className="text-red-500">{errors.unitType.message}</p>
                )}

                {unitType && (
                  <div className="w-full">
                    <Form.Control
                      {...register("unitValue", {
                        required: `${
                          unitType === "amount"
                            ? "amount value is required"
                            : "percentage value is required"
                        }`,
                        validate: (value) =>
                          value > 0 || "Value must be greater than 0",
                      })}
                      className="update-custom-input"
                      type="number"
                      step="0.01"
                      placeholder={
                        unitType === "amount" ? "Amount" : "Percentage"
                      }
                    />

                    {errors.unitValue && (
                      <p className="text-red-500">{errors.unitValue.message}</p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div>
              <Button
                onClick={handleSelectProductModalOpen}
                className="text-sm flex items-center gap-1 mt-2"
                style={{
                  padding: "8px 12px",
                  border: "none",
                  backgroundColor: "#0662BB",
                  borderRadius: "3px",
                }}
              >
                <IoMdAdd className="text-[21px]" /> Add Product
              </Button>
            </div>

            <div className="my-2">
              {finalSelectedProducts.map((product, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 py-2 border-b  border-gray-200"
                >
                  <img
                    src={product.imageUrl}
                    className="w-[40px] h-[50px] object-cover rounded"
                    alt="product image"
                  />

                  <h4 className="w-[20%] text-sm font-medium truncate">
                    {product.itemName.split(" ").length > 5
                      ? product.itemName.split(" ").slice(0, 5).join(" ") +
                        "..."
                      : product.itemName}
                  </h4>

                  <span className="px-2 text-xs text-white py-1 rounded-sm bg-[#3B82F6]">
                    ${product.price}
                  </span>

                  <h3 className="w-[15%] text-sm text-gray-700">
                    {product.sellerSku}
                  </h3>

                  <Form.Control
                    id={`maxPrice-${product.sellerSku}`}
                    type="number"
                    step="0.01"
                    className="w-[15%] px-2 py-1  update-custom-input"
                    placeholder="Max Price"
                  />

                  <Form.Control
                    id={`minPrice-${product.sellerSku}`}
                    type="number"
                    step="0.01"
                    className="w-[15%] px-2 py-1 update-custom-input"
                    placeholder="Min Price"
                  />
               {(requiresTargetQuantity  || isQuantityTarget) && (
                    <Form.Control
                      id={`targetQuantity-${product.sellerSku}`}
                      type="number"
                      step="1"
                      min="1"
                      className="w-[15%] px-2 py-1 update-custom-input"
                      placeholder="Target Qty"
                    />
                  )}
                  <Checkbox
                    className="w-[15%]"
                    onChange={handleSaleCheckboxChange}
                  >
                    On Sale
                  </Checkbox>

                  <IoCloseOutline
                    onClick={() => handleRemoveProduct(product.sellerSku)}
                    className="text-2xl cursor-pointer text-gray-500 hover:text-gray-600"
                  />
                </div>
              ))}
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
          </form>
        </Modal.Body>
      </Modal>

      <AutomationSelectProductModal
        selectProductModalOpen={selectProductModalOpen}
        handleSelectProductModalClose={handleSelectProductModalClose}
        searchedProducts={searchedProducts}
        setSearchedProducts={setSearchedProducts}
        searchingError={searchingError}
        setSearchingError={setSearchingError}
        setSelectedProducts={setSelectedProducts}
        selectedProducts={selectedProducts}
        handleAddSelectedProducts={handleAddSelectedProducts}
      ></AutomationSelectProductModal>
    </div>
  );
};

export default CreateRuleForm;