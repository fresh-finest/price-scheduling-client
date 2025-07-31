import React, { useEffect, useState } from "react";
import { HiOutlineArrowNarrowRight, HiOutlinePlus } from "react-icons/hi";
import { Button, Form, InputGroup, Modal } from "react-bootstrap";
import "./AutomationDetailModal.css";
import { MdOutlineClose } from "react-icons/md";
import axios from "axios";
import { DateTime } from "luxon";
import { Checkbox, Tooltip } from "antd";
import { FiSave, FiTrash } from "react-icons/fi";
import Swal from "sweetalert2";
import { PenLine } from "lucide-react";
import { IoMdAdd } from "react-icons/io";
import { MdDataExploration } from "react-icons/md";
import { RxCross1 } from "react-icons/rx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import AddProductsInRuleModal from "./AddProductsInRulesModal/AddProductsInRuleModal";
import SaleDetailsModal from "../Report/SaleDetailsModal";

const BASE_URL = `https://api.priceobo.com`;
// const BASE_URL = `http://localhost:3000`;

const AutomationDetailModal = ({
  automationDetailModalShow,
  setAutomationDetailModalShow,
  handleAutomationDetailModalClose,
  editingRow,
  setEditingRow,
  editValues,
  setEditValues,
  ruleId,
  productData,
  setProductData,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [ruleData, setRuleData] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [singleProduct, setSingleProduct] = useState("");
  const [addProductsInRuleModalOpen, setAddProductsInRuleModalOpen] =
    useState(false);
  const [graphData, setGraphData] = useState([]);
  const [graphModalShow, setGraphModalShow] = useState(false);
  const [saleDetailsModalShow, setSaleDetailsModalShow] = useState(false);
  const [selectedSkuForSaleDetails, setSelectedSkuForSaleDetails] =
    useState("");

  const handleAddProductsInRuleModalOpen = () => {
    setAddProductsInRuleModalOpen(true);
  };
  const handleSaleDetailsModalShow = (sku) => {
    setSelectedSkuForSaleDetails(sku);
    setSaleDetailsModalShow(true);
  };
  const handleSaleDetailsModalClose = () => {
    setSaleDetailsModalShow(false);
  };

  console.log("product data", productData);
  const fetchGraphData = async (sku) => {
    const encodedSku = encodeURIComponent(sku);
    try {
      const response = await axios.get(`${BASE_URL}/auto-report/${encodedSku}`);

      const formattedData = response.data.result.map((item) => ({
        // executionDateTime: new Date(item.executionDateTime).toLocaleString(),
        executionDateTime: DateTime.fromISO(item.executionDateTime, {
          zone: "utc",
        })
          .setZone("America/New_York")
          .toFormat("MM/dd/yyyy hh:mm a"),
        // price: `$${parseFloat(item.randomPrice).toFixed(2)}`,
        price: item.randomPrice,
        unit: item.unitCount,
      }));
      setGraphData(formattedData);
      setGraphModalShow(true);

      await fetchActiveProduct(sku);
    } catch (error) {
      console.error("Error fetching graph data:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/automation/products/${ruleId}`
      );
      if (response.data.success) {
        setProductData(response.data.data.products);
        setRuleData(response.data.data.rule);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProduct = async (sku) => {
    const encodedSku = encodeURIComponent(sku);
    setLoading(true);
    try {
      const resposne = await axios.get(
        `${BASE_URL}/api/automation/active/${encodedSku}`
      );
      setSingleProduct(resposne.data.job);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (automationDetailModalShow) {
      fetchData();
    }
  }, [automationDetailModalShow]);
  console.log(("single product", singleProduct));
 
const trimmedSearchTerm = searchTerm.trim().toLowerCase();

const filteredProducts = productData.filter((data) =>
  data.title.toLowerCase().includes(trimmedSearchTerm) ||
  data.sku.toLowerCase().includes(trimmedSearchTerm)
);




  const cancelAutomationTag = async (sku) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/product/${sku}`);
      const product = res.data?.data?.listings?.[0];
      const tags = product?.tags || [];
      const automationTag = tags.find((tag) => tag.tag === "Automation");
      if (automationTag) {
        await axios.put(`${BASE_URL}/api/product/tag/${sku}/cancel`, {
          tag: automationTag.tag,
          colorCode: automationTag.colorCode,
        });
      }
    } catch (err) {
      console.error("Error cancelling Automation tag:", err);
    }
  };

  const deleteAutomation = async (ruleId, sku) => {
    const encodedSku = encodeURIComponent(sku);
    try {
      await cancelAutomationTag(sku);
      const response = await axios.delete(
        `${BASE_URL}/api/automation/products/${ruleId}/${encodedSku}/delete`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error deleting automation:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const handleDeleteAutomation = async (ruleId, sku) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeleteLoading(true);
        try {
          await deleteAutomation(ruleId, sku);

          Swal.fire({
            title: "Deleted!",
            text: "Product has been deleted.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
          setDeleteLoading(false);
          fetchData();
        } catch (error) {
          const errorMessage = error.response
            ? error.response.data.error
            : error.message;

          console.error("Error deleting schedule:", error);
          setDeleteLoading(false);
          Swal.fire({
            title: "Error!",
            text: `Failed to delete product: ${errorMessage}`,
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  const handleEditClick = (index, data) => {
    setEditingRow(index);
    setEditValues({
      maxPrice: data.maxPrice,
      minPrice: data.minPrice,
      sale: data.sale,
      targetQuantity: data.targetQuantity,
    });
  };

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };
  const handleCheckboxChange = (e) => {
    setEditValues({ ...editValues, sale: e.target.checked });
  };
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  const handleClearInput = () => {
    setSearchTerm("");
  };

  const handleSave = async (index, sku) => {
    const encodedSku = encodeURIComponent(sku);

    try {
      const response = await axios.put(
        `${BASE_URL}/api/automation/products/${ruleData.ruleId}/${encodedSku}/update`,
        {
          maxPrice: parseFloat(editValues.maxPrice),
          minPrice: parseFloat(editValues.minPrice),
          sale: editValues.sale,
          ...(["quantity-cycling", "age-by-day"].includes(
            ruleData.category
          ) && {
            targetQuantity: parseInt(editValues.targetQuantity),
          }),
        }
      );

      Swal.fire({
        title: "Updated!",
        text: "Product has been updated.",
        icon: "success",
        showConfirmButton: false,
        timer: 2000,
      });
      fetchData(); // Refresh data after save
      setEditingRow(null); // Exit edit mode
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire({
        title: "Error!",
        text: "Failed to save changes.",
        icon: "error",
        timer: 2000,
      });
    }
  };

  return (
    <div>
      <Modal
        show={automationDetailModalShow}
        onHide={handleAutomationDetailModalClose}
        // dialogClassName="automation-detail-modal"
        fullscreen={true}
      >
        <Modal.Body>
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
            onClick={handleAutomationDetailModalClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>

          <div className="flex items-center gap-3 mt-2">
            <Button
              onClick={handleAddProductsInRuleModalOpen}
              className="text-sm flex items-center gap-1"
              style={{
                padding: "8px 12px",
                border: "none",
                backgroundColor: "#0662BB",
                borderRadius: "3px",
              }}
            >
              <IoMdAdd className="text-[21px]" /> Add Product
            </Button>

            <InputGroup className="max-w-[500px]  ">
              <Form.Control
                type="text"
                placeholder="Search by Product title or Sku"
                value={searchTerm}
                onChange={handleSearch}
                style={{ borderRadius: "0px" }}
                className="custom-input"
              />
              {searchTerm && (
                <button
                  onClick={handleClearInput}
                  className="absolute right-2 top-1  p-1 z-10 text-xl rounded transition duration-500 text-black"
                >
                  <MdOutlineClose />
                </button>
              )}
            </InputGroup>
          </div>
          <div>
            <h4 className="text-center mb-2 ">{ruleData.ruleName}</h4>
            <p className="text-center ">
              <span
                style={{
                  marginRight: "0px",
                  backgroundColor: "#0661bba3",
                  color: "white",
                  padding: "2px 5px",
                  borderRadius: "3px",
                }}
              >
                {ruleData.category}
              </span>{" "}
              {ruleData.category !== "quantity-cycling" && (
                <>
                  <span
                    style={{
                      marginRight: "0px",
                      backgroundColor: "#0661bba3",
                      color: "white",
                      padding: "2px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {ruleData.interval}
                  </span>{" "}
                  <span
                    style={{
                      marginRight: "0px",
                      backgroundColor: "#0661bba3",
                      color: "white",
                      padding: "2px 5px",
                      borderRadius: "3px",
                    }}
                  >
                    {ruleData.amount
                      ? `$${ruleData.amount}`
                      : `${ruleData.percentage * 100}%`}
                  </span>
                </>
              )}
            </p>
          </div>
          <section
            style={{
              maxHeight: "91vh",
              overflowY: "auto",
              marginTop: "15px",
              // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <table
              style={{
                tableLayout: "auto",
                // tableLayout: "fixed",
                width: "100%",
              }}
              className="reportCustomTable table "
            >
              <thead
                style={{
                  backgroundColor: "#f0f0f0",

                  color: "#333",
                  fontFamily: "Arial, sans-serif",
                  fontSize: "14px",
                }}
              >
                <tr>
                  <th
                    className="tableHeader"
                    style={{
                      width: "10%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    Status
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: "8%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    Image
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: "25%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    Title
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: "12%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    Sku
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: "10%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    Max Price
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: "10%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    Min Price
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: "10%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    Sale Report
                  </th>
                  {["quantity-cycling", "age-by-day"].includes(
                    ruleData.category
                  ) && (
                    <th
                      className="tableHeader"
                      style={{
                        width: "10%",
                        textAlign: "center",
                        verticalAlign: "middle",
                        position: "sticky",
                        borderRight: "2px solid #C3C6D4",
                        zIndex: 10,
                      }}
                    >
                      Target Quantity
                    </th>
                  )}
                  <th
                    className="tableHeader"
                    style={{
                      width: "7.5%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      borderRight: "2px solid #C3C6D4",
                      zIndex: 10,
                    }}
                  >
                    On Change
                  </th>
                  <th
                    className="tableHeader"
                    style={{
                      width: "7.5%",
                      textAlign: "center",
                      verticalAlign: "middle",
                      position: "sticky",
                      zIndex: 10,
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody
                style={{
                  fontSize: "12px",
                  fontFamily: "Arial, sans-serif",
                  lineHeight: "1.5",
                }}
              >
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((data, index) => (
                    <tr
                      key={index}
                      style={{ opacity: data.status === "Inactive" ? 0.6 : 1 }}
                    >
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        {data.status}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        <img
                          className="w-[50px] mx-auto"
                          src={data.imageUrl}
                          alt="product"
                        />
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        <Tooltip title={data.title}>
                          <p>
                            {data.title.length > 70
                              ? data.title.slice(0, 70) + "..."
                              : data.title}
                          </p>
                        </Tooltip>
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        {data.sku}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        {editingRow === index ? (
                          <Form.Control
                            className="update-custom-input text-xs text-center"
                            type="number"
                            value={editValues.maxPrice}
                            onChange={(e) => handleInputChange(e, "maxPrice")}
                          />
                        ) : (
                          `$${parseFloat(data.maxPrice).toFixed(2)}`
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        {editingRow === index ? (
                          <Form.Control
                            className="update-custom-input text-xs text-center"
                            type="number"
                            value={editValues.minPrice}
                            onChange={(e) => handleInputChange(e, "minPrice")}
                          />
                        ) : (
                          `$${parseFloat(data.minPrice).toFixed(2)}`
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        <button
                          onClick={() => handleSaleDetailsModalShow(data.sku)}
                          className="bg-[#0662BB] text-white rounded   gap-1 relative pl-4 pr-6 pt-1 pb-0.5"
                        >
                          <span className="inline-block mb-1">
                            Sales Report
                          </span>
                          <span className="absolute top-[4.5px] right-1">
                            <HiOutlineArrowNarrowRight className="text-base" />
                          </span>
                        </button>
                      </td>
                      {["quantity-cycling", "age-by-day"].includes(
                        ruleData.category
                      ) && (
                        <td
                          style={{
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        >
                          {editingRow === index ? (
                            <Form.Control
                              className="update-custom-input text-xs text-center"
                              type="number"
                              value={editValues.targetQuantity}
                              onChange={(e) =>
                                handleInputChange(e, "targetQuantity")
                              }
                            />
                          ) : (
                            `${parseFloat(data.targetQuantity)}`
                          )}
                        </td>
                      )}
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        {editingRow === index ? (
                          <Checkbox
                            checked={editValues.sale}
                            onChange={handleCheckboxChange}
                          >
                            On Sale
                          </Checkbox>
                        ) : data.sale ? (
                          "Sale Price"
                        ) : (
                          "Your Price"
                        )}
                      </td>
                      <td
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          zIndex: 0,
                        }}
                      >
                        <div className="flex justify-center items-center">
                          {editingRow === index ? (
                            <button
                              className="bg-[#0662BB] py-1 px-2 rounded-md text-white mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleSave(index, data.sku)}
                              disabled={ruleData.mute}
                            >
                              <FiSave size={20} />
                            </button>
                          ) : (
                            <button
                              className="bg-[#0662BB] py-1 px-2 rounded-md mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleEditClick(index, data)}
                              disabled={ruleData.mute}
                            >
                              <PenLine size={20} className="text-white" />
                            </button>
                          )}
                          <Button
                            onClick={() =>
                              handleDeleteAutomation(ruleData.ruleId, data.sku)
                            }
                            variant="danger"
                            size="md"
                          >
                            <FiTrash />
                          </Button>
                          <Button
                            variant="info"
                            style={{ marginLeft: "5px" }}
                            onClick={() => fetchGraphData(data.sku)}
                          >
                            <MdDataExploration />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      style={{ textAlign: "center", padding: "20px" }}
                    >
                      No Products Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </Modal.Body>
      </Modal>

      <AddProductsInRuleModal
        addProductsInRuleModalOpen={addProductsInRuleModalOpen}
        setAddProductsInRuleModalOpen={setAddProductsInRuleModalOpen}
        ruleId={ruleId}
        ruleType={ruleData.category}
      ></AddProductsInRuleModal>

      <Modal
        show={graphModalShow}
        onHide={() => setGraphModalShow(false)}
        dialogClassName="automation-detail-modal"
        style={{ marginLeft: "200px" }}
      >
        <Modal.Body>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              onClick={() => setGraphModalShow(false)}
              className="mt-2 bg-white"
              style={{
                border: "none",
                display: "flex",
                alignItems: "center",
                padding: "5px",
              }}
            >
              <RxCross1
                style={{
                  backgroundColor: "white",
                  color: "black",
                  fontSize: "20px",
                }}
              />
            </Button>
          </div>
          <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
            <div style={{ flex: 1, display: "flex" }}>
              <img
                src={singleProduct.imageUrl}
                style={{ height: "40px" }}
                alt=""
              />
              <p style={{ marginLeft: "20px", marginTop: "10px" }}>
                {singleProduct.sku}
              </p>
            </div>
            <p>{singleProduct?.title}</p>
            {/* <p >
              {singleProduct?.title
                ? singleProduct.title.slice(0, 170) +
                  (singleProduct.title.length > 170 ? "..." : "")
                : "N/A"}
            </p> */}
          </div>
          <h4 className="text-center mb-2">
            Price & Unit Count vs Execution Time
          </h4>
          <ResponsiveContainer marginLeft="10px" width="100%" height={320}>
            <LineChart data={graphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="executionDateTime"
                angle={-50}
                textAnchor="end"
                tick={{ fontSize: 12 }}
                height={100}
              />
              <YAxis
                yAxisId="left"
                label={{
                  value: "Price",
                  angle: -90,
                  position: "insideLeft",
                }}
                tickFormatter={(tick) => `$${tick.toFixed(2)}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "Unit", angle: -90, position: "insideRight" }}
              />
              <RechartsTooltip
                formatter={(value, name) => {
                  return name === "price"
                    ? [`$${parseFloat(value).toFixed(2)}`, "Price"]
                    : [value, "Unit"];
                }}
              />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="price"
                stroke="#d41a23"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="unit"
                stroke="#1a73e8"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Modal.Body>
      </Modal>
      <SaleDetailsModal
        saleDetailsModalShow={saleDetailsModalShow}
        setSaleDetailsModalShow={setSaleDetailsModalShow}
        handleSaleDetailsModalShow={handleSaleDetailsModalShow}
        handleSaleDetailsModalClose={handleSaleDetailsModalClose}
        sku={selectedSkuForSaleDetails}
      ></SaleDetailsModal>
    </div>
  );
};

export default AutomationDetailModal;