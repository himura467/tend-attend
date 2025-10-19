"use client";

import { GoogleCalendarAuth } from "@/components/organisms/specific/integrations/GoogleCalendarAuth";
import { GoogleCalendarSync } from "@/components/organisms/specific/integrations/GoogleCalendarSync";
import { DialogTemplate } from "@/components/templates/DialogTemplate";
import { Button } from "@/components/ui/button";
import type { GoogleCalendarSyncStatus } from "@/lib/api/dtos/google-calendar";
import { disconnectGoogleCalendar, getGoogleCalendarStatus } from "@/lib/api/google-calendar";
import { rr } from "@/lib/utils/reverseRouter";
import { NextPage } from "next";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

const IntegrationsPage: NextPage = (): React.JSX.Element => {
  const [isConnected, setIsConnected] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [calendarUrl, setCalendarUrl] = React.useState<string | null>(null);
  const [googleEmail, setGoogleEmail] = React.useState<string | null>(null);
  const [syncStatus, setSyncStatus] = React.useState<GoogleCalendarSyncStatus | null>(null);
  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const loadCalendarStatus = React.useCallback(async () => {
    try {
      const response = await getGoogleCalendarStatus();

      if (response.error_codes.length === 0 && response.integration_id) {
        setIsConnected(true);
        setCalendarUrl(response.calendar_url);
        setGoogleEmail(response.google_email);
        setSyncStatus(response.sync_status);
      } else {
        setIsConnected(false);
        setCalendarUrl(null);
        setGoogleEmail(null);
        setSyncStatus(null);
      }
    } catch (error) {
      console.error("Failed to load calendar status:", error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadCalendarStatus();
  }, [loadCalendarStatus]);

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
        throw new Error("Failed to disconnect Google Calendar");
      }

      toast.success("Google Calendar disconnected successfully");
      setIsConnected(false);
      setCalendarUrl(null);
      setGoogleEmail(null);
      setSyncStatus(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to disconnect");
      toast.error(err.message);
    } finally {
      setIsDisconnecting(false);
    }
  };

  return (
    <DialogTemplate>
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl">Integrations</h1>
          <Button variant="outline" asChild>
            <Link {...rr.events.edit.index()}>Edit Events</Link>
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2">Google Calendar Integration</h2>
            <p className="text-muted-foreground text-sm">
              Connect your Google Calendar to automatically sync events and share a public calendar URL with your
              followers.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : isConnected ? (
            <div className="space-y-4">
              <GoogleCalendarSync
                calendarUrl={calendarUrl}
                initialSyncStatus={syncStatus}
                googleEmail={googleEmail}
                onSyncComplete={(count) => {
                  console.log(`Synced ${count} events`);
                }}
                onSyncError={(error) => {
                  console.error("Sync error:", error);
                }}
              />

              <div className="flex justify-end">
                <Button variant="destructive" onClick={handleDisconnect} disabled={isDisconnecting}>
                  {isDisconnecting ? "Disconnecting..." : "Disconnect Google Calendar"}
                </Button>
              </div>
            </div>
          ) : (
            <GoogleCalendarAuth
              onAuthStart={() => {
                console.log("Starting OAuth flow");
              }}
              onAuthError={(error) => {
                console.error("Auth error:", error);
              }}
            />
          )}
        </div>
      </div>
    </DialogTemplate>
  );
};

export default IntegrationsPage;
