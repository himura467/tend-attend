import { LinkProps } from "@/i18n/navigation";
import { BACKEND_API_URL, formatUrl } from "@/lib/utils/url";
import React from "react";

/**
 * Hook to generate QR code URLs from LinkProps
 * The QR code service expects a path starting with /qrcode followed by the target URL path
 * @returns Function that takes LinkProps and returns a QR code backend URL
 */
export const useQrCodeUrl = (): ((linkProps: LinkProps) => string) => {
  return React.useCallback((linkProps: LinkProps): string => {
    const path = formatUrl(linkProps.href);
    return `${BACKEND_API_URL}/qrcode${path}`;
  }, []);
};
