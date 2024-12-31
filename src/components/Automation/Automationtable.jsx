import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDate } from "@/utils/formatDate";
import { IoMdAdd } from "react-icons/io";
import { Button } from "react-bootstrap";
import AutomationDetailModal from "./AutomationDetailModal";
import { PenLine } from "lucide-react";
import { FiTrash } from "react-icons/fi";
import AutomationEditModal from "./AutomationEditModal/AutomationEditModal";
import Swal from "sweetalert2";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.109:3000";
const BASE_URL = `https://api.priceobo.com`;

const Automationtable = () => {
  const [automationData, setAutomationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [automationDetailModalShow, setAutomationDetailModalShow] =
    useState(false);
  const [automationEditModalShow, setAutomationEditModalShow] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [ruleId, setRuleId] = useState("");
  const [productData, setProductData] = useState([]);
  const [automationDetailData, setAutomationDetailData] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/automation/rules`);
      const data = response.data;

      console.log("data", data);
      setAutomationData(data.rules);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAutomationDetailModalShow = (ruleId) => {
    setAutomationDetailModalShow(true);
    setRuleId(ruleId);
  };
  const handleAutomationEditModalShow = (ruleId) => {
    setAutomationEditModalShow(true);
    setRuleId(ruleId);
  };

  const handleAutomationEditModalClose = () => {
    setAutomationEditModalShow(false);
    setRuleId("");
  };
  const handleAutomationDetailModalClose = () => {
    setAutomationDetailModalShow(false);
    setEditValues({});
    setEditingRow(null);
    setRuleId("");
    setProductData([]);
  };

  const deleteRule = async (ruleId) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/automation/rules/${ruleId}/delete`
      );

      return response.data;
    } catch (error) {
      console.error(
        "Error deleting automation rule:",
        error.response ? error.response.data : error.message
      );
      throw error;
    }
  };

  const handleMuteAutomation = async (ruleId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to mute this automation rule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, mute it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `${BASE_URL}/api/automation/rules/${ruleId}/mute`,
            {}
          );

          console.log("Mute response:", response.data);

          Swal.fire({
            title: "Muted!",
            text: "Automation rule has been muted.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });

          fetchData();
        } catch (error) {
          console.error("Error muting automation rule:", error);

          Swal.fire({
            title: "Error!",
            text: "Failed to mute the automation rule. Please try again.",
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };
  const handleResumeAutomation = async (ruleId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you want to resume this automation rule?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, resume it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.post(
            `${BASE_URL}/api/automation/rules/${ruleId}/resume`,
            {}
          );

          console.log("Mute response:", response.data);

          Swal.fire({
            title: "Resumed!",
            text: "Automation rule has been resumed.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });

          fetchData();
        } catch (error) {
          console.error("Error resuming automation rule:", error);

          Swal.fire({
            title: "Error!",
            text: "Failed to resume the automation rule. Please try again.",
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  const handleDeleteRule = async (ruleId) => {
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
          await deleteRule(ruleId);

          Swal.fire({
            title: "Deleted!",
            text: "Automation rule has been deleted.",
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

          console.error(error);
          setDeleteLoading(false);
          Swal.fire({
            title: "Error!",
            text: `Failed to delete automation rule: ${errorMessage}`,
            icon: "error",
            showConfirmButton: false,
            timer: 2000,
          });
        }
      }
    });
  };

  return (
    <div>
      <section

      // style={{
      //   maxHeight: "91vh",
      //   overflowY: "auto",
      //   marginTop: "50px",
      //   boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      // }}
      >
        <table
          style={{
            tableLayout: "fixed",
          }}
          className="reportCustomTable table"
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
                  // width: "130px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Mute/Resume
              </th>
              <th
                className="tableHeader"
                style={{
                  // width: "130px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Rule ID
              </th>
              <th
                className="tableHeader"
                style={{
                  // width: "130px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Rule Name
              </th>
              <th
                className="tableHeader"
                style={{
                  // width: "130px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Category
              </th>
              <th
                className="tableHeader"
                style={{
                  // width: "130px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                User Name
              </th>

              <th
                className="tableHeader"
                style={{
                  // width: "px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                View Data
              </th>
              <th
                className="tableHeader"
                style={{
                  // width: "px",
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
            {automationData.length > 0 ? (
              automationData.map((data, index) => {
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
                      {!data.mute && (
                        <Button
                          onClick={() => handleMuteAutomation(data.ruleId)}
                          className="text-xs"
                          style={{
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "#0662BB",
                            borderRadius: "3px",
                            zIndex: 1,
                          }}
                        >
                          Mute
                        </Button>
                      )}
                      {data.mute && (
                        <Button
                          onClick={() => handleResumeAutomation(data.ruleId)}
                          className="text-xs"
                          style={{
                            padding: "8px 12px",
                            border: "none",
                            backgroundColor: "#0662BB",
                            borderRadius: "3px",
                            zIndex: 1,
                          }}
                        >
                          Resume
                        </Button>
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
                      {data.ruleId}
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
                      {data.ruleName}
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
                      {data.category}
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
                      {data.userName}

                      <p>{formatDate(data.createdAt)}</p>
                    </td>

                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <Button
                        onClick={() =>
                          handleAutomationDetailModalShow(data.ruleId)
                        }
                        className="text-xs"
                        style={{
                          padding: "8px 12px",
                          border: "none",
                          backgroundColor: "#0662BB",
                          borderRadius: "3px",
                          zIndex: 1,
                        }}
                      >
                        View Products
                      </Button>
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
                        <button
                          disabled={data.mute}
                          className={`py-1 px-2 rounded-sm mr-1 ${
                            data.mute ? "bg-gray-400 " : "bg-[#0662BB]"
                          }`}
                          onClick={() =>
                            handleAutomationEditModalShow(data.ruleId)
                          }
                        >
                          <PenLine size={20} className="text-white" />
                        </button>

                        <Button
                          // onClick={() =>
                          //   handleDeleteAutomation(ruleData.ruleId, data.sku)
                          // }
                          onClick={() => handleDeleteRule(data.ruleId)}
                          variant="danger"
                          size="md"
                          className="rounded-sm"
                          disabled={data.mute || deleteLoading}
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
                  colSpan="6"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <AutomationDetailModal
        automationDetailModalShow={automationDetailModalShow}
        handleAutomationDetailModalClose={handleAutomationDetailModalClose}
        editValues={editValues}
        setEditValues={setEditValues}
        editingRow={editingRow}
        setEditingRow={setEditingRow}
        ruleId={ruleId}
        productData={productData}
        setProductData={setProductData}
      ></AutomationDetailModal>

      <AutomationEditModal
        automationEditModalShow={automationEditModalShow}
        handleAutomationEditModalClose={handleAutomationEditModalClose}
        ruleId={ruleId}
        automationDetailData={automationDetailData}
        setAutomationDetailData={setAutomationDetailData}
      ></AutomationEditModal>
    </div>
  );
};

export default Automationtable;