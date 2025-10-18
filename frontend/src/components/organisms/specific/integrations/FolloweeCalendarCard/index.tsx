"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { FolloweeCalendarInfo } from "@/lib/api/dtos/google-calendar";
import { Calendar, Copy, ExternalLink } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface FolloweeCalendarCardProps {
  followee: FolloweeCalendarInfo;
  className?: string;
}

export const FolloweeCalendarCard = ({ followee, className }: FolloweeCalendarCardProps): React.JSX.Element => {
  const [isCopied, setIsCopied] = React.useState(false);

  const displayName = followee.nickname || followee.username;

  const handleCopyUrl = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(followee.calendar_url);
      setIsCopied(true);
      toast.success(`Calendar URL for ${displayName} copied to clipboard`);

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to copy URL");
      toast.error(err.message);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="size-5" />
              {displayName}
            </CardTitle>
            {followee.nickname && <CardDescription>@{followee.username}</CardDescription>}
          </div>
          <Badge variant="default">
            <ExternalLink className="size-3" />
            Google Calendar
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Calendar Subscription URL</h4>
          <p className="text-xs text-muted-foreground">
            Subscribe to {displayName}&apos;s events in your Google Calendar app
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
            {followee.calendar_url}
          </div>
          <Button
            variant={isCopied ? "default" : "outline"}
            size="sm"
            onClick={handleCopyUrl}
            title="Copy to clipboard"
          >
            <Copy />
            {isCopied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" asChild title="Open in Google Calendar">
            <a href={followee.calendar_url} target="_blank" rel="noopener noreferrer">
              <ExternalLink />
            </a>
          </Button>
        </div>
        <div className="rounded-md bg-muted/50 p-3 space-y-2">
          <p className="text-xs font-medium">How to subscribe:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Copy the calendar URL above</li>
            <li>Open Google Calendar in your browser</li>
            <li>Click the &quot;+&quot; button next to &quot;Other calendars&quot;</li>
            <li>Select &quot;From URL&quot;</li>
            <li>Paste the calendar URL and click &quot;Add calendar&quot;</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
