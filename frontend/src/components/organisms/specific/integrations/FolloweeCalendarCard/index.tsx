"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FolloweeCalendarInfo } from "@/lib/api/dtos/google-calendar";
import { Calendar, Plus } from "lucide-react";
import React from "react";

interface FolloweeCalendarCardProps {
  followee: FolloweeCalendarInfo;
}

export const FolloweeCalendarCard = ({ followee }: FolloweeCalendarCardProps): React.JSX.Element => {
  const displayName = followee.nickname || followee.username;
  const addToGoogleCalendarUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(followee.calendar_url)}`;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              {displayName}
            </CardTitle>
            <CardDescription>@{followee.username}</CardDescription>
          </div>
          <Button variant="default" size="sm" asChild>
            <a href={addToGoogleCalendarUrl} target="_blank" rel="noopener noreferrer">
              <Plus className="size-4" />
              Add to Google Calendar
            </a>
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};
