import React, { useContext, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ButtonGroup, Button, Modal } from 'react-bootstrap';
import { PriceScheduleContext } from '../../contexts/PriceScheduleContext';
import UpdatePriceModal from '../Modal/UpdatePriceModal';
import ViewUpdatedListModal from '../Modal/ViewUpdatedListModal';

// Localizer for the calendar
const localizer = momentLocalizer(moment);

// Event Wrapper Component
function BoundEventWrapperComponent(app) {
  return class EventWrapperComponent extends React.Component {
    render() {
      // Style for positioning the event
      const style = {
        left: this.props.style.left + '%',
        top: this.props.style.top + '%',
        width: this.props.style.width + '%',
        height: this.props.style.height + '%',
        position: 'absolute',
      };

      return (
        <div onMouseOver={this.onEventWrapperDivMouseOver} style={style}>
          {this.props.children}
        </div>
      );
    }
  
    onEventWrapperDivMouseOver = (event) => {
      app.setState({ selected: this.props.event });
    };
  };
}

const CalendarView = () => {
  const { events } = useContext(PriceScheduleContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (date) => {
    setSelectedDate(date);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent(slotInfo);
    setShowOptionModal(true);
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

  return (
    <div style={{ padding: '20px', marginTop: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
        <ButtonGroup>
          <Button variant="secondary" onClick={() => handleViewChange(Views.MONTH)}>Month</Button>
          <Button variant="secondary" onClick={() => handleViewChange(Views.WEEK)}>Week</Button>
          <Button variant="secondary" onClick={() => handleViewChange(Views.DAY)}>Day</Button>
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
        views={['month', 'week', 'day']}
        view={view}
        date={selectedDate}
        onNavigate={handleNavigate}
        selectable
        onSelectSlot={handleSelectSlot}
        style={{ height: 'calc(100vh - 120px)' }}
        components={{
          eventWrapper: BoundEventWrapperComponent({
            setState: (state) => setSelectedEvent(state.selected),
          }),
        }}
      />
      <UpdatePriceModal show={showUpdateModal} onClose={handleCloseUpdateModal} event={selectedEvent} />
      <ViewUpdatedListModal show={showViewModal} onClose={handleCloseViewModal} />
      <Modal show={showOptionModal} onHide={handleCloseOptionModal}>
        <Modal.Header closeButton>
          <Modal.Title>Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Button variant='primary' onClick={handleUpdatePrice}>Update Price</Button>
          <Button variant='secondary' onClick={handleViewUpdatedList}>View Updated List</Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default CalendarView;
