'use client'

import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { EventInput } from '@fullcalendar/core'

interface StaffShiftCalendarProps {
  events: EventInput[]
}

const StaffShiftCalendar: React.FC<StaffShiftCalendarProps> = ({ events }) => {
  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek',
        }}
        events={events}
        locale="ja"
        buttonText={{
          today: '今日',
          month: '月',
          week: '週',
        }}
        eventTimeFormat={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }}
        height="auto"
        contentHeight="auto"
        aspectRatio={1.5}
        dayMaxEvents={true}
        weekends={true}
      />
      <style jsx global>{`
        .fc {
          border-radius: 0.5rem;
          border-width: 1px;
          border-color: hsl(var(--border));
          background-color: hsl(var(--card));
          color: hsl(var(--card-foreground));
        }
        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        .fc .fc-button {
          background-color: hsl(var(--primary));
          color: hsl(var(--primary-foreground));
          border: none;
          box-shadow: none;
        }
        .fc .fc-button:hover {
          background-color: hsl(var(--primary) / 0.9);
        }
        .fc .fc-button-primary:not(:disabled).fc-button-active,
        .fc .fc-button-primary:not(:disabled):active {
          background-color: hsl(var(--primary) / 0.8);
        }
        .fc .fc-daygrid-day.fc-day-today {
          background-color: hsl(var(--accent));
        }
        .fc-event {
          background-color: hsl(var(--secondary));
          border-color: hsl(var(--secondary));
          color: hsl(var(--secondary-foreground));
        }
        .fc-h-event {
          border-width: 1px;
        }
      `}</style>
    </div>
  )
}

export default StaffShiftCalendar
