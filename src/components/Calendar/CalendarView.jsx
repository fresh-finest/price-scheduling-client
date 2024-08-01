import React, { useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const CalendarView = () => {
  const [events, setEvents] = useState([
    {
      title: 'Untitled',
      start: new Date(2024, 7, 29),
      end: new Date(2024, 7, 29),
      allDay: true,
      desc: 'Draft'
    },
    {
      title: 'Test BD',
      start: new Date(2024, 7, 29),
      end: new Date(2024, 7, 29),
      allDay: true,
      desc: 'Draft'
    },
    {
      title: 'First Email Cafe',
      start: new Date(2024, 7, 30),
      end: new Date(2024, 7, 30),
      allDay: true,
      desc: 'Draft'
    },
  ]);

  return (
    <div style={{ height: 'calc(100vh - 60px)', marginTop:"50px" }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month']}
        defaultView="month"
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
  );
};

export default CalendarView;
