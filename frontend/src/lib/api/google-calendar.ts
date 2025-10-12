import {
  DisconnectGoogleCalendarResponse,
  GetFolloweeCalendarsResponse,
  GetGoogleCalendarAuthUrlResponse,
  GetGoogleCalendarStatusResponse,
  HandleGoogleCalendarOAuthCallbackRequest,
  HandleGoogleCalendarOAuthCallbackResponse,
  SyncGoogleCalendarResponse,
} from "@/lib/api/dtos/google-calendar";
import { fetchWithSHA256Header } from "@/lib/utils/fetch";

/**
 * Get Google OAuth authorization URL for calendar integration.
 * @param state - Optional OAuth state parameter for CSRF protection
 * @returns Authorization URL to redirect user to Google OAuth
 */
export const getGoogleCalendarAuthUrl = async (state?: string): Promise<GetGoogleCalendarAuthUrlResponse> => {
  const queryParams = state ? `?state=${encodeURIComponent(state)}` : "";
  return fetchWithSHA256Header<GetGoogleCalendarAuthUrlResponse>(`/google-calendar/auth/url${queryParams}`, {
    method: "GET",
    credentials: "include",
  });
};

/**
 * Handle Google OAuth callback and create calendar integration.
 * @param data - OAuth callback data containing authorization code
 * @returns Integration details including ID and calendar URL
 */
export const handleGoogleCalendarOAuthCallback = async (
  data: HandleGoogleCalendarOAuthCallbackRequest,
): Promise<HandleGoogleCalendarOAuthCallbackResponse> => {
  return fetchWithSHA256Header<HandleGoogleCalendarOAuthCallbackResponse>("/google-calendar/auth/callback", {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
  });
};

/**
 * Get current Google Calendar integration status for the authenticated user.
 * @returns Integration status including connection state and calendar URL
 */
export const getGoogleCalendarStatus = async (): Promise<GetGoogleCalendarStatusResponse> => {
  return fetchWithSHA256Header<GetGoogleCalendarStatusResponse>("/google-calendar/status", {
    method: "GET",
    credentials: "include",
  });
};

/**
 * Disconnect Google Calendar integration for the authenticated user.
 * @returns Response indicating success or failure
 */
export const disconnectGoogleCalendar = async (): Promise<DisconnectGoogleCalendarResponse> => {
  return fetchWithSHA256Header<DisconnectGoogleCalendarResponse>("/google-calendar/disconnect", {
    method: "POST",
    credentials: "include",
  });
};

/**
 * Sync user events to Google Calendar.
 * @returns Sync status and number of events synced
 */
export const syncGoogleCalendar = async (): Promise<SyncGoogleCalendarResponse> => {
  return fetchWithSHA256Header<SyncGoogleCalendarResponse>("/google-calendar/sync", {
    method: "POST",
    credentials: "include",
  });
};

/**
 * Get calendar URLs for all followees who have Google Calendar integration.
 * @returns List of followee calendar information
 */
export const getFolloweeCalendars = async (): Promise<GetFolloweeCalendarsResponse> => {
  return fetchWithSHA256Header<GetFolloweeCalendarsResponse>("/google-calendar/followees", {
    method: "GET",
    credentials: "include",
  });
};
