"use client";

import { FolloweeCalendarCard } from "@/components/organisms/specific/integrations/FolloweeCalendarCard";
import type { FolloweeCalendarInfo } from "@/lib/api/dtos/google-calendar";
import { getFolloweeCalendars } from "@/lib/api/google-calendar";
import { CalendarOff, Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface FolloweeCalendarListProps {
  className?: string;
}

export const FolloweeCalendarList = ({ className }: FolloweeCalendarListProps): React.JSX.Element => {
  const [calendars, setCalendars] = React.useState<FolloweeCalendarInfo[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadCalendars = async (): Promise<void> => {
      try {
        const response = await getFolloweeCalendars();

        if (response.error_codes.length > 0) {
          throw new Error("Failed to load followee calendars");
        }

        setCalendars(response.calendars);
        setError(null);
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Failed to load calendars");
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadCalendars();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading followee calendars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <CalendarOff className="size-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold">Failed to Load Calendars</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (calendars.length === 0) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3 text-center max-w-md">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <CalendarOff className="size-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">No Calendar Subscriptions Available</h3>
            <p className="text-sm text-muted-foreground">
              None of the people you follow have shared their Google Calendar yet. When they connect their Google
              Calendar and enable sharing, their event calendars will appear here for you to subscribe to.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Followee Calendars ({calendars.length})</h2>
          <p className="text-sm text-muted-foreground">
            Subscribe to event calendars from people you follow. These calendars will automatically update when they add
            or modify events.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {calendars.map((followee) => (
            <FolloweeCalendarCard key={followee.username} followee={followee} />
          ))}
        </div>
      </div>
    </div>
  );
};
