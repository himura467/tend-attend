"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { GoogleCalendarSyncStatus } from "@/lib/api/dtos/google-calendar";
import { syncGoogleCalendar } from "@/lib/api/google-calendar";
import { cn } from "@/lib/utils";
import { CheckCircle2, Copy, ExternalLink, Loader2, RefreshCw, XCircle } from "lucide-react";
import React from "react";
import { toast } from "sonner";

interface GoogleCalendarSyncProps {
  calendarUrl: string | null;
  initialSyncStatus?: GoogleCalendarSyncStatus | null;
  googleEmail?: string | null;
  className?: string;
  onSyncComplete?: (eventsSynced: number) => void;
  onSyncError?: (error: Error) => void;
}

export const GoogleCalendarSync = ({
  calendarUrl,
  initialSyncStatus = "connected",
  googleEmail,
  className,
  onSyncComplete,
  onSyncError,
}: GoogleCalendarSyncProps): React.JSX.Element => {
  const [syncStatus, setSyncStatus] = React.useState<GoogleCalendarSyncStatus | null>(initialSyncStatus);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncedCount, setLastSyncedCount] = React.useState<number | null>(null);

  const handleCopyUrl = async (): Promise<void> => {
    if (!calendarUrl) return;

    try {
      await navigator.clipboard.writeText(calendarUrl);
      toast.success("Calendar URL copied to clipboard");
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to copy URL");
      toast.error(err.message);
    }
  };

  const handleSync = async (): Promise<void> => {
    setIsSyncing(true);
    setSyncStatus("syncing");

    try {
      const response = await syncGoogleCalendar();

      if (response.error_codes.length > 0) {
        throw new Error("Failed to sync calendar");
      }

      setSyncStatus(response.sync_status);
      setLastSyncedCount(response.events_synced);

      if (response.events_synced !== null) {
        toast.success(`Successfully synced ${response.events_synced} event${response.events_synced !== 1 ? "s" : ""}`);
        onSyncComplete?.(response.events_synced);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to sync calendar");
      setSyncStatus("error");
      toast.error(err.message);
      onSyncError?.(err);
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
    <Card className={cn("", className)}>
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
        {calendarUrl && (
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Your Calendar URL</h4>
              <p className="text-xs text-muted-foreground">
                Share this URL with your followers so they can subscribe to your events in their Google Calendar app.
              </p>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 rounded-md border bg-muted/50 px-3 py-2 text-sm font-mono truncate">
                {calendarUrl}
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyUrl} title="Copy to clipboard">
                <Copy />
                Copy
              </Button>
              <Button variant="outline" size="sm" asChild title="Open in Google Calendar">
                <a href={calendarUrl} target="_blank" rel="noopener noreferrer">
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
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Sync Events</h4>
              <p className="text-xs text-muted-foreground">
                Manually sync your events to Google Calendar
                {lastSyncedCount !== null &&
                  ` (Last synced: ${lastSyncedCount} event${lastSyncedCount !== 1 ? "s" : ""})`}
              </p>
            </div>
          </div>

          <Button onClick={handleSync} disabled={isSyncing || syncStatus === "disconnected"} className="w-full">
            <RefreshCw className={cn(isSyncing && "animate-spin")} />
            {isSyncing ? "Syncing..." : "Sync Now"}
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
