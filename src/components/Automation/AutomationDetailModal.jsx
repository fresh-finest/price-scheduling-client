import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
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
  const [singleProduct, setSingleProduct] = useState("");
  const [addProductsInRuleModalOpen, setAddProductsInRuleModalOpen] =
    useState(false);
  const [graphData, setGraphData] = useState([]);
  const [graphModalShow, setGraphModalShow] = useState(false);

  const handleAddProductsInRuleModalOpen = () => {
    setAddProductsInRuleModalOpen(true);
  };
  // const [editingRow, setEditingRow] = useState(null);
  // const [editValues, setEditValues] = useState({});

  const fetchGraphData = async (sku) => {
    try {
      const response = await axios.get(`${BASE_URL}/auto-report/${sku}`);

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
    setLoading(true);
    try {
      const resposne = await axios.get(
        `${BASE_URL}/api/automation/active/${sku}`
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
  const deleteAutomation = async (ruleId, sku) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/automation/products/${ruleId}/${sku}/delete`
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

  const handleSave = async (index, sku) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/automation/products/${ruleData.ruleId}/${sku}/update`,
        {
          maxPrice: parseFloat(editValues.maxPrice),
          minPrice: parseFloat(editValues.minPrice),
          sale: editValues.sale,
          ...(ruleData.category === "quantity-cycling" && {
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
        dialogClassName="automation-detail-modal"
      >
        <Modal.Body>
          <button
            className="px-2 py-1 hover:bg-gray-200 rounded-md transition-all duration-200 absolute right-1 top-1"
            onClick={handleAutomationDetailModalClose}
          >
            <MdOutlineClose className="text-xl" />
          </button>

          <Button
            onClick={handleAddProductsInRuleModalOpen}
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
          <table
            style={{
              tableLayout: "fixed",
            }}
            className="reportCustomTable table mt-2"
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
                    width: "70px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Status
                </th>
                <th
                  className="tableHeader"
                  style={{
                    width: "100px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Image
                </th>
                <th
                  className="tableHeader"
                  style={{
                    width: "320px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Title
                </th>
                <th
                  className="tableHeader"
                  style={{
                    width: "130px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Sku
                </th>
                <th
                  className="tableHeader"
                  style={{
                    width: "130px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Max Price
                </th>

                <th
                  className="tableHeader"
                  style={{
                    width: "130px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Min Price
                </th>
                {ruleData.category === "quantity-cycling" && (
                  <th
                    className="tableHeader"
                    style={{
                      width: "130px",
                      position: "sticky",
                      textAlign: "center",
                      verticalAlign: "middle",
                      borderRight: "2px solid #C3C6D4",
                    }}
                  >
                    Target Quantity
                  </th>
                )}

                <th
                  className="tableHeader"
                  style={{
                    width: "130px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  On Change
                </th>
                <th
                  className="tableHeader"
                  style={{
                    width: "150px",
                    position: "sticky",
                    textAlign: "center",
                    verticalAlign: "middle",
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
              {productData.length > 0 ? (
                productData.map((data, index) => {
                  return (
                    <tr
                      key={index}
                      className={
                        data.status === "Inactive" ? "inactive-row" : ""
                      }
                      style={{
                        opacity: data.status === "Inactive" ? 0.6 : 1,
                      }}
                    >
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {data.status}
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <img
                          className="w-[50px] mx-auto "
                          src={data.imageUrl}
                          alt="product image"
                        />
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <Tooltip placement="bottom" title={data.title}>
                          <p>{data.title}</p>
                        </Tooltip>
                      </td>
                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {data.sku}
                      </td>

                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
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
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
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
                      {ruleData.category === "quantity-cycling" && (
                        <td
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            height: "40px",
                            textAlign: "center",
                            verticalAlign: "middle",
                          }}
                        > {editingRow === index ? (
                          <Form.Control
                            className="update-custom-input text-xs text-center"
                            type="number"
                            value={editValues.targetQuantity}
                            onChange={(e) =>
                              handleInputChange(e, "targetQuantity")
                            }
                          />  ) : (
                          `${parseFloat(data.targetQuantity)}`
                        )}
                        </td>
                      )}

                      <td
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {/* {data.sale ? "Sale Price" : "Your Price"} */}

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
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        <div className="flex justify-center items-center">
                          {editingRow === index ? (
                            <button
                              // className="bg-[#0662BB] py-1 px-2 rounded-md text-white mr-1 "
                              className="bg-[#0662BB] py-1 px-2 rounded-md text-white mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleSave(index, data.sku)}
                              disabled={ruleData.mute}
                            >
                              <FiSave size={20} />
                            </button>
                          ) : (
                            <button
                              // className="bg-[#0662BB] py-1 px-2 rounded-md mr-1"
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
                          {/* <Button
                            // className="bg-[#0662BB] py-1 px-2 rounded-md text-white mr-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ marginLeft: "5px" }}
                            variant="info"
                            onClick={() => fetchGraphData(data.sku)}
                          >
                            <MdDataExploration />
                          </Button> */}
                        </div>
                      </td>
                      <td></td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
    </div>
  );
};

export default AutomationDetailModal;
