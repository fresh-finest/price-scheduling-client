import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment";

// const BASE_URL = "http://localhost:3000";
// const BASE_URL ="http://192.168.0.167:3000"
const BASE_URL = `https://api.priceobo.com`;

function NotificationComponent() {
  const [failedJobs, setFailedJobs] = useState([]);
  const [error, setError] = useState(null);


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

  const getStatus = (job) => {
    const now = new Date();
    const nextRunAt = job.nextRunAt ? new Date(job.nextRunAt) : null;
    const isSingle =
      !job.name.includes("monthly") && !job.name.includes("weekly");

    if (isSingle) {
      if (job.failCount || (!job.lastRunAt && nextRunAt && nextRunAt < now)) {
        return "failed";
      }
    } else {
      if (job.failCount || (!job.lastRunAt && nextRunAt && nextRunAt < now)) {
        return "failed";
      }
    }
    return "success";
  };

  const fetchJobs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/jobs`);
      const allJobs = response.data.jobs;
      const oneWeekAgo = moment().subtract(7, "days").toDate();

      const failedJobs = allJobs
        .filter((job) => getStatus(job) === "failed")
        .filter(
          (job) =>
            getStatus(job) === "failed" &&
            new Date(job.lastRunAt || job.nextRunAt) >= oneWeekAgo
        )
        .slice(0, 5)
        .map((job) => ({ ...job, read: JSON.parse(localStorage.getItem(`notification_${job._id}`)) || false,  }));
      setFailedJobs(failedJobs);
    } catch (err) {
      setError("Error fetching job data");
    }
  };

  console.log("Failed jobs" + failedJobs);
  const markAsRead = (index) => {
    const updatedJobs = [...failedJobs];
    if (!updatedJobs[index].read) {
      updatedJobs[index].read = true;
      setFailedJobs(updatedJobs);
      // MdOutlineMarkAsUnread()
      localStorage.setItem(
        `notification_${updatedJobs[index]._id}`,
        JSON.stringify(true)
      );
    }
  };
  useEffect(() => {
    fetchJobs();
  }, []);

  return (
    <div>
      {error && <p>{error}</p>}
      {failedJobs.length > 0 ? (
        <ul>
          {failedJobs.map((job, index) => (
            <li
              key={job._id}
              className={`failed-job ${job.read ? "read" : "unread"}`}
              onClick={() => markAsRead(index)}
              style={{
                cursor: "pointer",
                backgroundColor: job.read ? "#fff" : "#f0f0f0",
              }}
            >
              <p>
                {job.data.sku},{formatDate(job.nextRunAt) || formatDate(job.lastRunAt)}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No Failed jobs</p>
      )}
    </div>
  );
}

export default NotificationComponent;
