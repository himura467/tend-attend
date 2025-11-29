import { LinkProps } from "@/i18n/navigation";
import { formatUrl } from "@/lib/utils/url";
import React from "react";
import { useBaseUrl } from "./useBaseUrl";

/**
 * Hook to generate external (frontend) URLs from LinkProps
 * @returns Function that takes LinkProps and returns a external URL
 */
export const useExternalUrl = (): ((linkProps: LinkProps) => string) => {
  const baseUrl = useBaseUrl();

  return React.useCallback(
    (linkProps: LinkProps): string => {
      const path = formatUrl(linkProps.href);
      return `${baseUrl}${path}`;
    },
    [baseUrl],
  );
};
