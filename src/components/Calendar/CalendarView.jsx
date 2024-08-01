import React, { useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-datepicker/dist/react-datepicker.css';
import { ButtonGroup, Button } from 'react-bootstrap';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const [events, setEvents] = useState([
    {
      title: 'Untitled',
      start: new Date(2024, 7, 29),
      end: new Date(2024, 7, 29),
      allDay: true,
      desc: 'Draft',
    },
    {
      title: 'Test BD',
      start: new Date(2024, 7, 29),
      end: new Date(2024, 7, 29),
      allDay: true,
      desc: 'Draft',
    },
    {
      title: 'First Email Cafe',
      start: new Date(2024, 7, 30),
      end: new Date(2024, 7, 30),
      allDay: true,
      desc: 'Draft',
    },
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [view, setView] = useState(Views.MONTH);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const handleNavigate = (date) => {
    setSelectedDate(date);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  return (
    <div style={{ padding: '20px' }}>
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
      <div style={{ height: 'calc(100vh - 120px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day']}
          view={view}
          date={selectedDate}
          onNavigate={handleNavigate}
          components={{
            event: ({ event }) => (
              <span>
                <strong>{event.title}</strong>
                <br />
                <span>{event.desc}</span>
              </span>
            ),
          }}
        />
      </div>
    </div>
  );
};

export default CalendarView;
