import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Badge } from "react-bootstrap";

const BASE_URL = "http://localhost:3000";

const JobTable = () => {
  const [jobData, setJobData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/jobs`);
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

 
  const getStatus = (job) => {
    const now = new Date();
    const nextRunAt = new Date(job.nextRunAt);
  
    // Determine if the job type is "Single" by checking if it does not include "monthly" or "weekly"
    const isSingle = !job.name.includes("monthly") && !job.name.includes("weekly");
  
    // If it's a single job, avoid the "Not changed Price" status logic
    if (isSingle) {
      if (job.lastRunAt) {
        return <Badge bg="success">Success</Badge>;
      } else{
      return <Badge bg="info">In Progress</Badge>;
      }
    }
  
    if (job.failCount) {
      return <Badge bg="danger">Failed</Badge>;
    } else if (nextRunAt < now) {
      return <Badge bg="warning">Not Changed Price</Badge>;
    } else if (job.lastRunAt) {
      return <Badge bg="success">Success</Badge>;
    } else {
      return <Badge bg="info">In Progress</Badge>;
    }
  };
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
  
    const date = new Date(dateString);
    const options = { 
      timeZone: "America/New_York", 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
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
    if (jobName.includes("weekly")) {
      return "Weekly";
    } else if (jobName.includes("monthly")) {
      return "Monthly";
    } else {
      return "Single";
    }
  };

  return (
    <div>
      
      {loading ? (
        <p>Loading job data...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Schedule Type</th>
              <th>Status</th>
              <th>Last Price Changed</th>
              <th>Next Price Time</th>
            </tr>
          </thead>
          <tbody>
            {jobData.map((job, index) => (
              <tr key={index}>
                <td>{job.data.sku}</td>
                <td>{getJobType(job.name)}</td>
                <td>{getStatus(job)}</td>
                <td>{formatDate(job.lastRunAt || job.nextRunAt)}</td>
                <td>{formatDate(job.nextRunAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default JobTable;
