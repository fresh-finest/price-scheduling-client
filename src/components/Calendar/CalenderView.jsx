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

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const { events } = useContext(PriceScheduleContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalPosition, setModalPosition] = useState({ top: 0, left: 0 });
  const [moreEvents, setMoreEvents] = useState([]); // State to store additional events
  const [showMoreModal, setShowMoreModal] = useState(false); // State to control more events modal\

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("Month");

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
    setShowOptionModal(true);
  };

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
    setShowOptionModal(true);
  };

  const goToPreviousDate = () => {
    const newDate = moment(selectedDate)
      .subtract(1, view === Views.MONTH ? "month" : "week")
      .toDate();
    setSelectedDate(newDate);
  };

  const goToNextDate = () => {
    const newDate = moment(selectedDate)
      .add(1, view === Views.MONTH ? "month" : "week")
      .toDate();
    setSelectedDate(newDate);
  };

  const handleMoreEventsClick = (eventsForDay) => {
    setMoreEvents(eventsForDay);
    setShowMoreModal(true);
  };

  return (
    <>
      <section className="">
        <div className="flex items-center justify-between  mt-[-0.5%]">
          {/* Left: Previous, Today, Next Buttons */}
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
            {/* Center: Month and Year */}
            <h3 className="text-2xl mx-3 mt-[-10px]" style={{ margin: 0 }}>
              {moment(selectedDate).format("MMMM YYYY")}
            </h3>
          </div>

          {/* calender page dropdown */}
          <div className="mr-[13%]">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[150px] justify-between px-1"
                >
                  {value}
                  <FaChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[150px] p-0">
                <Command>
                  <CommandList>
                    <CommandGroup>
                      {/* Month View */}
                      <CommandItem
                        value="Month"
                        onSelect={() => {
                          setValue("Month"); // Change the dropdown value
                          handleViewChange(Views.MONTH); // Trigger the view change
                          setOpen(false); // Close the dropdown
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === "Month" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Month
                      </CommandItem>

                      {/* Week View */}
                      <CommandItem
                        value="Week"
                        onSelect={() => {
                          setValue("Week"); // Change the dropdown value
                          handleViewChange(Views.WEEK); // Trigger the view change
                          setOpen(false); // Close the dropdown
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value === "Week" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        Week
                      </CommandItem>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div
          style={{
            padding: "20px",
            // marginTop: "20px",
            // border: "1px solid red",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            {/* Right: Dropdown for Views */}
            {/* <DropdownButton
            id="dropdown-basic-button"
            title={view.charAt(0).toUpperCase() + view.slice(1)}
          >
            <Dropdown.Item onClick={() => handleViewChange(Views.MONTH)}>
              Month
            </Dropdown.Item>
            <Dropdown.Item onClick={() => handleViewChange(Views.WEEK)}>
              Week
            </Dropdown.Item>
          </DropdownButton> */}
          </div>

          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            views={["month", "week"]}
            view={view}
            date={selectedDate}
            onNavigate={handleNavigate}
            selectable
            onSelectSlot={handleSelectSlot}
            onClickDay={handleDateClick}
            style={{
              height: "calc(100vh - 160px)",
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
                return { style: { backgroundColor: "#C2D2FB" } }; // Highlight today's date
                // return { style: { backgroundColor: "#eaf6ff" } }; // Highlight today's date
              }
            }}
            components={{
              toolbar: () => null, // Disable the default toolbar
            }}
            onDrillDown={(date, view) => handleNavigate(date, view)}
            onShowMore={(events, date) => handleMoreEventsClick(events)} // Handle "+X more" click
          />

          <UpdateSchedulePrice
            show={showUpdateModal}
            onClose={handleCloseUpdateModal}
            event={selectedEvent}
          />

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
              <Modal.Title>Options</Modal.Title>
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
