import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import "./ScheduleDetailsModal.css";
import { Card } from "../ui/card";
import { FaArrowRightLong } from "react-icons/fa6";
import { PenLine } from "lucide-react";
import EditScheduleFromList from "../List/EditScheduleFromList";

const BASE_URL = "http://localhost:3000";
// const BASE_URL = `https://api.priceobo.com`;

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const dateNames = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "9th",
  "10th",
  "11th",
  "12th",
  "13th",
  "14th",
  "15th",
  "16th",
  "17th",
  "18th",
  "19th",
  "20th",
  "21st",
  "22nd",
  "23rd",
  "24th",
  "25th",
  "26th",
  "27th",
  "28th",
  "29th",
  "30th",
  "31st",
];

const ScheduleDetailsModal = ({
  show,
  onClose,
  sku,
  selectedDate,
  eventType,
  weekly,
  monthly,
}) => {
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editSchedule, setEditSchedule] = useState(null);
  const [editScheduleModalTitle, setEditScheduleModalTitle] = useState(null);

  console.log("eventType:" + eventType);
  useEffect(() => {
    if (sku && show) {
      fetchScheduleDetails();
    }
  }, [sku, show]);
  console.log(scheduleData);

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
    const schedule = data[1];

    if (!schedule) return null;

    const filteredSchedule = { ...schedule }; // Clone the schedule data

    if (eventType === "monthly") {
      // Filter monthlyTimeSlots based on the selected date
      // const dayOfMonth = moment(selectedDate).date(); // Get day of the month (1-31)
      // filteredSchedule.monthlyTimeSlots = {
      //   [dayOfMonth]: schedule.monthlyTimeSlots[dayOfMonth] || [],

      // };

      filteredSchedule.monthlyTimeSlots = { ...schedule.monthlyTimeSlots };
    }

    if (eventType === "weekly" && weekly) {
      filteredSchedule.weeklyTimeSlots = { ...schedule.weeklyTimeSlots };
      // const dayOfWeek = moment(selectedDate).day();
      // filteredSchedule.weeklyTimeSlots = {
      //   [dayOfWeek]: schedule.weeklyTimeSlots[dayOfWeek] || [],
      // };
    }

    return filteredSchedule;
  };

  const getDayLabelFromNumber = (dayNumber) => {
    return dayNames[dayNumber] || "";
  };

  const getDateLabelFromNumber = (dateNumber) => {
    return dateNames[dateNumber - 1] || `Day ${dateNumber}`; // Fallback if dateNumber is out of range
  };

  const handleEdit = (schedule, scheduleType) => {
    setEditSchedule(schedule);
    setEditScheduleModalTitle(scheduleType);
  };
  const handleClose = () => {
    setEditSchedule(null);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const schedule = scheduleData; // After filtering

  console.log("schedule", schedule);

  console.log(editSchedule);

  function addHoursToTime(timeString, hoursToAdd) {
    if (!timeString || typeof timeString !== "string") {
      console.error("Invalid timeString:", timeString);
      return "Invalid Time"; // Return a default value or handle it gracefully
    }

    const [hours, minutes] = timeString.split(":").map(Number);
    const newHours = (hours + hoursToAdd) % 24; // Ensures the hour stays in 24-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes; // Add leading zero to minutes if necessary

    // Convert 24-hour time to 12-hour format with AM/PM
    const period = newHours >= 12 ? "PM" : "AM";
    const hours12 = newHours % 12 || 12; // Convert to 12-hour format
    const formattedHours = hours12 < 10 ? `0${hours12}` : hours12;

    return `${formattedHours}:${formattedMinutes} ${period}`; // Return time in 12-hour format with AM/PM
  }

  return (
    <>
      <Modal
        show={show}
        onHide={onClose}
        dialogClassName="schedule-details-list-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {" "}
            {eventType === "monthly" && "Monthly"}{" "}
            {eventType === "weekly" && "Weekly"}{" "}
            {eventType === "single" && "Single"} Schedule Details
          </Modal.Title>
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
              <p>
                <strong>SKU:</strong> {schedule.sku}
              </p>
              <p>
                <strong>ASIN:</strong> {schedule.asin}
              </p>

              {/* Weekly Schedule */}
              {eventType === "weekly" && (
                <div>
                  {Object.entries(schedule.weeklyTimeSlots).map(
                    ([day, timeSlots], index) => (
                      <Card className="mb-2" key={index}>
                        <div className=" bg-[#DCDCDC] border-0 m-0 px-1  rounded-t-sm text-black ">
                          <span>{moment().day(day).format("dddd")}</span>
                        </div>

                        {timeSlots.map((slot, idx) => (
                          <div key={idx} className="">
                            <div className="flex justify-center w-full gap-2 my-2 px-2 ">
                              <div className="w-full">
                                <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                  {addHoursToTime(slot?.startTime, 0)}
                                  <span className="bg-blue-500 text-white p-1 rounded-sm">
                                    ${parseFloat(slot.newPrice).toFixed(2)}
                                  </span>
                                </h3>
                              </div>
                              <span className="flex justify-center items-center text-gray-400">
                                <FaArrowRightLong />
                              </span>
                              <div className="w-full">
                                <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                  {addHoursToTime(slot?.endTime, 0)}
                                  {slot.revertPrice ? (
                                    <span className="bg-red-700 text-white p-1 rounded-sm">
                                      ${parseFloat(slot.revertPrice).toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="p-1">
                                      <p className="py-2"></p>
                                    </span>
                                  )}
                                </h3>
                              </div>

                              <div className="w-[20%] text-center flex justify-center items-center mt-0">
                                <button
                                  onClick={() =>
                                    handleEdit(scheduleData, "Weekly")
                                  }
                                  className="bg-[#0662BB] py-1  px-1 rounded-sm "
                                >
                                  <PenLine size={20} className="text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </Card>
                    )
                  )}
                </div>
              )}

              {/* Monthly Schedule */}
              {eventType === "monthly" && (
                <div>
                  {Object.entries(schedule.monthlyTimeSlots).map(
                    ([date, timeSlots], index) => (
                      <Card className="mb-2" key={index}>
                        <div className=" bg-[#DCDCDC] border-0 m-0 px-1  rounded-t-sm text-black ">
                          {getDateLabelFromNumber(date)}
                        </div>

                        {timeSlots.map((slot, idx) => (
                          <div key={idx} className="">
                            <div className="flex justify-center w-full gap-2 my-2 px-2 ">
                              <div className="w-full">
                                <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                  {addHoursToTime(slot?.startTime, 0)}
                                  <span className="bg-blue-500 text-white p-1 rounded-sm">
                                    ${parseFloat(slot.newPrice).toFixed(2)}
                                  </span>
                                </h3>
                              </div>
                              <span className="flex justify-center items-center text-gray-400">
                                <FaArrowRightLong />
                              </span>
                              <div className="w-full">
                                <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                  {addHoursToTime(slot?.endTime, 0)}
                                  {slot.revertPrice ? (
                                    <span className="bg-red-700 text-white p-1 rounded-sm">
                                      ${parseFloat(slot.revertPrice).toFixed(2)}
                                    </span>
                                  ) : (
                                    <span className="p-1">
                                      <p className="py-2"></p>
                                    </span>
                                  )}
                                </h3>
                              </div>

                              <div className="w-[20%] text-center flex justify-center items-center mt-0">
                                <button
                                  onClick={() =>
                                    handleEdit(scheduleData, "Monthly")
                                  }
                                  className="bg-[#0662BB] py-1  px-1 rounded-sm "
                                >
                                  <PenLine size={20} className="text-white" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </Card>
                    )
                  )}
                </div>
              )}

              {/* Single Day Schedule */}
              {eventType === "single" && (
                <div>
                  <strong>Single Day Schedule:</strong>
                  <p>
                    Start: {new Date(schedule.startDate).toLocaleTimeString()},
                    End: {new Date(schedule.endDate).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p>No schedule data available.</p>
          )}
        </Modal.Body>
      </Modal>

      {editSchedule && (
        <EditScheduleFromList
          show={!!editSchedule}
          onClose={handleClose}
          asin={schedule.asin}
          existingSchedule={editSchedule}
          editScheduleModalTitle={editScheduleModalTitle}
        />
      )}
    </>
  );
};

export default ScheduleDetailsModal;
