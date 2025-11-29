import { LinkProps } from "@/i18n/navigation";
import { BACKEND_API_URL, formatUrl } from "@/lib/utils/url";
import React from "react";

/**
 * Hook to generate backend API URLs from LinkProps
 * @returns Function that takes LinkProps and returns a backend URL
 */
export const useBackendUrl = (): ((linkProps: LinkProps) => string) => {
  return React.useCallback((linkProps: LinkProps): string => {
    const path = formatUrl(linkProps.href);
    return `${BACKEND_API_URL}${path}`;
  }, []);
};
