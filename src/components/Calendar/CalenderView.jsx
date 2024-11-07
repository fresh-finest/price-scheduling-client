import { useContext, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Modal, DropdownButton, Dropdown, ButtonGroup } from "react-bootstrap";
import { Button } from "@/components/ui/button";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import "./CalendarView.css";
// import ScheduleUpdate from "../Modal/SchdeuleUpdate";
import UpdateSchedulePrice from "../Modal/UpdateSchedulePrice";
import ViewUpdatedListModal from "../Modal/ViewUpdatedListModal";
import { MdOutlineAdd } from "react-icons/md";
import ContainerWidth from "../shared/ui/ContainerWidth";
import { ChevronRight, ChevronLeft } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaChevronDown } from "react-icons/fa";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ScheduleDetailsModal from "../Modal/ScheduleDetailsModal";
import ScheduleDetailsPopover from "../Modal/ScheduleDetailsPopover";

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const { events } = useContext(PriceScheduleContext);
  const { singleDayEvents, weeklyEvents, monthlyEvents } =
    useContext(PriceScheduleContext);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedScheduledEvent, setSelectedScheduledEvent] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [moreEvents, setMoreEvents] = useState([]); // State to store additional events
  const [showMoreModal, setShowMoreModal] = useState(false); // State to control more events modal\
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Month");

  console.log(showDetailsModal);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (date) => {
    setSelectedDate(date);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleCloseOptionModal = () => {
    setShowOptionModal(false);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
  };
  const handleCloseMoreModal = () => {
    setShowMoreModal(false);
  };

  const handleUpdatePrice = () => {
    setShowOptionModal(false);
    setShowUpdateModal(true);
  };

  const handleViewUpdatedList = () => {
    setShowOptionModal(false);
    setShowViewModal(true);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // setShowOptionModal(true);
    setShowUpdateModal(true);
  };

  const handleEventClick = (event) => {
    setSelectedScheduledEvent(event);
    setShowDetailsModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedScheduledEvent(null);
  };
  const allEvents = [
    ...singleDayEvents.map((event) => ({ ...event })),
    ...weeklyEvents.map((event) => ({ ...event })),
    ...monthlyEvents.map((event) => ({ ...event })),
  ];

  const handleSelectSlot = (slotInfo) => {
    const calendarElement = document.querySelector(".rbc-calendar");
    const boundingRect = calendarElement.getBoundingClientRect();

    const modalWidth = 400;
    const modalHeight = 200;

    let top = slotInfo.box.y - boundingRect.top - 30;
    let left = slotInfo.box.x - boundingRect.left - 60;

    // if (left + modalWidth > boundingRect.width) {
    //   left = boundingRect.width - modalWidth - 50;
    // }

    if (top + modalHeight > boundingRect.height) {
      top = boundingRect.height - modalHeight - 90;
    }

    setSelectedDate(slotInfo.start); // Set the selected date when slot is selected
    setSelectedEvent(slotInfo);
    setModalPosition({
      top: top,
      left: left,
    });
    // setShowOptionModal(true);
    setShowUpdateModal(true);
  };

  const goToPreviousDate = () => {
    const newDate = moment(selectedDate)
      .subtract(
        1,
        view === Views.MONTH ? "month" : view === Views.WEEK ? "week" : "day"
      )
      .toDate();
    setSelectedDate(newDate);
  };

  const goToNextDate = () => {
    const newDate = moment(selectedDate)
      .add(
        1,
        view === Views.MONTH ? "month" : view === Views.WEEK ? "week" : "day"
      )
      .toDate();
    setSelectedDate(newDate);
  };

  const handleMoreEventsClick = (eventsForDay) => {
    setMoreEvents(eventsForDay);
    setShowMoreModal(true);
  };

  // console.log("selected date", selectedDate);
  const EventWithImage = ({ event }) => {
    console.log("event", event);
    return (
      <div
        className="event-container"
        style={{ display: "flex", alignItems: "center" }}
      >
        {event.image && (
          <img
            src={event.image}
            alt="Event"
            style={{
              width: "30px",
              height: "30px",
              marginRight: "8px",
            }}
          />
        )}
        <div className="flex justify-center items-center gap-1">
        <p>${parseFloat(event?.price).toFixed(2)}</p>

          <p>-</p>
          <p className="capitalize">{event?.eventType}</p>

          {/* <p style={{ margin: "0" }}>
            {event?.productName?.split(" ").slice(0, 10).join(" ") +
              (event?.productName?.split(" ").length > 10 ? "..." : "")}
          </p> */}
        </div>
      </div>
    );
  };

  console.log("selected event: " + JSON.stringify(selectedScheduledEvent));
  const eventsToShow =
    view === Views.WEEK
      ? weeklyEvents
      : view === Views.MONTH
      ? monthlyEvents
      : singleDayEvents;

  // const eventsToShow = () => {
  //   if (view === Views.WEEK) {
  //     return weeklyEvents; // Show only weekly events in week view
  //   } else if (view === Views.MONTH) {
  //     return monthlyEvents; // Show only monthly events in month view
  //   } else {
  //     return singleDayEvents; // Show single-day events for day view
  //   }
  // };

  return (
    <>
      <section className="">
        <div className="flex items-center justify-between  mt-[-0.5%] mb-[10px]">
          <div className="flex items-center justify-start">
            <Button
              onClick={() => handleNavigate(new Date())}
              variant="outline"
              className="text-sm px-3 "
            >
              Today
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full p-1 w-8 h-8 flex justify-center items-center ml-5"
                    onClick={goToPreviousDate}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Previous Month</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="rounded-full p-1 w-8 h-8 flex justify-center items-center"
                    onClick={goToNextDate}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Next Month</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <h3 className="text-2xl mx-3 mt-[-10px]" style={{ margin: 0 }}>
              {value === "Month"
                ? moment(selectedDate).format("MMMM YYYY")
                : value === "Week"
                ? `${moment(selectedDate)
                    .startOf("week")
                    .format("MMMM D")} - ${moment(selectedDate)
                    .endOf("week")
                    .format("MMMM D, YYYY")}`
                : moment(selectedDate).format("MMMM D, YYYY")}
            </h3>
          </div>

          <div className="mr-[17%] flex space-x-2">
            <Button
              variant="outline"
              className={`w-[80px]  justify-center ${
                value === "Month"
                  ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
                  : ""
              }`}
              onClick={() => {
                setValue("Month");
                handleViewChange(Views.MONTH);
              }}
            >
              Month
            </Button>

            <Button
              variant="outline"
              className={`w-[80px] justify-center ${
                value === "Week"
                  ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
                  : ""
              }`}
              onClick={() => {
                setValue("Week");
                handleViewChange(Views.WEEK);
              }}
            >
              Week
            </Button>

            <Button
              variant="outline"
              className={`w-[80px] justify-center ${
                value === "Day"
                  ? "bg-[#007BFF] text-white hover:bg-[#007BFF] border-[#007BFF]"
                  : ""
              }`}
              onClick={() => {
                setValue("Day");
                handleViewChange(Views.DAY);
              }}
            >
              Day
            </Button>
          </div>
        </div>

        <div
          style={
            {
              // padding: "20px",
              // marginTop: "20px",
              // border: "1px solid red",
            }
          }
        >
          <Calendar
            localizer={localizer}
            events={allEvents}
            // events={allEvents}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week", "day"]}
            view={view}
            date={selectedDate}
            onNavigate={handleNavigate}
            onSelectEvent={handleEventClick}
            selectable
            onSelectSlot={handleSelectSlot}
            onClickDay={handleDateClick}
            style={{
              height: "93vh",
              width: "100%",
              fontSize: "16px",
              borderRadius: "10px",
            }}
            dayPropGetter={(date) => {
              const today = new Date();
              if (
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear()
              ) {
                return { style: { backgroundColor: "#C2D2FB" } };
              }
            }}
            components={{
              toolbar: () => null, // default calender navigation button turns off
              event: EventWithImage,
            }}
            onDrillDown={(date, view) => handleNavigate(date, view)}
            onShowMore={(events, date) => handleMoreEventsClick(events)} // Handle "+X more" click
          />

          <UpdateSchedulePrice
            show={showUpdateModal}
            onClose={handleCloseUpdateModal}
            event={selectedEvent}
            selectedDate={selectedDate}
          />
          {selectedScheduledEvent && (
            <ScheduleDetailsModal
              show={showDetailsModal}
              onClose={handleCloseModal}
              sku={selectedScheduledEvent?.sku}
              selectedDate={selectedScheduledEvent?.start}
              eventType={selectedScheduledEvent?.eventType}
              weekly={selectedScheduledEvent?.weekly}
              monthly={selectedScheduledEvent?.monthly}
            />
          )}
          {/* {selectedScheduledEvent && (
            <ScheduleDetailsPopover
              show={showDetailsModal}
              onClose={handleCloseModal}
              sku={selectedScheduledEvent?.sku}
              selectedDate={selectedScheduledEvent?.start}
              eventType={selectedScheduledEvent?.eventType}
            />
          )} */}

          <Modal
            show={showOptionModal}
            onHide={handleCloseOptionModal}
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              position: "fixed",
              width: "400px",
              margin: 0,
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {/* Options{" "} */}
                {new Date(selectedDate).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}{" "}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Button
                style={{ backgroundColor: "#50C878" }}
                onClick={handleUpdatePrice}
              >
                <MdOutlineAdd />
              </Button>
              {selectedDate && (
                <ViewUpdatedListModal selectedDate={selectedDate} />
              )}
            </Modal.Body>
          </Modal>

          <Modal
            show={showMoreModal}
            onHide={handleCloseMoreModal}
            style={{
              top: `${modalPosition.top}px`,
              left: `${modalPosition.left}px`,
              position: "fixed",
              width: "300px",
              margin: 0,
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>More Events</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <ul>
                {moreEvents.map((event, index) => (
                  <li key={index}>{event.title}</li>
                ))}
              </ul>
            </Modal.Body>
          </Modal>
        </div>
      </section>
    </>
  );
};

export default CalendarView;