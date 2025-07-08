"use client";

import { Calendar } from "@/components/organisms/shared/events/Calendar";
import { EventAttendanceForm } from "@/components/organisms/specific/events/attend/EventAttendanceForm";
import { EventAttendanceSchedule } from "@/components/organisms/specific/events/attend/EventAttendanceSchedule";
import { AttendanceTimeForecastsWithUsername } from "@/lib/api/dtos/event";
import { getAttendanceHistory, getAttendanceTimeForecasts, getFollowingEvents } from "@/lib/api/events";
import { Attendance } from "@/lib/types/event/attendance";
import { parseYmdDate, parseYmdHm15Date } from "@/lib/utils/date";
import { Event, mapEventsToFullCalendar } from "@/lib/utils/fullcalendar";
import { applyTimezone } from "@/lib/utils/timezone";
import { EventClickArg } from "@fullcalendar/core";
import React from "react";
import { toast } from "sonner";

export const EventAttendanceCalendarForm = (): React.JSX.Element => {
  const [events, setEvents] = React.useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = React.useState<EventClickArg | null>(null);
  const [currentAttendances, setCurrentAttendances] = React.useState<Attendance[]>([]);
  const [attendanceHistory, setAttendanceHistory] = React.useState<{ action: string; acted_at: string }[]>([]);
  const [isForecast, setIsForecast] = React.useState(false);
  const [attendanceTimeForecastsWithUsername, setAttendanceTimeForecastsWithUsername] = React.useState<{
    [event_id: string]: {
      [user_id: number]: AttendanceTimeForecastsWithUsername;
    };
  }>({});

  const fetchEvents = React.useCallback(async () => {
    try {
      const response = await getFollowingEvents();
      if (response.error_codes.length === 0) {
        setEvents(
          response.events.map((event) => {
            const start = new Date(Date.parse(event.start));
            const end = new Date(Date.parse(event.end));

            return {
              id: event.id,
              summary: event.summary,
              location: event.location,
              start: event.is_all_day
                ? parseYmdDate(start, "UTC", event.timezone)
                : parseYmdHm15Date(start, "UTC", event.timezone),
              end: event.is_all_day
                ? parseYmdDate(end, "UTC", event.timezone)
                : parseYmdHm15Date(end, "UTC", event.timezone),
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

  const fetchAttendanceTimeForecasts = React.useCallback(async () => {
    try {
      const response = await getAttendanceTimeForecasts();
      if (response.error_codes.length === 0) {
        setAttendanceTimeForecastsWithUsername(response.attendance_time_forecasts_with_username);
      } else {
        toast.error("Failed to fetch attendance time forecasts");
      }
    } catch {
      toast.error("Failed to fetch attendance time forecasts");
    }
  }, []);

  React.useEffect(() => {
    void fetchEvents();
    void fetchAttendanceTimeForecasts();
  }, [fetchEvents, fetchAttendanceTimeForecasts]);

  const fetchAttendances = React.useCallback(
    async (eventId: string, eventStart: Date, eventEnd: Date): Promise<void> => {
      const now = new Date();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

      if (eventStart <= now) {
        // イベント開始時刻が現在時刻以前の場合、履歴から取得
        setIsForecast(false);

        const response = await getAttendanceHistory(eventId, applyTimezone(eventStart, tz, "UTC").toISOString());
        setAttendanceHistory(response.attendances_with_username.attendances);
        const attendLogs = response.attendances_with_username.attendances.filter((a) => a.action === "attend");
        const leaveLogs = response.attendances_with_username.attendances.filter((a) => a.action === "leave");

        // action == "attend" である中で最も早い acted_at を attended_at とする
        const attended_at =
          attendLogs.length > 0
            ? applyTimezone(
                new Date(
                  Date.parse(
                    attendLogs.reduce((earliest, current) =>
                      new Date(current.acted_at) < new Date(earliest.acted_at) ? current : earliest,
                    ).acted_at,
                  ),
                ),
                "UTC",
                tz,
              )
            : null;

        // action == "leave" である中で最も遅い acted_at を left_at とする
        // leave ログが存在しない場合は event.end を用いる
        const left_at =
          leaveLogs.length > 0
            ? applyTimezone(
                new Date(
                  Date.parse(
                    leaveLogs.reduce((latest, current) =>
                      new Date(current.acted_at) > new Date(latest.acted_at) ? current : latest,
                    ).acted_at,
                  ),
                ),
                "UTC",
                tz,
              )
            : eventEnd;

        if (attended_at) {
          setCurrentAttendances([
            {
              id: "",
              userName: response.attendances_with_username.username,
              userAttendances: [
                {
                  userId: 0,
                  attendedAt: attended_at,
                  leftAt: left_at,
                },
              ],
            },
          ]);
        } else {
          setCurrentAttendances([]);
        }
      } else {
        // イベント開始時刻が現在時刻より後の場合、予測から取得
        setIsForecast(true);
        setAttendanceHistory([]);

        const eventAttendances = attendanceTimeForecastsWithUsername[eventId];
        if (!eventAttendances) {
          setCurrentAttendances([]);
          return;
        }

        setCurrentAttendances(
          Object.entries(eventAttendances).map(([userId, userForecast]) => ({
            id: userId,
            userName: userForecast.username,
            userAttendances: userForecast.attendance_time_forecasts
              .filter(
                (forecast) =>
                  applyTimezone(new Date(Date.parse(forecast.start)), "UTC", tz).getTime() === eventStart.getTime(),
              )
              .map((forecast) => ({
                userId: parseInt(userId),
                attendedAt: applyTimezone(new Date(Date.parse(forecast.attended_at)), "UTC", tz),
                leftAt: applyTimezone(
                  new Date(new Date(Date.parse(forecast.attended_at)).getTime() + forecast.duration * 1000),
                  "UTC",
                  tz,
                ),
              })),
          })),
        );
      }
    },
    [attendanceTimeForecastsWithUsername],
  );

  const onEventClick = (eventInfo: EventClickArg): void => {
    setSelectedEvent(eventInfo);
    if (eventInfo.event.id && eventInfo.event.start && eventInfo.event.end) {
      void fetchAttendances(eventInfo.event.id, eventInfo.event.start, eventInfo.event.end);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div className="md:col-span-2">
        <Calendar events={mapEventsToFullCalendar(events)} onEventClick={onEventClick} />
      </div>
      <div className="space-y-4">
        <EventAttendanceForm
          eventId={selectedEvent?.event.id || null}
          eventSummary={selectedEvent?.event.title || null}
          eventStart={selectedEvent?.event.start || null}
          eventEnd={selectedEvent?.event.end || null}
          attendances={
            selectedEvent?.event.id && selectedEvent?.event.start && selectedEvent?.event.end ? attendanceHistory : []
          }
          onAttendanceUpdate={fetchAttendances}
        />
        {selectedEvent?.event.id &&
          selectedEvent?.event.start &&
          selectedEvent?.event.end &&
          selectedEvent?.event.allDay && (
            <EventAttendanceSchedule
              eventStart={selectedEvent?.event.start}
              eventEnd={selectedEvent?.event.end}
              isEventAllDay={selectedEvent?.event.allDay}
              attendances={currentAttendances}
              isForecast={isForecast}
            />
          )}
      </div>
    </div>
  );
};
