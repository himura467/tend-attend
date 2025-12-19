"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalNow } from "@/hooks/useLocalNow";
import { useTimezone } from "@/hooks/useTimezone";
import { useRouter } from "@/i18n/navigation";
import { getFollowingEvents } from "@/lib/api/events";
import { parseRecurrence } from "@/lib/utils/icalendar";
import { rr } from "@/lib/utils/reverseRouter";
import { routerPush } from "@/lib/utils/router";
import { TZDate } from "@/lib/utils/tzdate";
import { useEffect, useState } from "react";

interface EventSession {
  eventId: string;
  summary: string;
  location: string | null;
  dtstart: TZDate;
  dtend: TZDate;
  isAllDay: boolean;
  timezone: string;
}

export const FollowingEventsReviewsList = (): React.JSX.Element => {
  const router = useRouter();
  const browserTimezone = useTimezone();
  const localNow = useLocalNow();

  const [sessions, setSessions] = useState<EventSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndExpandEvents = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await getFollowingEvents();
        if (response.error_codes.length > 0) {
          setError("Failed to load events");
          return;
        }

        // Calculate 1 year past and 1 year future from local now
        const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
        const oneYearAgo = new TZDate(localNow.getTime() - oneYearInMs, browserTimezone);
        const oneYearLater = new TZDate(localNow.getTime() + oneYearInMs, browserTimezone);

        // Expand all events into individual sessions
        const allSessions: EventSession[] = [];
        for (const event of response.events) {
          const dtstart = new TZDate(event.dtstart);
          const dtend = new TZDate(event.dtend);
          if (event.recurrence_list.length === 0) {
            // Check if single event is within the 1-year range
            if (dtstart.getTime() >= oneYearAgo.getTime() && dtstart.getTime() <= oneYearLater.getTime()) {
              allSessions.push({
                eventId: event.id,
                summary: event.summary,
                location: event.location,
                dtstart: dtstart,
                dtend: dtend,
                isAllDay: event.is_all_day,
                timezone: event.timezone,
              });
            }
          } else {
            const rruleSet = parseRecurrence(event.recurrence_list);
            if (!rruleSet) continue;
            const durationMs = dtend.getTime() - dtstart.getTime();
            // Get occurrences within 1 year past to 1 year future
            const occurrences = rruleSet.between(oneYearAgo, oneYearLater, true);
            for (const occurrence of occurrences) {
              const occurrenceStart = new TZDate(occurrence, event.timezone);
              const occurrenceEnd = new TZDate(occurrenceStart.getTime() + durationMs, event.timezone);
              allSessions.push({
                eventId: event.id,
                summary: event.summary,
                location: event.location,
                dtstart: occurrenceStart,
                dtend: occurrenceEnd,
                isAllDay: event.is_all_day,
                timezone: event.timezone,
              });
            }
          }
        }

        // Sort sessions chronologically by start time
        allSessions.sort((a, b) => a.dtstart.getTime() - b.dtstart.getTime());

        setSessions(allSessions);
      } catch {
        setError("An error occurred while loading events");
      } finally {
        setLoading(false);
      }
    };

    void fetchAndExpandEvents();
  }, [browserTimezone, localNow]);

  const handleSessionClick = (session: EventSession): void => {
    const utcStart = session.dtstart.withTimeZone("UTC");
    routerPush(rr.events.event.reviews.index(session.eventId, encodeURIComponent(utcStart.toISOString())), router);
  };

  const formatSessionDate = (session: EventSession): string => {
    const localStart = session.dtstart.withTimeZone(browserTimezone);
    if (session.isAllDay) {
      return localStart.toLocaleString([], {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: browserTimezone,
      });
    }
    return localStart.toLocaleString([], {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: browserTimezone,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading events...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">You are not following any events yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Card
          key={`${session.eventId}-${session.dtstart.getTime()}`}
          className="cursor-pointer transition-colors hover:bg-accent"
          onClick={() => handleSessionClick(session)}
        >
          <CardHeader>
            <CardTitle className="text-lg">{session.summary}</CardTitle>
            <p className="text-muted-foreground text-sm">{formatSessionDate(session)}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};
