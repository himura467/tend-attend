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
 * Parse OAuth callback parameters
 * @param params - Search params object from Next.js
 * @returns Object containing code, state, and error if present
 * @throws Error if duplicate parameters are detected
 */
export const parseOAuthCallback = (params: {
  [key: string]: string | string[] | undefined;
}): {
  code: string | null;
  state: string | null;
  error: string | null;
} => {
  const getValue = (key: string): string | null => {
    const value = params[key];
    if (!value) return null;

    // Reject duplicate parameters
    if (Array.isArray(value)) {
      throw new Error(`Duplicate OAuth parameter detected: ${key}`);
    }

    return value;
  };

  return {
    code: getValue("code"),
    state: getValue("state"),
    error: getValue("error"),
  };
};
