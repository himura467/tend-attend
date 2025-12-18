"use client";

import { Calendar } from "@/components/organisms/shared/events/Calendar";
import { CreateEventForm, formSchema } from "@/components/organisms/specific/events/edit/CreateEventForm";
import { UpdateEventForm } from "@/components/organisms/specific/events/edit/UpdateEventForm";
import { useLocalNow } from "@/hooks/useLocalNow";
import { useTimezone } from "@/hooks/useTimezone";
import { createEvent, getMyEvents, updateEvent } from "@/lib/api/events";
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
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [startDate, setStartDate] = React.useState<TZDate>(localNow.startOfDay());
  const [endDate, setEndDate] = React.useState<TZDate>(localNow.startOfDay().addDays(1));
  const [isAllDay, setIsAllDay] = React.useState<boolean>(true);
  const [recurrences, setRecurrences] = React.useState<string[]>([]);

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

  const onCreateSubmit = async (values: z.infer<typeof formSchema>): Promise<void> => {
    try {
      const response = await createEvent({
        event: {
          summary: values.summary,
          location: values.location,
          dtstart: startDate.withTimeZone("UTC").toISOString(),
          dtend: endDate.withTimeZone("UTC").toISOString(),
          is_all_day: isAllDay,
          recurrence_list: recurrences,
          timezone: browserTimezone,
        },
      });

      if (response.error_codes.length > 0) {
        toast.error("Failed to create event");
      } else {
        toast.message("Event created", {
          description: `You have created ${values.summary}`,
        });
      }
    } catch {
      toast.error("Failed to create event");
    }

    resetForm();
    await fetchEvents();
  };

  const onUpdateSubmit = async (eventId: string, values: z.infer<typeof formSchema>): Promise<void> => {
    try {
      const response = await updateEvent(eventId, {
        event: {
          summary: values.summary,
          location: values.location,
          dtstart: startDate.withTimeZone("UTC").toISOString(),
          dtend: endDate.withTimeZone("UTC").toISOString(),
          is_all_day: isAllDay,
          recurrence_list: recurrences,
          timezone: browserTimezone,
        },
      });

      if (response.error_codes.length > 0) {
        toast.error("Failed to update event");
      } else {
        toast.message("Event updated", {
          description: `You have updated ${values.summary}`,
        });
      }
    } catch {
      toast.error("Failed to update event");
    }

    setSelectedEvent(null);
    resetForm();
    await fetchEvents();
  };

  const resetForm = (): void => {
    setStartDate(localNow.startOfDay());
    setEndDate(localNow.startOfDay().addDays(1));
    setIsAllDay(true);
    setRecurrences([]);
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

  const handleEventSelect = (event: Event): void => {
    setSelectedEvent(event);
    setStartDate(event.dtstart);
    setEndDate(event.dtend);
    setIsAllDay(event.isAllDay);
    setRecurrences(event.recurrences);
  };

  const handleCancelUpdate = (): void => {
    setSelectedEvent(null);
    resetForm();
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Calendar
          events={mapEventsToFullCalendar(events, browserTimezone)}
          onEventClick={(info) => {
            const eventId = info.id;
            const event = events.find((e) => e.id === eventId);
            if (event) {
              handleEventSelect(event);
            }
          }}
        />
      </div>
      <div>
        {selectedEvent ? (
          <UpdateEventForm
            selectedEvent={selectedEvent}
            onSubmit={onUpdateSubmit}
            onCancel={handleCancelUpdate}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            isAllDay={isAllDay}
            onIsAllDayChange={handleIsAllDayChange}
            recurrences={recurrences}
            onRecurrencesChange={setRecurrences}
          />
        ) : (
          <CreateEventForm
            onSubmit={onCreateSubmit}
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={handleEndDateChange}
            isAllDay={isAllDay}
            onIsAllDayChange={handleIsAllDayChange}
            recurrences={recurrences}
            onRecurrencesChange={setRecurrences}
          />
        )}
      </div>
    </div>
  );
};
