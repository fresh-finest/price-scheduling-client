import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Badge, InputGroup, Form, Pagination } from "react-bootstrap";
import priceoboIcon from "../../src/assets/images/pricebo-icon.png";
import "./Job.css";
import { MdCheck, MdOutlineClose } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";
// import SettingsUserRoleSelect from "@/components/shared/ui/SettingsUserRoleSelect";
import StatusFilterDropDown from "@/components/shared/ui/StatusFilterDropDown";
import StatusScheduleTypeDropdown from "@/components/shared/ui/StatusScheduleTypeDropdown";
import StatusLoadingSkeleton from "@/components/LoadingSkeleton/StatusLoadingSkeleton";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = `https://api.priceobo.com`;

const JobTable = () => {
  const [jobData, setJobData] = useState([]);
  const [listingData, setListingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredStatus, setFilteredStatus] = useState("all");
  const [filteredScheduleType, setFilteredScheduleType] = useState("all");

  const itemsPerPage = 20;

  /*
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job, schedule, and listing data
        const [jobResponse, scheduleResponse, listingResponse] =
          await Promise.all([
            axios.get(`${BASE_URL}/api/jobs`),
            axios.get(`${BASE_URL}/api/schedule`),
            axios.get(`${BASE_URL}/fetch-all-listings`),
          ]);

          const sortedJobs = jobResponse.data.jobs.sort((a, b) => {
            const dateA = new Date(a.nextRunAt || a.lastRunAt || 0);
            const dateB = new Date(b.nextRunAt || b.lastRunAt || 0);
            return dateB - dateA; // Sort descending
          });
          console.log(sortedJobs)

        const schedules = scheduleResponse.data.result;
        const listings = listingResponse.data.listings;

        // Merge job, schedule, and listing data by SKU
        const mergedData = sortedJobs.map((job) => {
          const schedule = schedules.find((s) => s._id === job.data.scheduleId);
          const listing = listings.find(
            (listing) => listing.sellerSku === job.data.sku
          );
          return {
            ...job,
            userName: schedule?.userName || "N/A",
            createdAt: schedule?.createdAt || "N/A",
            listing, // Attach listing details if found
          };
        });

        setJobData(mergedData);
      } catch (err) {
        setError("Error fetching job, schedule, or listing data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch job, schedule, and listing data
        const [jobResponse, scheduleResponse, listingResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/jobs`),
          axios.get(`${BASE_URL}/api/schedule`),
          axios.get(`${BASE_URL}/fetch-all-listings`),
        ]);
  
        // Sort jobs by nextRunAt (descending), falling back to lastRunAt
        const sortedJobs = jobResponse.data.jobs.sort((a, b) => {
          const dateA = new Date(a.nextRunAt || a.lastRunAt || 0);
          const dateB = new Date(b.nextRunAt || b.lastRunAt || 0);
          return dateB - dateA; // Descending order
        });
  
        const schedules = scheduleResponse.data.result;
        const listings = listingResponse.data.listings;
  
        // Merge job, schedule, and listing data by SKU
        const mergedData = sortedJobs.map((job) => {
          const schedule = schedules.find((s) => s._id === job.data.scheduleId);
          const listing = listings.find(
            (listing) => listing.sellerSku === job.data.sku
          );
          return {
            ...job,
            userName: schedule?.userName || "N/A",
            createdAt: schedule?.createdAt || "N/A",
            listing, // Attach listing details if found
          };
        });
  
        setJobData(mergedData);
      } catch (err) {
        setError("Error fetching job, schedule, or listing data");
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);
  

  console.log("Job data",JSON.stringify(jobData));

  const getStatus = (job, isUpcoming) => {
    const now = new Date();
    const nextRunAt = job.nextRunAt ? new Date(job.nextRunAt) : null;

    if (job.failCount || (nextRunAt && nextRunAt < now)) {
      return {
        statusText: "failed",
        statusElement: (
          <span className="bg-red-100 px-2 py-2 text-red-700 text-xs font-semibold rounded-sm">
            Failed
          </span>
        ),
      };
    }

    if (isUpcoming) {
      return {
        statusText: "upcoming",
        statusElement: (
          <span className="bg-blue-100 px-2 py-2 text-blue-700 text-xs font-semibold rounded-sm">
            Upcoming
          </span>
        ),
      };
    }

    return {
      statusText: "success",
      statusElement: (
        <span className="bg-green-100 px-2 py-2 text-green-700 text-xs font-semibold rounded-sm">
          Success
        </span>
      ),
    };
  };

  // Extend job data for recurring jobs
  const extendRecurringJobs = (jobs) => {
    return jobs.flatMap((job) => {
      const rows = [];
      const now = new Date();

      // For lastRunAt, mark as success
      if (job.lastRunAt) {
        rows.push({
          ...job,
          displayRunAt: job.lastRunAt,
          isUpcoming: false,
        });
      }

      // For nextRunAt, mark as upcoming if in the future or failed if in the past
      if (job.nextRunAt) {
        rows.push({
          ...job,
          displayRunAt: job.nextRunAt,
          isUpcoming: true,
        });
      }

      return rows;
    });
  };
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
  // Extend the jobs for recurring entries
  const extendedJobData = extendRecurringJobs(jobData);

  // Apply filtering
  const filteredProducts = extendedJobData
    .filter((item) =>
      item.data.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (item) =>
        filteredStatus === "all" ||
        getStatus(item, item.isUpcoming).statusText === filteredStatus
    )
    .filter((item) => {
      const jobType = getJobType(item.name);

      if (filteredScheduleType === "all") return true;

      return (
        (filteredScheduleType === "Single" &&
          (jobType === "Single" || jobType === "Single Revert")) ||
        (filteredScheduleType === "Weekly" &&
          (jobType === "Weekly" || jobType === "Weekly Revert")) ||
        (filteredScheduleType === "Monthly" &&
          (jobType === "Monthly" || jobType === "Monthly Revert"))
      );
    });

  /*
  const filteredProducts = jobData
  .filter((item) =>
    item.data.sku.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .filter(
    (item) =>
      filteredStatus === "all" ||
      getStatus(item).statusText === filteredStatus
  )
  .filter((item) => {
    const jobType = getJobType(item.name);

    // Show all types if 'Show All' is selected
    if (filteredScheduleType === "all") return true;

    // Filter based on selected type and include revert types
    return (
      (filteredScheduleType === "Single" &&
        (jobType === "Single" || jobType === "Single Revert")) ||
      (filteredScheduleType === "Weekly" &&
        (jobType === "Weekly" || jobType === "Weekly Revert")) ||
      (filteredScheduleType === "Monthly" &&
        (jobType === "Monthly" || jobType === "Monthly Revert"))
    );
  });
*/

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderPaginationButtons = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i <= maxPagesToShow ||
        i >= totalPages - maxPagesToShow ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pageNumbers.push(i);
      } else if (pageNumbers[pageNumbers.length - 1] !== "...") {
        pageNumbers.push("...");
      }
    }

    return pageNumbers.map((page, index) => (
      <Pagination.Item
        key={index}
        active={page === currentPage}
        onClick={() => typeof page === "number" && handlePageChange(page)}
      >
        {page}
      </Pagination.Item>
    ));
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleClearInput = () => {
    setSearchTerm("");
    setCurrentPage(1);
  };
  const handleStatusChange = (status) => {
    setFilteredStatus(status);
    setCurrentPage(1);
  };

  const handleScheduleTypeChange = (selectedType) => {
    setFilteredScheduleType(selectedType);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const options = {
      timeZone: "America/New_York",
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    };

    return date.toLocaleString("en-US", options);
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

  if (loading) {
    return <StatusLoadingSkeleton></StatusLoadingSkeleton>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  return (
    <div>
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

      {
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
                    position: "sticky", // Sticky header
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
                    width: "455px",
                    position: "sticky", // Sticky header
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
                    // width: "100px",
                    position: "sticky", // Sticky header
                    textAlign: "center",
                    verticalAlign: "middle",
                    borderRight: "2px solid #C3C6D4",
                  }}
                >
                  <p className="flex items-center justify-center gap-1">
                    Schedule Type
                    <StatusScheduleTypeDropdown
                      handleScheduleTypeChange={handleScheduleTypeChange}
                    ></StatusScheduleTypeDropdown>
                  </p>
                </th>
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
                  Schedule
                </th>
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
                  User
                </th>
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
                  Created At
                </th>
                <th
                  className="tableHeader"
                  style={{
                    // width: "100px",
                    position: "sticky", // Sticky header
                    textAlign: "center",
                    verticalAlign: "middle",
                  }}
                >
                  <p className="flex  items-center justify-center gap-1">
                    Status
                    <StatusFilterDropDown
                      handleStatusChange={handleStatusChange}
                    ></StatusFilterDropDown>
                  </p>
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
              {currentItems.length > 0 ? (
                currentItems.map((job, index) => {
                  const { statusElement } = getStatus(job, job.isUpcoming);

                  return (
                    <tr key={index}>
                      <td
                        style={{
                          height: "40px",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {job.listing?.imageUrl ? (
                          <img
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "contain",
                              margin: "0 auto",
                            }}
                            src={job.listing.imageUrl}
                            alt="Product"
                          />
                        ) : (
                          "No Image"
                        )}
                      </td>
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
                                fontSize: "16px",
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
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          height: "40px",
                          textAlign: "start",
                          verticalAlign: "middle",
                        }}
                      >
                        {job.listing?.itemName || "No Title"}
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
                        {formatDate(job.displayRunAt)}
                      </td>
                      <td
                        style={{
                          padding: "15px 0",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {job.userName}
                      </td>
                      <td
                        style={{
                          padding: "15px 0",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {formatDate(job.createdAt)}
                      </td>
                      <td
                        style={{
                          padding: "15px 0",
                          textAlign: "center",
                          verticalAlign: "middle",
                        }}
                      >
                        {statusElement}
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
          <Pagination className="flex mb-3 justify-center">
            <Pagination.First onClick={() => handlePageChange(1)} />
            <Pagination.Prev
              onClick={() =>
                handlePageChange(currentPage > 1 ? currentPage - 1 : 1)
              }
            />
            {renderPaginationButtons()}
            <Pagination.Next
              onClick={() =>
                handlePageChange(
                  currentPage < totalPages ? currentPage + 1 : totalPages
                )
              }
            />
            <Pagination.Last onClick={() => handlePageChange(totalPages)} />
          </Pagination>
        </section>
      }
    </div>
  );
};

export default JobTable;
