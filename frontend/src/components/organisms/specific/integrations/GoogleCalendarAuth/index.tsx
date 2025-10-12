"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getGoogleCalendarAuthUrl } from "@/lib/api/google-calendar";
import { generateOAuthState, storeOAuthState } from "@/lib/utils/google-auth";
import React from "react";
import { toast } from "sonner";

interface GoogleCalendarAuthProps {
  onAuthStart?: () => void;
  onAuthError?: (error: Error) => void;
}

export const GoogleCalendarAuth = ({ onAuthStart, onAuthError }: GoogleCalendarAuthProps): React.JSX.Element => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConnect = async (): Promise<void> => {
    setIsLoading(true);
    onAuthStart?.();

    try {
      // Generate and store state for CSRF protection
      const state = generateOAuthState();
      storeOAuthState(state);

      // Get authorization URL from backend
      const response = await getGoogleCalendarAuthUrl(state);

      if (response.error_codes.length > 0) {
        throw new Error("Failed to get authorization URL");
      }

      // Redirect to Google OAuth
      window.location.href = response.authorization_url;
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Failed to connect Google Calendar");
      toast.error(err.message);
      onAuthError?.(err);
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Connect Google Calendar</h3>
          <p className="text-sm text-muted-foreground">
            Sync your events to Google Calendar and share a public calendar URL with your followers.
          </p>
        </div>

        <div className="space-y-3">
          <div className="text-sm space-y-1">
            <p className="font-medium">What you&apos;ll get:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Automatic event synchronization to your Google Calendar</li>
              <li>Public calendar URL that followers can subscribe to</li>
              <li>Updates sync automatically when you modify events</li>
            </ul>
          </div>

          <Button onClick={handleConnect} disabled={isLoading} className="w-full">
            {isLoading ? "Connecting..." : "Connect Google Calendar"}
          </Button>
        </div>
      </div>
    </Card>
  );
};
