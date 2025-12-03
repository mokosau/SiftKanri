'use client'

import React from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, DateClickArg } from '@fullcalendar/core'

interface RequestCalendarProps {
  events: EventInput[]
  onDateClick: (arg: DateClickArg) => void
}

const RequestCalendar: React.FC<RequestCalendarProps> = ({ events, onDateClick }) => {
  return (
    <div className="calendar-container">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth',
        }}
        events={events}
        dateClick={onDateClick}
        locale="ja"
        buttonText={{
          today: '今日',
          month: '月',
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
        .fc-event.available {
          background-color: #22C55E; /* green-500 */
          border-color: #22C55E;
        }
        .fc-event.unavailable {
          background-color: #EF4444; /* red-500 */
          border-color: #EF4444;
        }
        .fc-event.preferred_time {
            background-color: #3B82F6; /* blue-500 */
            border-color: #3B82F6;
        }
      `}</style>
    </div>
  )
}

export default RequestCalendar
