import { Card, CardContent } from "@/components/ui/card";
import { useTimezone } from "@/hooks/useTimezone";
import { TZDate } from "@/lib/utils/tzdate";
import { EventClickArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import rrulePlugin from "@fullcalendar/rrule";
import timeGridPlugin from "@fullcalendar/timegrid";
import React from "react";

interface CalendarProps {
  events: any[];
  onEventClick: (eventInfo: { id: string; start: TZDate; end: TZDate; title: string; allDay: boolean }) => void;
}

export const Calendar = ({ events, onEventClick }: CalendarProps): React.JSX.Element => {
  const timezone = useTimezone();

  const handleEventClick = (eventInfo: EventClickArg): void => {
    const eventId = eventInfo.event.extendedProps.originalId || eventInfo.event.id;
    const start = eventInfo.event.start;
    const end = eventInfo.event.end;
    const title = eventInfo.event.title;
    const allDay = eventInfo.event.allDay;

    if (eventId && start && end) {
      onEventClick({
        id: eventId,
        start: new TZDate(start, timezone),
        end: new TZDate(end, timezone),
        title,
        allDay,
      });
    }
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
