import React from "react";

/**
 * Hook to get the base URL (origin) of the current page
 * Returns empty string during SSR and the actual origin on the client
 */
export const useBaseUrl = (): string => {
  const [baseUrl, setBaseUrl] = React.useState<string>("");

  React.useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  return baseUrl;
};
