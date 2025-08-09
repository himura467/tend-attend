import {
  getYmdDeltaDays,
  getYmdHm15DeltaMinutes,
  parseYmdDate,
  parseYmdHm15Date,
  YmdDate,
  YmdHm15Date,
} from "@/lib/utils/date";
import { parseRecurrence } from "@/lib/utils/icalendar";
import { applyTimezone } from "@/lib/utils/timezone";
import { endOfDay } from "date-fns";
import { Options as RRuleOptions } from "rrule";

export interface Event {
  id: string;
  summary: string;
  location: string | null;
  dtstart: YmdDate | YmdHm15Date;
  dtend: YmdDate | YmdHm15Date;
  isAllDay: boolean;
  recurrences: string[];
  timezone: string;
}

interface BaseFullCalendarEvent {
  id: string;
  title: string;
  dtstart: Date;
  dtend: Date;
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
    dtstart: Date;
  };
  exdate: string[];
  duration: {
    days?: number;
    minutes?: number;
  };
}

export const mapEventsToFullCalendar = (events: Event[]): (BaseFullCalendarEvent | RecurringFullCalendarEvent)[] => {
  return events.flatMap((event) => {
    const baseEvent = {
      id: event.id,
      title: event.summary,
      dtstart: event.isAllDay
        ? event.dtstart
        : applyTimezone(event.dtstart, event.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
      dtend: event.isAllDay
        ? endOfDay(event.dtend)
        : applyTimezone(event.dtend, event.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
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
        rrule: { ...rruleSet._rrule[0].options, dtstart: baseEvent.dtstart },
        exdate: rruleSet._exdate.map((date) => date.toISOString().split("T")[0]),
        duration: baseEvent.allDay
          ? {
              days: getYmdDeltaDays(
                parseYmdDate(event.dtstart, event.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
                parseYmdDate(event.dtend, event.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
              ),
            }
          : {
              minutes: getYmdHm15DeltaMinutes(
                parseYmdHm15Date(event.dtstart, event.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
                parseYmdHm15Date(event.dtend, event.timezone, Intl.DateTimeFormat().resolvedOptions().timeZone),
              ),
            },
      });
    }

    rruleSet._rdate.forEach((rdate, index) => {
      const rdateStart = new Date(rdate);
      const originalDurationMs = baseEvent.dtend.getTime() - baseEvent.dtstart.getTime();
      const rdateEnd = new Date(rdateStart.getTime() + originalDurationMs);

      results.push({
        id: `${baseEvent.id}-rdate-${index}`,
        title: baseEvent.title,
        dtstart: rdateStart,
        dtend: baseEvent.allDay ? rdateStart : rdateEnd,
        allDay: baseEvent.allDay,
        extendedProps: {
          originalId: baseEvent.id,
        },
      });
    });

    return results.length > 0 ? results : [baseEvent];
  });
};
