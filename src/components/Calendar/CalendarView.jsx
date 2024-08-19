import React, { useContext, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Button, Modal, DropdownButton, Dropdown, ButtonGroup } from "react-bootstrap";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import "./CalendarView.css";
import UpdateSchedulePrice from "../Modal/UpdateSchedulePrice";
import ViewUpdatedListModal from "../Modal/ViewUpdatedListModal";
import { IoAddSharp } from "react-icons/io5";

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
    const calendarElement = document.querySelector('.rbc-calendar');
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
      left:left,
    });
    setShowOptionModal(true);
  };

  const goToPreviousDate = () => {
    const newDate = moment(selectedDate).subtract(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setSelectedDate(newDate);
  };

  const goToNextDate = () => {
    const newDate = moment(selectedDate).add(1, view === Views.MONTH ? 'month' : 'week').toDate();
    setSelectedDate(newDate);
  };

  const handleMoreEventsClick = (eventsForDay) => {
    setMoreEvents(eventsForDay);
    setShowMoreModal(true);
  };

  return (
    <div style={{ padding: "20px", marginTop: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        {/* Left: Previous, Today, Next Buttons */}
        <ButtonGroup>
          <Button variant="outline-primary" onClick={goToPreviousDate}>
            &lt;
          </Button>
          <Button variant="outline-primary" onClick={() => handleNavigate(new Date())}>
            Today
          </Button>
          <Button variant="outline-primary" onClick={goToNextDate}>
            &gt;
          </Button>
        </ButtonGroup>

        {/* Center: Month and Year */}
        <h3 style={{ margin: 0 }}>
          {moment(selectedDate).format("MMMM YYYY")}
        </h3>

        {/* Right: Dropdown for Views */}
        <DropdownButton id="dropdown-basic-button" title={view.charAt(0).toUpperCase() + view.slice(1)}>
          <Dropdown.Item onClick={() => handleViewChange(Views.MONTH)}>Month</Dropdown.Item>
          <Dropdown.Item onClick={() => handleViewChange(Views.WEEK)}>Week</Dropdown.Item>
        </DropdownButton>
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
        style={{ height: "calc(100vh - 20px)",width:"100%", fontSize: '16px', borderRadius: '10px' }}
        dayPropGetter={(date) => {
          const today = new Date();
          if (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            return { style: { backgroundColor: '#eaf6ff' } }; // Highlight today's date
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
          width: '400px',
          margin: 0
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Options</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <Button variant="primary" onClick={handleUpdatePrice}>
            <IoAddSharp />
          </Button>
          {selectedDate && <ViewUpdatedListModal selectedDate={selectedDate} />}
        </Modal.Body>
      </Modal>
      <Modal show={showMoreModal} onHide={handleCloseMoreModal}
       style={{
          top: `${modalPosition.top}px`,
          left: `${modalPosition.left}px`,
          position: "fixed",
          width: '300px',
          margin: 0
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
  );
};

export default CalendarView;
