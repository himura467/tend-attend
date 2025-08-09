"use client";

import { Calendar } from "@/components/organisms/shared/events/Calendar";
import { CreateEventForm, formSchema } from "@/components/organisms/specific/events/edit/CreateEventForm";
import { createEvent, getMyEvents } from "@/lib/api/events";
import { getCurrentYmdDate, parseYmdDate, parseYmdHm15Date } from "@/lib/utils/date";
import { Event, mapEventsToFullCalendar } from "@/lib/utils/fullcalendar";
import { applyTimezone } from "@/lib/utils/timezone";
import { addDays, startOfDay } from "date-fns";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

export const EditEventsCalendarForm = (): React.JSX.Element => {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [startDate, setStartDate] = React.useState<Date>(getCurrentYmdDate(new Date()));
  const [endDate, setEndDate] = React.useState<Date>(addDays(getCurrentYmdDate(new Date()), 1));
  const [isAllDay, setIsAllDay] = React.useState<boolean>(true);
  const [recurrences, setRecurrences] = React.useState<string[]>([]);
  const [timezone, setTimezone] = React.useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);

  const fetchEvents = React.useCallback(async () => {
    try {
      const response = await getMyEvents();
      if (response.error_codes.length === 0) {
        setEvents(
          response.events.map((event) => {
            const dtstart = new Date(Date.parse(event.dtstart));
            const dtend = new Date(Date.parse(event.dtend));

            return {
              id: event.id,
              summary: event.summary,
              location: event.location,
              dtstart: event.is_all_day
                ? parseYmdDate(dtstart, "UTC", event.timezone)
                : parseYmdHm15Date(dtstart, "UTC", event.timezone),
              dtend: event.is_all_day
                ? parseYmdDate(dtend, "UTC", event.timezone)
                : parseYmdHm15Date(dtend, "UTC", event.timezone),
              isAllDay: event.is_all_day,
              recurrences: event.recurrence_list,
              timezone: event.timezone,
            };
          }),
        );
      } else {
        toast.error("Failed to fetch events");
      }
    } catch {
      toast.error("Failed to fetch events");
    }
  }, []);

  React.useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const onSubmit = async (values: z.infer<typeof formSchema>): Promise<void> => {
    try {
      const response = await createEvent({
        event: {
          summary: values.summary,
          location: values.location,
          dtstart: applyTimezone(startDate, timezone, "UTC").toISOString(),
          dtend: applyTimezone(endDate, timezone, "UTC").toISOString(),
          is_all_day: isAllDay,
          recurrence_list: recurrences,
          timezone: timezone,
        },
      });

      if (response.error_codes.length > 0) {
        toast.error("Failed to create event");
      } else {
        toast.message("Event registered", {
          description: `You have registered for ${values.summary}`,
        });
      }
    } catch {
      toast.error("Failed to create event");
    }

    setStartDate(getCurrentYmdDate(new Date()));
    setEndDate(addDays(getCurrentYmdDate(new Date()), 1));
    setIsAllDay(true);
    setRecurrences([]);
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);

    await fetchEvents();
  };

  const handleStartDateChange = (date: Date): void => {
    setStartDate(date);
    if (date > endDate) {
      setEndDate(addDays(date, 1));
    }
  };

  const handleEndDateChange = (date: Date): void => {
    if (date > startDate) {
      setEndDate(date);
    }
  };

  const handleIsAllDayChange = (allDay: boolean): void => {
    setIsAllDay(allDay);
    if (allDay) {
      setStartDate(startOfDay(startDate));
      setEndDate(startOfDay(endDate));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Calendar
          events={mapEventsToFullCalendar(events)}
          onEventClick={(info) => {
            // TODO: Display event update form
            console.log(info);
          }}
        />
      </div>
      <div>
        <CreateEventForm
          onSubmit={onSubmit}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          isAllDay={isAllDay}
          onIsAllDayChange={handleIsAllDayChange}
          recurrences={recurrences}
          onRecurrencesChange={setRecurrences}
          timezone={timezone}
          onTimezoneChange={setTimezone}
        />
      </div>
    </div>
  );
};
