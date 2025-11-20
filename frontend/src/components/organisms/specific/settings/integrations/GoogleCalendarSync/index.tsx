"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useClipboard } from "@/hooks/useClipboard";
import { useShare } from "@/hooks/useShare";
import type { GoogleCalendarSyncStatus } from "@/lib/api/dtos/google-calendar";
import { syncGoogleCalendar } from "@/lib/api/google-calendar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Copy, Loader2, RefreshCw, Share2, XCircle } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface GoogleCalendarSyncProps {
  googleEmail: string | null;
  calendarUrl: string | null;
  initialSyncStatus: GoogleCalendarSyncStatus | null;
}

export const GoogleCalendarSync = ({
  googleEmail,
  calendarUrl,
  initialSyncStatus,
}: GoogleCalendarSyncProps): React.JSX.Element => {
  const { copy, isSupported: isCopySupported } = useClipboard();
  const { share, canShare } = useShare();

  const [syncStatus, setSyncStatus] = React.useState<GoogleCalendarSyncStatus | null>(initialSyncStatus);
  const [lastSyncedCount, setLastSyncedCount] = React.useState<number | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);

  const addToGoogleCalendarUrl = calendarUrl
    ? `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(calendarUrl)}`
    : null;
  const shareData: ShareData | null = addToGoogleCalendarUrl
    ? {
        text: "Subscribe to my events on Google Calendar",
        title: "Subscribe to my calendar",
        url: addToGoogleCalendarUrl,
      }
    : null;
  const isShareSupported = shareData ? canShare(shareData) : false;

  const handleCopyUrl = async (): Promise<void> => {
    if (!addToGoogleCalendarUrl) return;
    await copy(addToGoogleCalendarUrl, "Calendar subscription link copied to clipboard");
  };
  const handleShareUrl = async (): Promise<void> => {
    if (!shareData) return;
    await share(shareData);
  };
  const handleSync = async (): Promise<void> => {
    setSyncStatus("syncing");
    setIsSyncing(true);

    try {
      const response = await syncGoogleCalendar();
      if (response.error_codes.length > 0) {
        throw new Error("Failed to sync calendar");
      }

      setSyncStatus(response.sync_status);
      setLastSyncedCount(response.events_synced);

      if (response.events_synced !== null) {
        toast.success(`Successfully synced ${response.events_synced} event${response.events_synced !== 1 ? "s" : ""}`);
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error("Failed to sync calendar");
      setSyncStatus("error");
      toast.error(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const getSyncStatusConfig = (
    status: GoogleCalendarSyncStatus | null,
  ): {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  } => {
    switch (status) {
      case "connected":
        return {
          label: "Connected",
          variant: "default",
          icon: <CheckCircle2 className="size-3" />,
        };
      case "syncing":
        return {
          label: "Syncing...",
          variant: "secondary",
          icon: <Loader2 className="size-3 animate-spin" />,
        };
      case "error":
        return {
          label: "Error",
          variant: "destructive",
          icon: <XCircle className="size-3" />,
        };
      case "disconnected":
      default:
        return {
          label: "Disconnected",
          variant: "outline",
          icon: <XCircle className="size-3" />,
        };
    }
  };
  const statusConfig = getSyncStatusConfig(syncStatus);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle>Google Calendar Sync</CardTitle>
            <CardDescription>
              {googleEmail ? `Connected as ${googleEmail}` : "Manage your calendar synchronization"}
            </CardDescription>
          </div>
          <Badge variant={statusConfig.variant}>
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {addToGoogleCalendarUrl && (
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium">Share Calendar with Followers</h4>
              <p className="text-xs text-muted-foreground">
                Share your calendar subscription link so followers can add your events to their Google Calendar
              </p>
            </div>
            {(isShareSupported || isCopySupported) && (
              <div className="flex gap-2">
                {isShareSupported && (
                  <Button variant="outline" className="flex-1" onClick={handleShareUrl}>
                    <Share2 />
                    Share Calendar
                  </Button>
                )}
                {isCopySupported && (
                  <Button variant="outline" onClick={handleCopyUrl} title="Copy calendar subscription link">
                    <Copy />
                    Copy URL
                  </Button>
                )}
              </div>
            )}
            <div className="rounded-md bg-muted/50 p-3">
              <p className="text-xs font-medium">How it works:</p>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside mt-2">
                <li>Click &quot;Share Calendar&quot; to send the subscription link to followers</li>
                <li>Followers click the link to add your calendar to their Google Calendar</li>
                <li>They&apos;ll automatically see all your events</li>
              </ul>
            </div>
          </div>
        )}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium">Sync Events</h4>
            <p className="text-xs text-muted-foreground">
              Manually sync your events to Google Calendar
              {lastSyncedCount !== null &&
                ` (Last synced: ${lastSyncedCount} event${lastSyncedCount !== 1 ? "s" : ""})`}
            </p>
          </div>
          <Button onClick={handleSync} disabled={isSyncing || syncStatus === "disconnected"} className="w-full">
            <RefreshCw className={cn(isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
        </div>
        {syncStatus === "error" && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
            <p className="text-xs text-destructive font-medium">
              Failed to sync calendar. Please try again or reconnect your Google Calendar.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
