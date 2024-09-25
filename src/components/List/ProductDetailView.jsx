import React, { useEffect, useState } from "react";
import { Card, Table, Button } from "react-bootstrap";
import { LuPencilLine } from "react-icons/lu";
import { PiWarehouse } from "react-icons/pi";
import axios from "axios";
import { useSelector } from "react-redux";

import EditScheduleFromList from "./EditScheduleFromList";

import { daysOptions, datesOptions } from "../../utils/staticValue";
import priceoboIcon from "../../assets/images/pricebo-icon.png";
import { MdCheck } from "react-icons/md";
import { BsClipboardCheck } from "react-icons/bs";
import { FaRankingStar } from "react-icons/fa6";

const BASE_URL = `https://api.priceobo.com`;

// const BASE_URL ='http://localhost:3000'
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
function addHoursToTime(timeString, hoursToAdd) {
  if (!timeString || typeof timeString !== "string") {
    console.error("Invalid timeString:", timeString);
    return "Invalid Time"; // Return a default value or handle it gracefully
  }

  const [hours, minutes] = timeString.split(":").map(Number);
  const newHours = (hours + hoursToAdd) % 24; // Ensures the hour stays in 24-hour format
  const formattedHours = newHours < 10 ? `0${newHours}` : newHours; // Add leading zero if necessary
  return `${formattedHours}:${minutes < 10 ? `0${minutes}` : minutes}`; // Add leading zero to minutes if necessary
}

const getDayLabelFromNumber = (dayNumber) => {
  return dayNames[dayNumber] || "";
};
const getDateLabelFromNumber = (dateNumber) => {
  return dateNames[dateNumber - 1] || `Day ${dateNumber}`; // Fallback if dateNumber is out of range
};
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
};
const ProductDetailView = ({
  product,
  listing,
  asin,
  sku1,
  price,
  fnSku,
  channelStockValue,
  fulfillmentChannel,
}) => {
  console.log("product", product);
  if (!product.AttributeSets) {
    return <p>Product data is not available for this ASIN.</p>;
  }
  const [priceSchedule, setPriceSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);

  const [copiedAsinIndex, setCopiedAsinIndex] = useState(null);
  const [copiedSkuIndex, setCopiedSkuIndex] = useState(null);
  const [copiedfnSkuIndex, setCopiedfnSkuIndex] = useState(null);

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
        const response = await axios.get(`${BASE_URL}/api/schedule/${asin}`);
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

  const handleCopy = (text, type) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        if (type === "asin") {
          setCopiedAsinIndex(text);
          setTimeout(() => setCopiedAsinIndex(null), 2000);
        } else if (type === "sku") {
          setCopiedSkuIndex(text);
          setTimeout(() => setCopiedSkuIndex(null), 2000);
        } else {
          setCopiedfnSkuIndex(text);
          setTimeout(() => setCopiedfnSkuIndex(null), 2000);
        }
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
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
      width: "50px",
      maxHeight: "50px",
      objectFit: "contain",
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
      fontSize: "14px",
      textAlign: "left",
      fontWeight: "normal",
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
                  margin: "0 10px",
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

              <div className="grid grid-cols-[60px_auto_auto_auto]  mx-[10px] gap-2">
                <div
                  style={{ borderRadius: "3px", height: "30px" }}
                  className="row-span-2 bg-blue-500 text-white flex justify-center items-center  "
                >
                  <h2 style={{ fontSize: "13px" }}>${price}</h2>
                </div>

                <div>
                  <span
                    className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
                    style={{
                      cursor: "pointer",
                      // display: "inline-flex",
                      // alignItems: "stretch",
                    }}
                  >
                    {asin}{" "}
                    {copiedAsinIndex ? (
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
                          handleCopy(asin, "asin");
                        }}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      />
                    )}
                  </span>
                </div>
                <div>
                  <span
                    className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
                    style={{
                      cursor: "pointer",
                      // display: "inline-flex",
                      // alignItems: "stretch",
                    }}
                  >
                    {sku1}{" "}
                    {copiedSkuIndex ? (
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
                          handleCopy(sku1, "sku");
                        }}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      />
                    )}
                  </span>
                </div>
                <div>
                  <span
                    className="border flex justify-around items-center text-xs px-[7px] py-[5px] text-[#505050]"
                    style={{
                      cursor: "pointer",
                      // display: "inline-flex",
                      // alignItems: "stretch",
                    }}
                  >
                    {fnSku}{" "}
                    {copiedfnSkuIndex ? (
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
                          handleCopy(fnSku, "fnSku");
                        }}
                        style={{
                          marginLeft: "10px",
                          cursor: "pointer",
                          fontSize: "16px",
                        }}
                      />
                    )}
                  </span>
                </div>
                <div className="text-left text-[#505050]">
                  <p className="flex justify-center items-center  gap-2 text-xs">
                    <FaRankingStar style={{ fontSize: "16px" }} />{" "}
                    {product?.SalesRankings?.[0]?.Rank
                      ? "#" +
                        new Intl.NumberFormat().format(
                          product.SalesRankings[0].Rank
                        )
                      : "N/A"}
                  </p>
                </div>
                <div className="text-center text-xs text-[#505050]">
                  <p className="flex justify-center items-center gap-2 text-xs">
                    {" "}
                    <PiWarehouse style={{ fontSize: "16px" }} />
                    {new Intl.NumberFormat().format(channelStockValue)}
                  </p>
                </div>
                <div className="text-center text-xs text-[#505050]">
                  <span>
                    {fulfillmentChannel === "DEFAULT" ? "FBM" : "FBA"}
                  </span>
                </div>
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
                            <td style={{ width: "200px" }} colSpan={2}>
                              Weekly on{" "}
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
                          ) : sc.monthly ? (
                            <>
                              <td style={{ width: "200px" }} colSpan={2}>
                                Monthly on{" "}
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
                              <td style={{ width: "200px" }}>
                                {formatDateTime(sc.startDate)}{" "}
                                <span style={{ color: "green" }}>
                                  Changed Price: ${sc.price}
                                </span>
                              </td>
                              <td style={{ width: "200px" }}>
                                {sc.endDate ? (
                                  <>
                                    {formatDateTime(sc.endDate)}
                                    {sc.currentPrice && (
                                      <div style={{ color: "green" }}>
                                        Reverted Price: ${sc.currentPrice}
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
