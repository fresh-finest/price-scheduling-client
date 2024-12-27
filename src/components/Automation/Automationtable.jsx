import React, { useState, useEffect } from "react";
import axios from "axios";

import { Button } from "react-bootstrap";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.109:3000";
const BASE_URL = `https://api.priceobo.com`;

const Automationtable = () => {
  const [automationData, setAutomationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [automationDetailModalShow, setAutomationDetailModalShow] =
    useState(false);

  console.log("automationData", automationData);
  useEffect(() => {
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

    fetchData();
  }, []);
  console.log(automationData);

  const handleAutomationDetailModalShow = () => {
    setAutomationDetailModalShow(true);
  };

  const handleAutomationDetailModalClose = () => {
    setAutomationDetailModalShow(false);
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
                }}
              >
                View Data
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
                    </td>

                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <Button
                        onClick={handleAutomationDetailModalShow}
                        className="text-xs"
                        style={{
                          padding: "8px 12px",
                          border: "none",
                          backgroundColor: "#0662BB",
                          borderRadius: "3px",
                          zIndex: 1,
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="2"
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  No Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

    </div>
  );
};

export default Automationtable;