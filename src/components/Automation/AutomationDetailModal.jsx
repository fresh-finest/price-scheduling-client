import React, { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import "./AutomationDetailModal.css";
import { MdOutlineClose } from "react-icons/md";
import axios from "axios";
import { Checkbox, Tooltip } from "antd";
import { FiSave, FiTrash } from "react-icons/fi";
import Swal from "sweetalert2";
import { PenLine } from "lucide-react";
import { IoMdAdd } from "react-icons/io";
import AddProductsInRuleModal from "./AddProductsInRulesModal/AddProductsInRuleModal";

const BASE_URL = `https://api.priceobo.com`;

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
  const [addProductsInRuleModalOpen, setAddProductsInRuleModalOpen] =
    useState(false);

  const handleAddProductsInRuleModalOpen = () => {
    setAddProductsInRuleModalOpen(true);
  };
  // const [editingRow, setEditingRow] = useState(null);
  // const [editValues, setEditValues] = useState({});

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

  useEffect(() => {
    if (automationDetailModalShow) {
      fetchData();
    }
  }, [automationDetailModalShow]);

  const deleteAutomation = async (ruleId, sku) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/automation/products/${ruleId}/${sku}/delete`
      );
      console.log("delete response", response.data);
      console.log("rule id", ruleId);
      console.log("sku", sku);
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
    });
  };

  const handleInputChange = (e, field) => {
    setEditValues({ ...editValues, [field]: e.target.value });
  };
  const handleCheckboxChange = (e) => {
    setEditValues({ ...editValues, sale: e.target.checked });
  };

  console.log("edit values", editValues);

  const handleSave = async (index, sku) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/automation/products/${ruleData.ruleId}/${sku}/update`,
        {
          maxPrice: parseFloat(editValues.maxPrice),
          minPrice: parseFloat(editValues.minPrice),
          sale: editValues.sale,
        }
      );
      console.log("Save response:", response.data);
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

  console.log("product data", productData);

  return (
    <div>
      <Modal
        show={automationDetailModalShow}
        onHide={handleAutomationDetailModalClose}
        fullscreen={true}
        // dialogClassName="automation-detail-modal"
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
          <section
        style={{
          maxHeight: "91vh",
          overflowY: "auto",
          marginTop: '15px',
          // boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
          <table
            style={{
              tableLayout: "fixed",
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
                    width: "130px",
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
                    width: "350px",
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
                    <tr key={index}>
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
                              className="bg-[#0662BB] py-1 px-2 rounded-md text-white mr-1 "
                              onClick={() => handleSave(index, data.sku)}
                            >
                              <FiSave size={20} />
                            </button>
                          ) : (
                            <button
                              className="bg-[#0662BB] py-1 px-2 rounded-md mr-1"
                              onClick={() => handleEditClick(index, data)}
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
                        </div>
                      </td>
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
          </section>
        </Modal.Body>
      </Modal>

      <AddProductsInRuleModal
        addProductsInRuleModalOpen={addProductsInRuleModalOpen}
        setAddProductsInRuleModalOpen={setAddProductsInRuleModalOpen}
        ruleId={ruleId}
      ></AddProductsInRuleModal>
    </div>
  );
};

export default AutomationDetailModal;
