import React, { useState, useEffect } from "react";
import axios from "axios";
import { formatDate } from "@/utils/formatDate";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL = "http://192.168.0.109:3000";
const BASE_URL = `https://api.priceobo.com`;

const Automationtable = () => {
  const [automationData, setAutomationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/active-auto-job`);
        const data = response.data;
        console.log(data);
        setAutomationData(data.result);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(automationData);
  return (
    <div>
      <section
        style={{
          maxHeight: "91vh",
          overflowY: "auto",
          marginTop: "50px",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
        }}
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
                  width: "180px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                SKU
              </th>
              <th
                className="tableHeader"
                style={{
                  width: "400px",
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
                  width: "180px",
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                  borderRight: "2px solid #C3C6D4",
                }}
              >
                Automation Category
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
                Price Range
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
                Automate by User Name
              </th>
              <th
                className="tableHeader"
                style={{
                  position: "sticky",
                  textAlign: "center",
                  verticalAlign: "middle",
                }}
              >
                Created At
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
                        height: "40px",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {data.imageUrl ? (
                        <img
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "contain",
                            margin: "0 auto",
                          }}
                          src={data.imageUrl}
                          alt="Product"
                        />
                      ) : (
                        "No Image"
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
                      {data.sku}
                    </td>

                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                      title={data.title}
                    >
                      {data.title
                        ? data.title.split(" ").slice(0, 10).join(" ") +
                          (data.title.split(" ").length > 10 ? "..." : "")
                        : "No Title"}
                    </td>
                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {data.category || "Not Applicable"}
                    </td>
                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      ${data.minPrice} - ${data.maxPrice}
                    </td>
                    <td
                      style={{
                        padding: "15px 0",
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
                      {formatDate(data.createdAt)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="8"
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
