import { LinkProps } from "@/i18n/navigation";
import { BACKEND_API_URL, formatUrl } from "@/lib/utils/url";
import React from "react";

/**
 * Hook to generate QR code URLs from LinkProps with optional dimensions
 * The QR code service expects a path starting with /qrcode followed by the target URL path
 * Optional width and height can be provided as query parameters
 * @returns Function that takes LinkProps and optional width/height, returns a QR code backend URL
 */
export const useQrCodeUrl = (): ((linkProps: LinkProps, options?: { width?: number; height?: number }) => string) => {
  return React.useCallback((linkProps: LinkProps, options?: { width?: number; height?: number }): string => {
    let modifiedHref = linkProps.href;

    // Add width and height to query if provided and not already present
    if (options?.width || options?.height) {
      const existingQuery =
        typeof modifiedHref === "object" && modifiedHref.query && typeof modifiedHref.query === "object"
          ? modifiedHref.query
          : {};
      const newQuery = { ...existingQuery };

      if (options.width) {
        if (existingQuery.width) {
          console.warn(
            `useQrCodeUrl: width=${options.width} provided as argument but width=${existingQuery.width} already exists in query parameters. Using existing value.`,
          );
        } else {
          newQuery.width = options.width.toString();
        }
      }
      if (options.height) {
        if (existingQuery.height) {
          console.warn(
            `useQrCodeUrl: height=${options.height} provided as argument but height=${existingQuery.height} already exists in query parameters. Using existing value.`,
          );
        } else {
          newQuery.height = options.height.toString();
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
