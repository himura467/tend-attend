"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { handleGoogleCalendarOAuthCallback } from "@/lib/api/google-calendar";
import { parseOAuthCallback, verifyOAuthState } from "@/lib/utils/google-auth";
import { routerPush } from "@/lib/utils/router";
import { NextPage } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { toast } from "sonner";

const GoogleCallbackHandler = (): React.JSX.Element => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = React.useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const [calendarUrl, setCalendarUrl] = React.useState<string>("");

  React.useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      try {
        // Parse callback parameters
        const { code, state, error } = parseOAuthCallback(searchParams.toString());

        // Check for OAuth errors
        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        // Verify state for CSRF protection
        if (!verifyOAuthState(state)) {
          throw new Error("Invalid state parameter. Please try again.");
        }

        // Exchange code for tokens
        if (!code) {
          throw new Error("No authorization code received");
        }

        const response = await handleGoogleCalendarOAuthCallback({
          auth_code: code,
        });

        if (response.error_codes.length > 0) {
          throw new Error("Failed to complete Google Calendar integration");
        }

        // Success
        setCalendarUrl(response.calendar_url || "");
        setStatus("success");
        toast.success("Google Calendar connected successfully!");

        // Redirect to settings or events page after a short delay
        setTimeout(() => {
          routerPush({ href: "/events/edit" }, router);
        }, 2000);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to connect Google Calendar";
        setErrorMessage(message);
        setStatus("error");
        toast.error(message);
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Connecting Google Calendar</h2>
              <p className="text-muted-foreground">Please wait while we complete the connection...</p>
            </div>
          </div>
        </Card>
      </div>
    );
  } else if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <svg className="h-6 w-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Connection Failed</h2>
              <p className="text-muted-foreground">{errorMessage}</p>
            </div>
            <Button onClick={() => routerPush({ href: "/events/edit" }, router)} className="w-full">
              Return to Events
            </Button>
          </div>
        </Card>
      </div>
    );
  } else {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <div className="space-y-4 text-center">
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Successfully Connected!</h2>
              <p className="text-muted-foreground">Your Google Calendar has been connected successfully.</p>
              {calendarUrl && (
                <p className="text-sm text-muted-foreground break-all">
                  Calendar URL: <span className="font-mono text-xs">{calendarUrl}</span>
                </p>
              )}
            </div>
            <p className="text-sm text-muted-foreground">Redirecting to events page...</p>
          </div>
        </Card>
      </div>
    );
  }
};

const LoadingFallback = (): React.JSX.Element => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-4 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">Loading</h2>
            <p className="text-muted-foreground">Please wait...</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

const GoogleCallbackPage: NextPage = (): React.JSX.Element => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackHandler />
    </Suspense>
  );
};

export default GoogleCallbackPage;
