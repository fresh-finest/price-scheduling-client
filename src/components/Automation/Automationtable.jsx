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
import { Switch } from "antd";
import { set } from "lodash";
// import { BASE_URL } from "@/utils/baseUrl";

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
  const [enableDisableLoadingStates, setEnableDisableLoadingStates] = useState(
    {}
  );

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

  const handleSwitchChange = async (checked, ruleId) => {
    if (checked) {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to enable this automation rule?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, enable it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setEnableDisableLoadingStates((prev) => ({
            ...prev,
            [ruleId]: true,
          }));
          try {
            const response = await axios.post(
              `${BASE_URL}/api/automation/rules/${ruleId}/resume`,
              {}
            );
            Swal.fire({
              title: "Enabled!",
              text: "Automation rule has been enabled.",
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
            });
            fetchData();

            setEnableDisableLoadingStates((prev) => ({
              ...prev,
              [ruleId]: false,
            }));
          } catch (error) {
            Swal.fire({
              title: "Error!",
              text: "Failed to enable the automation rule. Please try again.",
              icon: "error",
              showConfirmButton: false,
              timer: 2000,
            });

            setEnableDisableLoadingStates((prev) => ({
              ...prev,
              [ruleId]: false,
            }));
          }
        }
      });
    } else {
      Swal.fire({
        title: "Are you sure?",
        text: "Do you want to disable this automation rule?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, disable it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          setEnableDisableLoadingStates((prev) => ({
            ...prev,
            [ruleId]: true,
          }));
          try {
            const response = await axios.post(
              `${BASE_URL}/api/automation/rules/${ruleId}/mute`,
              {}
            );
            Swal.fire({
              title: "Muted!",
              text: "Automation rule has been disabled.",
              icon: "success",
              showConfirmButton: false,
              timer: 2000,
            });
            fetchData();
            setEnableDisableLoadingStates((prev) => ({
              ...prev,
              [ruleId]: false,
            }));
          } catch (error) {
            Swal.fire({
              title: "Error!",
              text: "Failed to disabled the automation rule. Please try again.",
              icon: "error",
              showConfirmButton: false,
              timer: 2000,
            });
            setEnableDisableLoadingStates((prev) => ({
              ...prev,
              [ruleId]: false,
            }));
          }
        }
      });
    }
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
      <section>
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
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Enable/Disable
              </th>
              <th
                className="tableHeader"
                style={{
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
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Rule Type
              </th>
              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Products
              </th>

              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
               Actions
              </th>
              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Created By
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
                      <Switch
                        size="small"
                        checked={!data.mute}
                        loading={
                          enableDisableLoadingStates[data.ruleId] || false
                        }
                        onChange={(checked) =>
                          handleSwitchChange(checked, data.ruleId)
                        }
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
                      <p>
                        <span style={{ marginRight: "0px", backgroundColor: "#0661bba3", color: "white", padding: "2px 5px", borderRadius: "3px" }}>
                          {data.interval}
                        </span>
                        <span
                          style={{ marginLeft: "5px", marginRight: "0px", backgroundColor
                          : "#0661bba3", color: "white", padding: "2px 5px", borderRadius: "3px" }}
                        >
                          {data.amount
                            ? `$${data.amount}`
                            : `${data.percentage * 100}%`}
                        </span>
                       
                        {/* <span style={{ marginLeft: "5px" , backgroundColor: "#0662B1", color: "white", padding: "2px 5px", borderRadius: "3px" }}>
                          {data.category.charAt(0).toUpperCase() +
                            data.category.slice(1).toLowerCase()}
                        </span> */}
                      </p>
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
                       {data.category.charAt(0).toUpperCase() +
                        data.category.slice(1).toLowerCase()}
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
                          // disabled={data.mute || deleteLoading}
                        >
                          <FiTrash />
                        </Button>
                      </div>
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
