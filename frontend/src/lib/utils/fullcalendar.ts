import { getYmdDeltaDays, getYmdHm15DeltaMinutes, parseYmdDate, parseYmdHm15Date } from "@/lib/utils/date";
import { parseRecurrence } from "@/lib/utils/icalendar";
import { applyTimezone } from "@/lib/utils/timezone";
import { TZDate } from "@/lib/utils/tzdate";
import { Options as RRuleOptions } from "rrule";

export interface Event {
  id: string;
  summary: string;
  location: string | null;
  dtstart: TZDate;
  dtend: TZDate;
  isAllDay: boolean;
  recurrences: string[];
  timezone: string;
}

interface BaseFullCalendarEvent {
  id: string;
  title: string;
  start: TZDate;
  end: TZDate;
  allDay: boolean;
  extendedProps?: {
    originalId?: string;
  };
}

interface RecurringFullCalendarEvent {
  id: string;
  title: string;
  allDay: boolean;
  rrule: Partial<RRuleOptions> & {
    dtstart: TZDate;
  };
  exdate: string[];
  duration: {
    days?: number;
    minutes?: number;
  };
}

export const mapEventsToFullCalendar = (
  events: Event[],
  timezone: string,
): (BaseFullCalendarEvent | RecurringFullCalendarEvent)[] => {
  return events.flatMap((event) => {
    const baseEvent = {
      id: event.id,
      title: event.summary,
      start: event.isAllDay ? event.dtstart : applyTimezone(event.dtstart, timezone),
      end: event.isAllDay ? event.dtend : applyTimezone(event.dtend, timezone),
      allDay: event.isAllDay,
    };

    const rruleSet = parseRecurrence(event.recurrences);
    if (!rruleSet) return [baseEvent];

    const results: (BaseFullCalendarEvent | RecurringFullCalendarEvent)[] = [];

    if (rruleSet._rrule.length > 0) {
      results.push({
        id: baseEvent.id,
        title: baseEvent.title,
        allDay: baseEvent.allDay,
        rrule: { ...rruleSet._rrule[0].options, dtstart: baseEvent.start },
        exdate: rruleSet._exdate.map((date) => date.toISOString().split("T")[0]),
        duration: baseEvent.allDay
          ? {
              days: getYmdDeltaDays(parseYmdDate(event.dtstart, timezone), parseYmdDate(event.dtend, timezone)),
            }
          : {
              minutes: getYmdHm15DeltaMinutes(
                parseYmdHm15Date(event.dtstart, timezone),
                parseYmdHm15Date(event.dtend, timezone),
              ),
            },
      });
    }

    rruleSet._rdate.forEach((rdate, index) => {
      // Convert rdate from local timezone to UTC
      const timezoneOffsetMs = new TZDate(rdate, timezone).getTimezoneOffset() * 60 * 1000;
      const rdateStart = new TZDate(rdate.getTime() + timezoneOffsetMs);
      const originalDurationMs = baseEvent.end.getTime() - baseEvent.start.getTime();
      const rdateEnd = new TZDate(rdateStart.getTime() + originalDurationMs);

      results.push({
        id: `${baseEvent.id}-rdate-${index}`,
        title: baseEvent.title,
        start: baseEvent.allDay ? rdateStart : applyTimezone(rdateStart, timezone),
        end: baseEvent.allDay ? rdateEnd : applyTimezone(rdateEnd, timezone),
        allDay: baseEvent.allDay,
        extendedProps: {
          originalId: baseEvent.id,
        },
      });
    });

    return results.length > 0 ? results : [baseEvent];
  });
};
