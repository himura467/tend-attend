"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GoogleCalendarSyncStatus } from "@/lib/api/dtos/google-calendar";
import React from "react";

interface GoogleCalendarStatusDisplayProps {
  status: GoogleCalendarSyncStatus | null;
  isLoading?: boolean;
  error?: string | null;
}

const statusConfig: Record<
  GoogleCalendarSyncStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    description: string;
  }
> = {
  disconnected: {
    label: "Disconnected",
    variant: "secondary",
    description: "Google Calendar is not connected",
  },
  connected: {
    label: "Connected",
    variant: "default",
    description: "Successfully connected to Google Calendar",
  },
  syncing: {
    label: "Syncing",
    variant: "outline",
    description: "Syncing events to Google Calendar...",
  },
  error: {
    label: "Error",
    variant: "destructive",
    description: "Failed to sync with Google Calendar",
  },
};

export const GoogleCalendarStatusDisplay = ({
  status,
  isLoading = false,
  error = null,
}: GoogleCalendarStatusDisplayProps): React.JSX.Element => {
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          <span className="text-sm text-muted-foreground">Loading status...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/10">
            <svg className="h-3 w-3 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="text-sm text-destructive">{error}</span>
        </div>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <Badge variant="secondary">Unknown</Badge>
          <span className="text-sm text-muted-foreground">Status unavailable</span>
        </div>
      </Card>
    );
  }

  const config = statusConfig[status];

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Badge variant={config.variant}>{config.label}</Badge>
          <span className="text-sm text-muted-foreground">{config.description}</span>
        </div>
        {status === "syncing" && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        )}
      </div>
    </Card>
  );
};
