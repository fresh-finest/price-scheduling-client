import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Badge, InputGroup, Form } from "react-bootstrap";
import priceoboIcon from "../../src/assets/images/pricebo-icon.png";
import "./Job.css";
import { MdCheck, MdOutlineClose } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";

const BASE_URL = "http://localhost:3000";

const JobTable = () => {
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/jobs`);
        console.log("responsse", response);
        setJobData(response.data.jobs);
      } catch (err) {
        setError("Error fetching job data");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);
  /*
  const getStatus = (job) => {
   if(job.failCount){
    return <Badge bg="danger">Failed</Badge>;
   } else{
    if (job.lastRunAt) {
      return <Badge bg="success">Success</Badge>;
    } else {
      return <Badge bg="info">In progress</Badge>;
    }
   }
  }; */

  const filteredProducts = jobData.filter((item) =>
    item.data.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearInput = () => {
    setSearchTerm("");
  };

  const getStatus = (job) => {
    const now = new Date();
    const nextRunAt = new Date(job.nextRunAt);

    // Determine if the job type is "Single" by checking if it does not include "monthly" or "weekly"
    const isSingle =
      !job.name.includes("monthly") && !job.name.includes("weekly");

    // If it's a single job, avoid the "Not changed Price" status logic
    if (isSingle) {
      if (job.lastRunAt) {
        return (
          <span className="bg-green-100 px-2 py-2 text-green-700 text-xs font-semibold rounded-sm">
            Success
          </span>
        );
      } else {
        return <Badge bg="info">In Progress</Badge>;
      }
    }

    if (job.failCount) {
      return (
        <span className="bg-red-100 px-2 py-2 text-red-700 text-xs font-semibold rounded-sm">
          Failed
        </span>
      );
    } else if (nextRunAt < now) {
      return (
        <span className="bg-red-100 px-2 py-2 text-red-700 text-xs font-semibold rounded-sm">
          Failed
        </span>
      );
    } else if (job.lastRunAt) {
      return (
        <span className="bg-green-100 px-2 py-2 text-green-700 text-xs font-semibold rounded-sm">
          Success
        </span>
      );
      // } else {
      //   return (
      //     <span className="bg-blue-100 px-2 py-2 text-blue-700 text-xs font-semibold rounded-sm">
      //       Upcoming
      //     </span>
      //   );
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const options = {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    };

    return date.toLocaleString("en-US", options);
  };

  // const formatDate = (dateString) => {
  //   return dateString ? new Date(dateString).toLocaleString() : "N/A";
  // };

  // const formatDate = (dateString) => {
  //   const options = {
  //     day: "2-digit",
  //     month: "short",
  //     year: "numeric",
  //     hour: "numeric",
  //     minute: "numeric",
  //     hour12: true,
  //   };
  //   return new Date(dateString).toLocaleString("en-US", options);
  // };

  const getJobType = (jobName) => {
    const isRevert = jobName.includes("revert");
    if (jobName.includes("weekly")) {
      return isRevert ? "Weekly Revert" : "Weekly";
    } else if (jobName.includes("monthly")) {
      return isRevert ? "Monthly Revert" : "Monthly";
    } else {
      return isRevert ? "Single Revert" : "Single";
    }
  };

  const handleCopy = (text, type, index) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "sku") {
          setCopiedSkuIndex(index);
          setTimeout(() => setCopiedSkuIndex(null), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div>
      <div className="">
        <InputGroup className="max-w-[500px] absolute top-[11px] ">
          <Form.Control
            type="text"
            placeholder="Search by Product SKU..."
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

      {loading ? (
        <div
          style={{
            marginTop: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "60vh",
          }}
        >
          {/* <Spinner animation="border" /> Loading... */}
          <img
            style={{ width: "40px", marginRight: "6px" }}
            className="animate-pulse"
            src={priceoboIcon}
            alt="Priceobo Icon"
          />
          <br />

          <div className="block">
            <p className="text-xl"> Loading...</p>
          </div>
        </div>
      ) : error ? (
        <p>{error}</p>
      ) : (
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
                    // width: "100px",
                    position: "sticky", // Sticky header
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
                    // width: "60px",
                    position: "sticky", // Sticky header
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Schedule Type
                </th>
                {/* <th
                  className="tableHeader"
                  style={{
                    position: "sticky", 
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Status
                </th> */}
                <th
                  className="tableHeader"
                  style={{
                    // width: "60px",
                    position: "sticky", // Sticky header
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Last Price Changed
                </th>
                <th
                  className="tableHeader"
                  style={{
                    // width: "60px",
                    position: "sticky", // Sticky header
                    textAlign: "center",
                    verticalAlign: "middle",
                    // borderRight: "2px solid #C3C6D4",
                  }}
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((job, index) => (
                  <tr key={index}>
                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <p className="flex justify-center items-center">
                        {job.data.sku}
                        {copiedSkuIndex === index ? (
                          <MdCheck
                            style={{
                              marginLeft: "10px",
                              cursor: "pointer",
                              color: "green",
                            }}
                          />
                        ) : (
                          <BsClipboardCheck
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(job.data.sku, "sku", index);
                            }}
                            style={{
                              marginLeft: "10px",
                              cursor: "pointer",
                              fontSize: "16px",
                            }}
                          />
                        )}
                      </p>
                    </td>
                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {getJobType(job.name)}
                    </td>
                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      <p>
                        {formatDate(job.lastRunAt || job.nextRunAt)}
                        {/* <span className="ml-2">{getStatus(job)}</span> */}
                      </p>
                    </td>
                    <td
                      style={{
                        padding: "15px 0",
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                    >
                      {getStatus(job)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No Data Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

export default JobTable;
