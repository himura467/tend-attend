import { Card, CardContent } from "@/components/ui/card";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import React from "react";

interface CalendarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events: any[];
  onEventClick: (eventInfo: EventClickArg) => void;
}

export const Calendar = ({ events, onEventClick }: CalendarProps): React.JSX.Element => {
  const handleEventClick = (eventInfo: EventClickArg): void => {
    if (eventInfo.event.extendedProps.originalId) {
      eventInfo.event.setProp("id", eventInfo.event.extendedProps.originalId);
    }
    onEventClick(eventInfo);
  };

  return (
    <Card>
      <CardContent className="p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, rrulePlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          eventClick={handleEventClick}
          height="auto"
        />
      </CardContent>
    </Card>
  );
};
