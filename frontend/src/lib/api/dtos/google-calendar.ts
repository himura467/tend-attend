export type GoogleCalendarSyncStatus = "disconnected" | "connected" | "syncing" | "error";

export interface FolloweeCalendarInfo {
  username: string;
  nickname: string | null;
  calendar_url: string;
}

export interface GetGoogleCalendarAuthUrlResponse {
  authorization_url: string;
  error_codes: number[];
}

export interface HandleGoogleCalendarOAuthCallbackRequest {
  auth_code: string;
}

export interface HandleGoogleCalendarOAuthCallbackResponse {
  integration_id: string | null;
  calendar_url: string | null;
  error_codes: number[];
}

export interface GetGoogleCalendarStatusResponse {
  integration_id: string | null;
  google_email: string | null;
  calendar_url: string | null;
  sync_status: GoogleCalendarSyncStatus | null;
  error_codes: number[];
}

export interface DisconnectGoogleCalendarResponse {
  error_codes: number[];
}

export interface SyncGoogleCalendarResponse {
  sync_status: GoogleCalendarSyncStatus | null;
  events_synced: number | null;
  error_codes: number[];
}

export interface GetFolloweeCalendarsResponse {
  calendars: FolloweeCalendarInfo[];
  error_codes: number[];
}
