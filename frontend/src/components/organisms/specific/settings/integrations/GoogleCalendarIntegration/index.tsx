"use client";

import { GoogleCalendarAuth } from "@/components/organisms/specific/settings/integrations/GoogleCalendarAuth";
import { GoogleCalendarSync } from "@/components/organisms/specific/settings/integrations/GoogleCalendarSync";
import { Button } from "@/components/ui/button";
import type { GoogleCalendarSyncStatus } from "@/lib/api/dtos/google-calendar";
import { disconnectGoogleCalendar, getGoogleCalendarStatus } from "@/lib/api/google-calendar";
import { Loader2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export const GoogleCalendarIntegration = (): React.JSX.Element => {
  const [googleEmail, setGoogleEmail] = React.useState<string | null>(null);
  const [calendarUrl, setCalendarUrl] = React.useState<string | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<GoogleCalendarSyncStatus | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  React.useEffect(() => {
    const loadCalendarStatus = async (): Promise<void> => {
      try {
        const response = await getGoogleCalendarStatus();
        if (response.error_codes.length === 0 && response.integration_id) {
          setGoogleEmail(response.google_email);
          setCalendarUrl(response.calendar_url);
          setSyncStatus(response.sync_status);
          setIsConnected(true);
        } else {
          setGoogleEmail(null);
          setCalendarUrl(null);
          setSyncStatus(null);
          setIsConnected(false);
        }
      } catch {
        toast.error("Failed to load calendar status");
        setIsConnected(false);
      } finally {
        setIsLoading(false);
      }
    };

    void loadCalendarStatus();
  }, []);

  const handleDisconnect = async (): Promise<void> => {
    if (
      !confirm(
        "Are you sure you want to disconnect Google Calendar? Your followers will no longer be able to subscribe to your calendar.",
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    try {
      const response = await disconnectGoogleCalendar();
      if (response.error_codes.length > 0) {
        toast.error("Failed to disconnect Google Calendar");
        return;
      }
      toast.success("Google Calendar disconnected successfully");
      setGoogleEmail(null);
      setCalendarUrl(null);
      setSyncStatus(null);
      setIsConnected(false);
    } catch {
      toast.error("Failed to disconnect Google Calendar");
    } finally {
      setIsDisconnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading Google Calendar status...</p>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="space-y-4">
        <GoogleCalendarSync googleEmail={googleEmail} calendarUrl={calendarUrl} initialSyncStatus={syncStatus} />
        <div className="flex justify-end">
          <Button variant="destructive" onClick={handleDisconnect} disabled={isDisconnecting}>
            {isDisconnecting ? "Disconnecting..." : "Disconnect Google Calendar"}
          </Button>
        </div>
      </div>
    );
  }

  return <GoogleCalendarAuth />;
};
