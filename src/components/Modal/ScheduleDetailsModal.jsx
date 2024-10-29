import React, { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import axios from "axios";
import moment from "moment";
import "./ScheduleDetailsModal.css";
import { Card } from "../ui/card";
import { FaArrowRightLong } from "react-icons/fa6";
import { PenLine } from "lucide-react";
import EditScheduleFromList from "../List/EditScheduleFromList";
import Loading from "../shared/ui/Loading";

// const BASE_URL = "http://localhost:3000";
const BASE_URL = `https://api.priceobo.com`;

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

  const fetchScheduleDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/schedule/${sku}`);
      const data = response.data.result;

      // Filter the data according to event type and selected date
      const filteredData = filterDataByEventTypeAndDate(data);

      console.log("filtered Data", filteredData);

      setScheduleData(filteredData);
      setLoading(false);
    } catch (error) {
      setError("Error fetching schedule details");
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    const options = {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Date(dateString).toLocaleString("en-US", options);
  };

  console.log("scheduleData", scheduleData);

  const filterDataByEventTypeAndDate = (data) => {
    console.log("data", data);
    const now = new Date();

    let schedule = [];
    if (eventType === "monthly") {
      schedule = data.filter(
        (sc) =>
          sc.status !== "deleted" &&
          sc.monthly &&
          Object.keys(sc.monthlyTimeSlots).length > 0
      );

      console.log(schedule);
    } else if (eventType === "weekly") {
      schedule = data.filter(
        (sc) =>
          sc.status !== "deleted" &&
          sc.weekly &&
          Object.keys(sc.weeklyTimeSlots).length > 0
      );
    } else {
      schedule = data.filter(
        (sc) =>
          sc.status !== "deleted" &&
          !sc.weekly &&
          !sc.monthly &&
          (sc.endDate === null || (sc.endDate && new Date(sc.endDate) >= now))
      );
    }

    return schedule;
  };

  // const filterDataByEventTypeAndDate = (data) => {

  //   console.log("props data", data);
  //   const schedule = data[0];

  //   console.log("schedule", schedule);

  //   if (!schedule) return null;

  //   const filteredSchedule = { ...schedule };

  //   console.log(filteredSchedule);

  //   if (eventType === "monthly") {

  //     filteredSchedule.monthlyTimeSlots = { ...schedule.monthlyTimeSlots };
  //   }

  //   if (eventType === "weekly" && weekly) {
  //     filteredSchedule.weeklyTimeSlots = { ...schedule.weeklyTimeSlots };

  //   }

  //   return filteredSchedule;
  // };

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

  // if (loading) {
  //   return <p>Loading...</p>;
  // }

  if (error) {
    return <p>{error}</p>;
  }

  const schedule = scheduleData; // After filtering

  console.log("schedule from schedule details modal", schedule);

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
        <div>
          {!loading ? (
            <div>
              <Modal.Header closeButton>
                <Modal.Title>
                  {" "}
                  {eventType === "monthly" && "Monthly"}{" "}
                  {eventType === "weekly" && "Weekly"}{" "}
                  {eventType === "single" && "Single"} Schedule Details
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {scheduleData ? (
                  <div className="">
                    <div className="flex justify-center items-start mb-3 gap-2">
                      <img
                        src={scheduleData[0].imageURL}
                        alt={scheduleData[0].title}
                        style={{ width: "80px", height: "80px" }}
                      />
                      <div>
                        <h4>{scheduleData[0].title}</h4>
                        <div className="flex gap-1 text-sm mt-1">
                          <p>
                            <span>SKU:</span> {schedule[0].sku}
                          </p>
                          <p>
                            <span>ASIN:</span> {schedule[0].asin}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Weekly Schedule */}
                    {eventType === "weekly" &&
                      scheduleData[0]?.weeklyTimeSlots && (
                        <div>
                          {Object.keys(scheduleData[0].weeklyTimeSlots).map(
                            (day) => {
                              console.log("Day:", day); // Log each key (day) in the weeklyTimeSlots

                              // Ensure there are time slots for the day
                              const timeSlots =
                                scheduleData[0].weeklyTimeSlots[day];
                              if (!timeSlots || timeSlots.length === 0) {
                                console.warn(`No time slots for day: ${day}`); // Log a warning if no time slots exist
                                return null; // Skip rendering if there are no time slots
                              }

                              return (
                                <Card className="mb-2" key={day}>
                                  <div className="bg-[#DCDCDC] border-0 m-0 px-1 rounded-t-sm text-black">
                                    <span>
                                      {moment().day(day).format("dddd")}
                                    </span>{" "}
                                    {/* Display the weekday */}
                                  </div>

                                  {timeSlots.map((slot, idx) => {
                                    console.log("Slot for day", day, ":", slot); // Log each slot for the current day

                                    return (
                                      <div
                                        key={idx}
                                        className="flex justify-center w-full gap-2 my-2 px-2"
                                      >
                                        <div className="w-full">
                                          <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                            {addHoursToTime(slot.startTime, 0)}{" "}
                                            {/* Display start time */}
                                            <span className="bg-blue-500 text-white p-1 rounded-sm">
                                              $
                                              {parseFloat(
                                                slot.newPrice
                                              ).toFixed(2)}
                                            </span>
                                          </h3>
                                        </div>

                                        <span className="flex justify-center items-center text-gray-400">
                                          <FaArrowRightLong />
                                        </span>

                                        <div className="w-full">
                                          <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                            {addHoursToTime(slot.endTime, 0)}{" "}
                                            {/* Display end time */}
                                            {slot.revertPrice ? (
                                              <span className="bg-red-700 text-white p-1 rounded-sm">
                                                $
                                                {parseFloat(
                                                  slot.revertPrice
                                                ).toFixed(2)}
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
                                              handleEdit(
                                                scheduleData[0],
                                                "Weekly"
                                              )
                                            }
                                            className="bg-[#0662BB] py-1 px-1 rounded-sm"
                                          >
                                            <PenLine
                                              size={20}
                                              className="text-white"
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </Card>
                              );
                            }
                          )}
                        </div>
                      )}

                    {eventType === "monthly" &&
                      scheduleData[0]?.monthlyTimeSlots && (
                        <div>
                          {Object.keys(scheduleData[0].monthlyTimeSlots).map(
                            (date) => {
                              console.log("Day:", date); // Log each key (day) in the weeklyTimeSlots

                              // Ensure there are time slots for the day
                              const timeSlots =
                                scheduleData[0].monthlyTimeSlots[date];
                              if (!timeSlots || timeSlots.length === 0) {
                                console.warn(`No time slots for day: ${date}`); // Log a warning if no time slots exist
                                return null; // Skip rendering if there are no time slots
                              }

                              return (
                                <Card className="mb-2" key={date}>
                                  <div className="bg-[#DCDCDC] border-0 m-0 px-1 rounded-t-sm text-black">
                                    {getDateLabelFromNumber(date)}
                                    {/* Display the weekday */}
                                  </div>

                                  {timeSlots.map((slot, idx) => {
                                    console.log(
                                      "Slot for day",
                                      date,
                                      ":",
                                      slot
                                    ); // Log each slot for the current day

                                    return (
                                      <div
                                        key={idx}
                                        className="flex justify-center w-full gap-2 my-2 px-2"
                                      >
                                        <div className="w-full">
                                          <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                            {addHoursToTime(slot.startTime, 0)}{" "}
                                            {/* Display start time */}
                                            <span className="bg-blue-500 text-white p-1 rounded-sm">
                                              $
                                              {parseFloat(
                                                slot.newPrice
                                              ).toFixed(2)}
                                            </span>
                                          </h3>
                                        </div>

                                        <span className="flex justify-center items-center text-gray-400">
                                          <FaArrowRightLong />
                                        </span>

                                        <div className="w-full">
                                          <h3 className="flex text-sm justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                            {addHoursToTime(slot.endTime, 0)}{" "}
                                            {/* Display end time */}
                                            {slot.revertPrice ? (
                                              <span className="bg-red-700 text-white p-1 rounded-sm">
                                                $
                                                {parseFloat(
                                                  slot.revertPrice
                                                ).toFixed(2)}
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
                                              handleEdit(
                                                scheduleData[0],
                                                "Weekly"
                                              )
                                            }
                                            className="bg-[#0662BB] py-1 px-1 rounded-sm"
                                          >
                                            <PenLine
                                              size={20}
                                              className="text-white"
                                            />
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </Card>
                              );
                            }
                          )}
                        </div>
                      )}

                    {/* Single Day Schedule */}
                    {eventType === "single" && (
                      <div>
                        {/* <strong>Single Day Schedule:</strong>
                  <p>
                    Start: {new Date(schedule.startDate).toLocaleTimeString()},
                    End: {new Date(schedule.endDate).toLocaleTimeString()}
                  </p> */}

                        {scheduleData.map((sc, index) => (
                          <Card
                            className="flex justify-center w-full gap-2 mb-2 px-2 py-2"
                            key={sc.id}
                          >
                            <div key={index} className="w-full">
                              <h3 className="flex text-[12px] justify-between items-center bg-[#F5F5F5] rounded px-2 py-1">
                                {formatDateTime(sc.startDate)}
                                {sc.price && (
                                  <span className="bg-blue-500 text-[12px] text-white p-1 rounded-sm">
                                    ${sc?.price?.toFixed(2)}
                                  </span>
                                )}
                              </h3>
                            </div>
                            <span className="flex justify-center items-center text-gray-400">
                              <FaArrowRightLong />
                            </span>
                            {sc.endDate ? (
                              <div className="w-full">
                                <h3 className="flex justify-between text-[12px] items-center bg-[#F5F5F5] rounded px-2 py-1">
                                  {formatDateTime(sc.endDate)}
                                  {sc.currentPrice && (
                                    <span className="bg-red-700 text-[12px] text-white p-1 rounded-sm">
                                      ${sc?.currentPrice?.toFixed(2)}
                                    </span>
                                  )}
                                </h3>
                              </div>
                            ) : (
                              <div className="w-full">
                                <h3 className="text-red-400 font-semibold text-[14px] text-center px-2 py-[6px] rounded bg-[#F5F5F5]">
                                  <span className="">Until change back</span>
                                </h3>
                              </div>
                            )}
                            <div className="w-[20%] text-center flex justify-center items-start mt-1">
                              <button
                                onClick={() =>
                                  handleEdit(scheduleData[0], "Single")
                                }
                                className="bg-[#0662BB] py-1 px-1 rounded-sm"
                              >
                                <PenLine size={18} className="text-white" />
                              </button>
                            </div>
                          </Card> // Use a unique key
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No schedule data available.</p>
                )}
              </Modal.Body>
            </div>
          ) : (
            <div className="flex justify-center items-center h-[60vh]">
              <Loading></Loading>
            </div>
          )}
        </div>
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