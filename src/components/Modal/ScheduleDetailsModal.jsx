import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import moment from "moment";

const BASE_URL = "http://localhost:3000";
// const BASE_URL = `https://api.priceobo.com`;

const ScheduleDetailsModal = ({ show, onClose, sku, selectedDate, eventType }) => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log("eventType:"+eventType)
  useEffect(() => {
    if (sku && show) {
      fetchScheduleDetails();
    }
  }, [sku, show]);

  const fetchScheduleDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/schedule/${sku}`);
      const data = response.data.result;

      // Filter the data according to event type and selected date
      const filteredData = filterDataByEventTypeAndDate(data);

      setScheduleData(filteredData);
      setLoading(false);
    } catch (error) {
      setError("Error fetching schedule details");
      setLoading(false);
    }
  };

  const filterDataByEventTypeAndDate = (data) => {
    // Assuming data is an array, and we select the first match
    const schedule = data[0];

    if (!schedule) return null;

    const filteredSchedule = { ...schedule }; // Clone the schedule data

    if (eventType === "monthly") {
      // Filter monthlyTimeSlots based on the selected date
      const dayOfMonth = moment(selectedDate).date(); // Get day of the month (1-31)
      filteredSchedule.monthlyTimeSlots = {
        [dayOfMonth]: schedule.monthlyTimeSlots[dayOfMonth] || []
      };
    }

    if (eventType === "weekly") {
      // Filter weeklyTimeSlots based on the selected date
      const dayOfWeek = moment(selectedDate).day(); // Get day of week (0-6)
      filteredSchedule.weeklyTimeSlots = {
        [dayOfWeek]: schedule.weeklyTimeSlots[dayOfWeek] || []
      };
    }

    return filteredSchedule;
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const schedule = scheduleData; // After filtering

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Schedule Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {schedule ? (
          <div>
            <img
              src={schedule.imageURL}
              alt={schedule.title}
              style={{ width: "100px", height: "100px" }}
            />
            <h4>{schedule.title}</h4>
            <p><strong>SKU:</strong> {schedule.sku}</p>
            <p><strong>ASIN:</strong> {schedule.asin}</p>
            {/* <p><strong>Price:</strong> ${schedule.price || schedule.currentPrice}</p>
            <p><strong>Start Date:</strong> {new Date(schedule.startDate).toLocaleString()}</p>
            <p><strong>End Date:</strong> {new Date(schedule.endDate).toLocaleString()}</p> */}

            {/* Weekly Schedule */}
            {eventType === "weekly" &&  (
              <div>
              <p>Week</p>
                <strong>Weekly Schedule for {moment(selectedDate).format("dddd")}:</strong>
                {Object.entries(schedule.weeklyTimeSlots).map(([day, timeSlots], index) => (
                  <div key={index}>
                    {timeSlots.map((slot, idx) => (
                      <div key={idx}>
                        <p>
                          Start: {slot.startTime}, End: {slot.endTime}, New Price: ${slot.newPrice}, Revert Price: ${slot.revertPrice}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
         
            {/* Monthly Schedule */}
            {eventType === 'monthly' && (
              <div>
              <p>Month</p>
                <strong>Monthly Schedule for {moment(selectedDate).format("Do")}:</strong>
                {Object.entries(schedule.monthlyTimeSlots).map(([date, timeSlots], index) => (
                  <div key={index}>
                    {timeSlots.map((slot, idx) => (
                      <div key={idx}>
                        <p>
                          Start: {slot.startTime}, End: {slot.endTime}, New Price: ${slot.newPrice}, Revert Price: ${slot.revertPrice}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Single Day Schedule */}
            {eventType === "single" &&(
              <div>
                <strong>Single Day Schedule:</strong>
                <p>
                  Start: {new Date(schedule.startDate).toLocaleTimeString()}, End: {new Date(schedule.endDate).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p>No schedule data available.</p>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ScheduleDetailsModal;
