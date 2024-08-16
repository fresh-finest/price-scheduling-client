import React, { useContext, useState } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import { MdOutlineUpdate } from "react-icons/md";
import ViewUpdatedListModal from "../Modal/ViewUpdatedListModal";
import "react-datepicker/dist/react-datepicker.css";
import { ButtonGroup, Button, Modal } from "react-bootstrap";
import { PriceScheduleContext } from "../../contexts/PriceScheduleContext";
import "./CalendarView.css";
import UpdatePriceModal from "../Modal/UpdatePriceModal";
import UpdatePriceByAsin from "../Modal/UpdatePriceByAsin"
import UpdateSchedulePrice from "../Modal/UpdateSchedulePrice"
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
  };


  const handleSelectSlot = (slotInfo) => {
    const calendarElement = document.querySelector('.rbc-calendar');
    const boundingRect = calendarElement.getBoundingClientRect();

    const top = slotInfo.box.y - boundingRect.top - 30;
    const left = slotInfo.box.x - boundingRect.left - 60;

    setSelectedEvent(slotInfo);
    setModalPosition({
      top: top,
      left: left,
    });
    setShowOptionModal(true);
  };

  return (
    <div style={{ padding: "20px", marginTop: "50px"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <ButtonGroup>
          <Button
            variant="secondary"
            onClick={() => handleViewChange(Views.MONTH)}
          >
            Month
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleViewChange(Views.WEEK)}
          >
            Week
          </Button>
        </ButtonGroup>
        <DatePicker
          selected={selectedDate}
          onChange={handleDateChange}
          showMonthYearPicker
          dateFormat="MM/yyyy"
          className="form-control"
        />
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
        style={{ height: "calc(100vh - 120px)" }}
      />
      <UpdateSchedulePrice
        show={showUpdateModal}
        onClose={handleCloseUpdateModal}
        event={selectedEvent}
      />
      {/* <ViewUpdatedListModal
        show={showViewModal}
        onClose={handleCloseViewModal}
      /> */}
      <Modal
        show={showOptionModal}
        onHide={handleCloseOptionModal}
        style={{
          top: `${modalPosition.top}px`,
          left: `${modalPosition.left}px`,
          position: "fixed",
          width:'400px',
          margin: 0
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Options</Modal.Title>
        </Modal.Header>
        <Modal.Body >
          <Button variant="primary" onClick={handleUpdatePrice}>
            <MdOutlineUpdate />
          </Button>
          <ViewUpdatedListModal />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CalendarView;
