"use client";

import { ErrorState } from "@/components/organisms/specific/auth/google/callback/ErrorState";
import { LoadingState } from "@/components/organisms/specific/auth/google/callback/LoadingState";
import { SuccessState } from "@/components/organisms/specific/auth/google/callback/SuccessState";
import { useRouter } from "@/i18n/navigation";
import { handleGoogleCalendarOAuthCallback } from "@/lib/api/google-calendar";
import { parseOAuthCallback, verifyOAuthState } from "@/lib/utils/google-auth";
import { rr } from "@/lib/utils/reverseRouter";
import { routerPush } from "@/lib/utils/router";
import React from "react";

interface GoogleCallbackContentProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export const GoogleCallbackContent = ({ searchParams }: GoogleCallbackContentProps): React.JSX.Element => {
  const router = useRouter();

  const [calendarUrl, setCalendarUrl] = React.useState<string>("");
  const [status, setStatus] = React.useState<"success" | "loading" | "error">("loading");
  const [errorMessage, setErrorMessage] = React.useState<string>("");

  React.useEffect(() => {
    const handleCallback = async (): Promise<void> => {
      try {
        // Parse callback parameters
        const { code, state, error } = parseOAuthCallback(searchParams);

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

        setCalendarUrl(response.calendar_url || "");
        setStatus("success");

        // Redirect to integrations page after a short delay
        setTimeout(() => {
          routerPush(rr.settings.integrations.index(), router);
        }, 1000);
      } catch (e) {
        const error = e instanceof Error ? e.message : "Failed to connect Google Calendar";
        setErrorMessage(error);
        setStatus("error");
      }
    };

    void handleCallback();
  }, [searchParams, router]);

  if (status === "success") {
    return <SuccessState calendarUrl={calendarUrl} />;
  } else if (status === "loading") {
    return <LoadingState />;
  } else {
    return <ErrorState errorMessage={errorMessage} />;
  }
};
