"use client";

import { Calendar } from "@/components/organisms/shared/events/Calendar";
import { CreateEventForm, formSchema } from "@/components/organisms/specific/events/edit/CreateEventForm";
import { useLocalNow } from "@/hooks/useLocalNow";
import { useTimezone } from "@/hooks/useTimezone";
import { createEvent, getMyEvents } from "@/lib/api/events";
import { parseYmdDate, parseYmdHm15Date } from "@/lib/utils/date";
import { Event, mapEventsToFullCalendar } from "@/lib/utils/fullcalendar";
import { TZDate } from "@/lib/utils/tzdate";
import React from "react";
import { toast } from "sonner";
import { z } from "zod";

export const EditEventsCalendarForm = (): React.JSX.Element => {
  const browserTimezone = useTimezone();
  const localNow = useLocalNow();

  const [events, setEvents] = React.useState<Event[]>([]);
  const [startDate, setStartDate] = React.useState<TZDate>(localNow.startOfDay());
  const [endDate, setEndDate] = React.useState<TZDate>(localNow.startOfDay().addDays(1));
  const [isAllDay, setIsAllDay] = React.useState<boolean>(true);
  const [recurrences, setRecurrences] = React.useState<string[]>([]);
  const [timezone, setTimezone] = React.useState<string>(browserTimezone);

  const fetchEvents = React.useCallback(async () => {
    try {
      const response = await getMyEvents();
      if (response.error_codes.length === 0) {
        setEvents(
          response.events.map((event) => {
            const dtstart = new TZDate(event.dtstart);
            const dtend = new TZDate(event.dtend);

            return {
              id: event.id,
              summary: event.summary,
              location: event.location,
              dtstart: event.is_all_day
                ? parseYmdDate(dtstart, event.timezone)
                : parseYmdHm15Date(dtstart, event.timezone),
              dtend: event.is_all_day ? parseYmdDate(dtend, event.timezone) : parseYmdHm15Date(dtend, event.timezone),
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
          dtstart: startDate.withTimeZone("UTC").toISOString(),
          dtend: endDate.withTimeZone("UTC").toISOString(),
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

    setStartDate(localNow.startOfDay());
    setEndDate(localNow.startOfDay().addDays(1));
    setIsAllDay(true);
    setRecurrences([]);
    setTimezone(browserTimezone);

    await fetchEvents();
  };

  const handleStartDateChange = (date: TZDate): void => {
    setStartDate(date);
    if (date > endDate) {
      setEndDate(date.addDays(1));
    }
  };

  const handleEndDateChange = (date: TZDate): void => {
    if (date > startDate) {
      setEndDate(date);
    }
  };

  const handleIsAllDayChange = (allDay: boolean): void => {
    setIsAllDay(allDay);
    if (allDay) {
      setStartDate(startDate.startOfDay());
      setEndDate(endDate.startOfDay());
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Calendar
          events={mapEventsToFullCalendar(events, browserTimezone)}
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
