import { LinkProps } from "@/i18n/navigation";
import { BACKEND_API_URL, formatUrl } from "@/lib/utils/url";
import React from "react";

/**
 * Hook to generate QR code URLs from LinkProps with optional query parameters
 * The QR code service expects a path starting with /qrcode followed by the target URL path
 * Optional query parameters can be provided to customize the QR code (e.g., width, height, image, etc.)
 * @returns Function that takes LinkProps and optional query parameters, returns a QR code backend URL
 */
export const useQrCodeUrl = (): ((linkProps: LinkProps, queryParams?: Record<string, string | number>) => string) => {
  return React.useCallback((linkProps: LinkProps, queryParams?: Record<string, string | number>): string => {
    let modifiedHref = linkProps.href;

    // Add query parameters if provided and not already present
    if (queryParams && Object.keys(queryParams).length > 0) {
      const existingQuery =
        typeof modifiedHref === "object" && modifiedHref.query && typeof modifiedHref.query === "object"
          ? modifiedHref.query
          : {};
      const newQuery = { ...existingQuery };

      for (const [key, value] of Object.entries(queryParams)) {
        if (existingQuery[key]) {
          console.warn(
            `useQrCodeUrl: ${key}=${value} provided as argument but ${key}=${existingQuery[key]} already exists in query parameters. Using existing value.`,
          );
        } else {
          newQuery[key] = typeof value === "number" ? value.toString() : value;
        }
      }

      if (typeof modifiedHref === "object") {
        modifiedHref = {
          ...modifiedHref,
          query: newQuery,
        };
      } else {
        // If href is a string, convert to object with query
        modifiedHref = {
          pathname: modifiedHref,
          query: newQuery,
        };
      }
    }

    const path = formatUrl(modifiedHref);
    return `${BACKEND_API_URL}/qrcode${path}`;
  }, []);
};
