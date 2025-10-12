/**
 * Google OAuth state parameter utilities for CSRF protection
 */

/**
 * Generate a random state parameter for OAuth CSRF protection
 * @returns A random state string
 */
export const generateOAuthState = (): string => {
  return crypto.randomUUID();
};

/**
 * Store OAuth state in sessionStorage for verification during callback
 * @param state - The state to store
 */
export const storeOAuthState = (state: string): void => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem("google_oauth_state", state);
  }
};

/**
 * Retrieve and clear OAuth state from sessionStorage
 * @returns The stored state or null if not found
 */
export const getAndClearOAuthState = (): string | null => {
  if (typeof window !== "undefined") {
    const state = sessionStorage.getItem("google_oauth_state");
    sessionStorage.removeItem("google_oauth_state");
    return state;
  }
  return null;
};

/**
 * Verify OAuth state matches the stored value
 * @param receivedState - The state received from OAuth callback
 * @returns true if state is valid, false otherwise
 */
export const verifyOAuthState = (receivedState: string | null): boolean => {
  if (!receivedState) return false;
  const storedState = getAndClearOAuthState();
  return storedState === receivedState;
};

/**
 * Parse OAuth callback URL parameters
 * @param url - The callback URL or search params string
 * @returns Object containing code, state, and error if present
 */
export const parseOAuthCallback = (
  url: string,
): {
  code: string | null;
  state: string | null;
  error: string | null;
} => {
  const searchParams = new URLSearchParams(url);
  return {
    code: searchParams.get("code"),
    state: searchParams.get("state"),
    error: searchParams.get("error"),
  };
};

/**
 * Build the OAuth redirect URI for Google Calendar integration
 * @returns The redirect URI based on current origin
 */
export const getOAuthRedirectUri = (): string => {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.origin}/auth/google/callback`;
};
