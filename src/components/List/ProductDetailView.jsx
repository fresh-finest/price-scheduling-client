import React, { useEffect, useState } from "react";
import { Card, Table, Button } from "react-bootstrap";
import { LuPencilLine } from "react-icons/lu";
import axios from "axios";
import { useSelector } from "react-redux";

import EditScheduleFromList from "./EditScheduleFromList";

import { daysOptions, datesOptions } from "../../utils/staticValue";
import priceoboIcon from "../../assets/images/pricebo-icon.png";

// const BASE_URL = `https://api.priceobo.com`;

const BASE_URL ='http://localhost:3000'
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

// function addHoursToTime(timeString, hoursToAdd) {
//   const [hours, minutes] = timeString.split(":").map(Number);
//   const newHours = (hours + hoursToAdd) % 24;
//   const formattedHours = newHours < 10 ? `0${newHours}` : newHours;
//   return `${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`;
// }
/*
function addHoursToTime(timeString, hoursToAdd) {
  if (!timeString || typeof timeString !== "string") {
    console.error("Invalid timeString:", timeString);
    return "Invalid Time"; // Return a default value or handle it gracefully
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  const newHours = (hours + hoursToAdd) % 24; // Ensures the hour stays in 24-hour format
  const formattedHours = newHours < 10 ? `0${newHours}` : newHours; // Add leading zero if necessary
  return `${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`; // Add leading zero to minutes if necessary
}*/
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


const getDayLabelFromNumber = (dayNumber) => {
  return dayNames[dayNumber] || "";
};
const getDateLabelFromNumber = (dateNumber) => {
  return dateNames[dateNumber - 1] || `Day ${dateNumber}`; // Fallback if dateNumber is out of range
};
/*
const displayTimeSlotsWithDayLabels = (
  timeSlots,
  addHours = 0,
  isWeekly = false
) => {
  return Object.entries(timeSlots).map(([key, slots]) => (
    <div key={key}>
      <strong>
        {isWeekly
          ? getDayLabelFromNumber(Number(key))
          : getDateLabelFromNumber(Number(key))}
      </strong>
      {slots.map((slot, index) => (
        <p key={index}>
          {addHoursToTime(slot.startTime, addHours)} -{" "}
          {addHoursToTime(slot.endTime, addHours)}
        </p>
      ))}
    </div>
  ));
};*/
const displayTimeSlotsWithDayLabels = (timeSlots, addHours = 0, isWeekly = false) => {
  return Object.entries(timeSlots).map(([key, slots]) => (
    <div key={key}>
      <strong>
        {isWeekly
          ? getDayLabelFromNumber(Number(key))
          : getDateLabelFromNumber(Number(key))}
      </strong>
      {slots.map((slot, index) => (
        <p key={index}>
          {addHoursToTime(slot.startTime, addHours)} -{" "}
          {addHoursToTime(slot.endTime, addHours)}
        </p>
      ))}
    </div>
  ));
};

const ProductDetailView = ({ product, listing, asin, sku1, price }) => {
  console.log("sk1", sku1);
  if (!product.AttributeSets) {
    return <p>Product data is not available for this ASIN.</p>;
  }
  const [priceSchedule, setPriceSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);
  const [weeklyLength,setWeeklyLength]=useState(null)

  const { currentUser } = useSelector((state) => state.user);

  const userName = currentUser?.userName || "";

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

  const getDayLabels = (daysOfWeek) => {
    return daysOfWeek
      .map((day) => daysOptions.find((option) => option.value === day)?.label)
      .join(", ");
  };
  const getDateLabels = (datesOfMonth) => {
    return datesOfMonth
      .map(
        (date) => datesOptions.find((option) => option.value === date)?.label
      )
      .join(", ");
  };

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const getData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/schedule/${sku1}`);
        const sortedData = response.data.result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setPriceSchedule(sortedData);

        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }

        const data = await response.json();
        setPriceSchedule(data.result || []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching data:", err);
          setError("Error fetching schedule data.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (asin) {
      getData();
    }

    return () => {
      controller.abort();
    };
  }, [asin]);

  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
  };

  const handleClose = () => {
    setEditSchedule(null);
  };

  // if (loading) {
  //   return (
  //     <div
  //       style={{
  //         // marginTop: "100px",
  //         paddingTop: "30px",
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "85vh",
  //         padding: "20px",
  //         width: "100%",
  //         boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  //         textAlign: "center",
  //       }}
  //     >
  //       {/* <Spinner animation="border" /> Loading... */}
  //       <img
  //         style={{ width: "30px", marginRight: "6px" }}
  //         className="animate-pulse"
  //         src={priceoboIcon}
  //         alt="Priceobo Icon"
  //       />
  //       <br />

  //       <div className="block">
  //         <p className="text-base"> Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // const price = listing?.payload?.[0]?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice;
  // const offer = listing?.payload?.[0]?.Product?.Offers?.[0];
  // const price = offer?.BuyingPrice?.ListingPrice;
  // const sellerSKU = offer?.SellerSKU;
  // const amount = product?.AttributeSets[0]?.ListPrice?.Amount;

  const detailStyles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
    },
    image: {
      width: "90px",
      maxHeight: "90px",
      objectFit: "contain",
      marginBottom: "10px",
      marginRight: "20px",
    },
    card: {
      // padding: "20px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      height: "91.2vh",
      width: "100%",
      borderRadius: "2px",
    },
    title: {
      fontSize: "16px",
      marginBottom: "15px",
      textAlign: "left",
    },
    info: {
      fontSize: "14px",
      marginBottom: "5px",
      marginLeft: "10px",
    },
    tableContainer: {
      marginTop: "20px",
      width: "100%",
      maxHeight: "420px", // Set a max height for the table container
      // overflowY: "scroll", // Enable vertical scrolling
      overflowX: "hidden",
      padding: "20px",
    },
    table: {
      width: "100%",
      marginBottom: 0,
    },
  };

  const now = new Date();
  const countActiveSingleDaySchedules = () => {
    return priceSchedule.filter(
      (sc) =>
        sc.status !== "deleted" &&
        !sc.weekly &&
        !sc.monthly && // Ensure it's not weekly or monthly
        sc.startDate && // Ensure there's a start date
        (!sc.endDate || new Date(sc.endDate) >= now) // Either no end date or end date is in the future
    ).length;
  };
  const getFilteredWeeklySlotLength = (priceSchedule) => {
    return priceSchedule
      .filter(
        (sc) =>
          sc.status !== "deleted" && sc.weekly // Filter for weekly schedules
      )
      .reduce(
        (totalSlots, sc) => totalSlots +  Object.values(sc.weeklyTimeSlots).reduce(
          (acc, slots) => acc + slots.length,
          0
        ),
        0
      );
  };
  const getFilteredMonthlySlotLength = (priceSchedule) => {
    return priceSchedule
      .filter(
        (sc) =>
          sc.status !== "deleted" && sc.monthly // Filter for monthly schedules
      )
      .reduce(
        (totalSlots, sc) =>
          totalSlots + Object.values(sc.monthlyTimeSlots).reduce(
            (acc, slots) => acc + slots.length,
            0
          ),
        0
      );
  };
  const singleDayLength = countActiveSingleDaySchedules()
  const weeklySlotLength = getFilteredWeeklySlotLength(priceSchedule);

  const monthlySlotLength = getFilteredMonthlySlotLength(priceSchedule);

  return (
    <div style={{ width: "100%", paddingTop: "10px" }}>
      <Card style={detailStyles.card} className=" p-0">
        {loading ? (
          <div
            style={{
              // marginTop: "100px",
              paddingTop: "30px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "90vh",
              padding: "20px",
              width: "100%",
              textAlign: "center",
            }}
          >
            {/* <Spinner animation="border" /> Loading... */}
            <img
              style={{ width: "30px", marginRight: "6px" }}
              className="animate-pulse"
              src={priceoboIcon}
              alt="Priceobo Icon"
            />
            <br />

            <div className="block">
              <p className="text-base"> Loading...</p>
            </div>
          </div>
        ) : (
          <Card.Body className="p-0">
            <div>
              <div className="border-b-2 mb-2 bg-[#F6F6F8] ">
                <h2 className="py-[6px] text-center text-sm">
                  Schedule Details
                </h2>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  margin: "10px",
                  padding: "10px",
                }}
              >
                <Card.Img
                  variant="top"
                  src={product?.AttributeSets[0]?.SmallImage?.URL}
                  style={detailStyles.image}
                />
                <Card.Title style={detailStyles.title}>
                  {product?.AttributeSets[0]?.Title}
                </Card.Title>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginLeft: "40px",
                }}
              >
                <Card.Text style={detailStyles.info}>
                  <strong>ASIN:</strong>{" "}
                  {product?.Identifiers?.MarketplaceASIN?.ASIN}
                </Card.Text>
                <Card.Text style={detailStyles.info}>
                  <strong>SKU:</strong> {sku1}
                </Card.Text>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginLeft: "40px",
                }}
              >
                <Card.Text style={detailStyles.info}>
                  <strong>Price:</strong> ${price}
                </Card.Text>
                <Card.Text style={detailStyles.info}>
                  <strong>BSR:</strong>{" "}
                  {product?.SalesRankings?.[0]?.Rank
                    ? product?.SalesRankings[0]?.Rank
                    : "N/A"}
                </Card.Text>
              </div>

              <hr
                style={{ width: "90%", margin: "0 auto", marginTop: "10px" }}
              />
            </div>

            {priceSchedule.length > 0 ? (
              <div style={detailStyles.tableContainer}>
                <Table striped bordered size="sm" style={detailStyles.table}>
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {priceSchedule
                      .filter(
                        (sc) =>
                          sc.status !== "deleted" &&
                          (sc.weekly ||
                            sc.monthly ||
                            sc.endDate === null ||
                            (sc.endDate && new Date(sc.endDate) >= now))
                      )

                      .map((sc) => (
                        <tr key={sc._id}>
                          {sc.weekly ? (
                            <>
                             
                            {weeklySlotLength} slot 
                            <td style={{ width: "200px" }} colSpan={2}>
                          
                             
                              {Object.keys(sc.weeklyTimeSlots)
                                .map((day) => getDayLabelFromNumber(day))
                                .join(", ")}{" "}
                              {displayTimeSlotsWithDayLabels(
                                sc.weeklyTimeSlots,
                                6,
                                true
                              )}
                              {/* <span style={{ color: "green" }}>
                                    {" "}
                                    ${sc.price}
                                  </span>{" "}
                                  {}{" "}
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    ${sc.currentPrice}
                                  </span> */}
                            </td>
                            </>
                          ) : sc.monthly ? (
                            <>
                          
                              <td style={{ width: "200px" }} colSpan={2}>
                              {monthlySlotLength} slot for  Monthly on{" "}
                                {Object.keys(sc.monthlyTimeSlots)
                                  .map((date) => getDateLabelFromNumber(date))
                                  .join(", ")}{" "}
                                {displayTimeSlotsWithDayLabels(
                                  sc.monthlyTimeSlots,
                                  6,
                                  false
                                )}
                                {/* <span style={{ color: "green" }}>
                                    {" "}
                                    ${sc.price}
                                  </span>{" "}
                                  {}{" "}
                                  <span style={{ color: "green" }}>
                                    {" "}
                                    ${sc.currentPrice}
                                  </span>        */}
                              </td>
                            </>
                          ) : (
                            <>
                            <strong>slot</strong> {singleDayLength}
                              <td style={{ width: "200px" }}>
                                {formatDateTime(sc.startDate)}{" "}
                                <span style={{ color: "green" }}>
                                  Changed Price: ${sc.price.toFixed(2)}
                                </span>
                              </td>
                              <td style={{ width: "200px" }}>
                                {sc.endDate ? (
                                  <>
                                    {formatDateTime(sc.endDate)}
                                    {sc.currentPrice && (
                                      <div style={{ color: "green" }}>
                                        Reverted Price: ${sc.currentPrice.toFixed(2)}
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <span style={{ color: "red" }}>
                                    Until Changed
                                  </span>
                                )}
                              </td>
                            </>
                          )}
                          <td>
                            <Button
                              style={{
                                marginTop: "20px",
                                backgroundColor: "#0D6EFD",
                                border: "none",
                              }}
                              onClick={() => handleEdit(sc)}
                              disabled={
                                (!sc.weekly &&
                                  !sc.monthly &&
                                  sc.endDate != null &&
                                  (sc.endDate && new Date(sc.endDate)) < now) ||
                                !currentUser?.permissions?.write
                              } // Disable button if endDate is in the past
                            >
                              <LuPencilLine />
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <p style={{ margin: "20px" }}>
                No schedule available for this ASIN.
              </p>
            )}
          </Card.Body>
        )}
      </Card>

      {editSchedule && (
        <EditScheduleFromList
          show={!!editSchedule}
          onClose={handleClose}
          asin={asin}
          existingSchedule={editSchedule}
        />
      )}
    </div>
  );
};

export default ProductDetailView;