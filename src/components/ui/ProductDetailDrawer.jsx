import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import axios from "axios";
import { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { LuPencilLine } from "react-icons/lu";
import { IoMdAdd } from "react-icons/io";
import { useSelector } from "react-redux";
import EditScheduleFromList from "../List/EditScheduleFromList";
import UpdatePriceFromList from "../List/UpdatePriceFromList";
import { MdClose } from "react-icons/md";

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

export function ProductDetailDrawer({
  isDrawerOpen,
  onDrawerClose,
  product,
  data,
}) {
  const [details, setDetails] = useState(null);
  const [list, setList] = useState(null);
  const [priceSchedule, setPriceSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editSchedule, setEditSchedule] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const [selectedAsin, setSelectedAsin] = useState("");
  const detailByAsin = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/details/${data.asin1}`);
      setDetails(response.data.payload);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const listByAsin = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/product/${data.asin1}`);
      setList(response.data.payload);
    } catch (error) {
      console.error("Error fetching list:", error);
    }
  };

  useEffect(() => {
    detailByAsin();
    listByAsin();
  }, [data.asin1]);

  if (!isDrawerOpen) return null;

  const hasDetails =
    details && details.AttributeSets && details.AttributeSets.length > 0;
  const title = hasDetails ? details.AttributeSets[0].Title : "Loading...";
  const rank = hasDetails ? details.SalesRankings?.[0]?.Rank : "N/A";
  const imageUrl = data.imageUrl || "";
  const amount =
    list?.[0]?.Product?.Offers?.[0]?.BuyingPrice?.ListingPrice?.Amount;

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
  // console.log(data.asin1);
  const ID = data.asin1;
  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const getData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/schedule/${ID}`);
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
    // console.log(priceSchedule);
    if (data.asin1) {
      getData();
    }

    return () => {
      controller.abort();
    };
  }, [data.asin1]);

  const handleEdit = (schedule) => {
    setEditSchedule(schedule);
  };

  const handleClose = () => {
    setEditSchedule(null);
  };

  const handleUpdate = async (asin, e) => {
    e.stopPropagation(); // Prevent row click from being triggered

    // onDrawerClose();

    if (!asin) {
      console.error("ASIN is not provided. Modal will not open.");
      return;
    }

    try {
      setSelectedAsin(data.asin1);
      setShowUpdateModal(true);
      setTimeout(() => {
        onDrawerClose();
      }, 3000);
      // setSelectedRowIndex(index);
      // Fetch product details and set the selected product
      // const response = await axios.get(`${BASE_URL}/details/${asin}`);
      // setSelectedProduct(response.data.payload);
      // const response2 = await axios.get(`${BASE_URL}/product/${asin}`);
      // setSelectedListing(response2.data);
    } catch (error) {
      console.error("Error fetching product details:", error.message);
    }
  };
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
      padding: "20px",
      boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
      width: "100%",
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
      overflowY: "scroll", // Enable vertical scrolling
      overflowX: "hidden",
    },
    table: {
      width: "100%",
      marginBottom: 0,
    },
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };
  const now = new Date();

  return (
    <>
      {showUpdateModal && (
        <UpdatePriceFromList
          show={showUpdateModal}
          onClose={handleCloseUpdateModal}
          asin={selectedAsin}
        />
      )}

      <Sheet open={isDrawerOpen}>
        {/* <Sheet open={isDrawerOpen} onOpenChange={onDrawerClose}> */}
        <SheetContent className="">
          <SheetHeader>
            {/* <SheetTitle></SheetTitle> */}
            <img className="w-40 mx-auto" src={imageUrl} alt={title} />
            <SheetDescription>{data.asin1}</SheetDescription>
            <p>{title}</p>
            <p>{rank}</p>
            <p>${amount}</p>
          </SheetHeader>
          {/* main content */}

          <Button
            // onClose
            style={{
              backgroundColor: "#5AB36D",

              paddingLeft: "20px",
              paddingRight: "20px",
              border: "none",
              // backgroundColor: selectedRowIndex === index ? "#d3d3d3" : "#5AB36D",
            }}
            onClick={(e) => handleUpdate(data.asin1, e)}
            disabled={!currentUser?.permissions?.write}
          >
            <IoMdAdd />
          </Button>
          <div>
            <h4 style={{ marginTop: "20px", fontWeight: "bold" }}>
              Schedule Details
            </h4>

            {priceSchedule.length > 0 ? (
              <div style={detailStyles.tableContainer}>
                <Table
                  striped
                  bordered
                  hover
                  size="sm"
                  style={detailStyles.table}
                >
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
                                backgroundColor: "#5AB36D",
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
              <p>No schedule available for this ASIN.</p>
            )}
          </div>
          <SheetFooter className="absolute top-1 right-2">
            <Button variant="outline" onClick={onDrawerClose} size="icon">
              <MdClose />
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      {editSchedule && (
        <EditScheduleFromList
          show={!!editSchedule}
          onClose={handleClose}
          asin={data.asin1}
          existingSchedule={editSchedule}
        />
      )}
    </>
  );
}
