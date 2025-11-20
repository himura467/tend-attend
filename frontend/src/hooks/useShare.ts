import React from "react";
import { toast } from "sonner";

interface UseShareReturn {
  share: (data: ShareData) => Promise<void>;
  canShare: (data?: ShareData) => boolean;
}

/**
 * Hook for sharing content using Web Share API
 * @returns Object with share function and canShare checker
 */
export const useShare = (): UseShareReturn => {
  const canShare = React.useCallback((data?: ShareData): boolean => {
    if (typeof window === "undefined" || !navigator.canShare) {
      return false;
    }
    return data ? navigator.canShare(data) : true;
  }, []);

  const share = React.useCallback(
    async (data: ShareData): Promise<void> => {
      if (!canShare(data)) {
        toast.error("Web Share API not available");
        throw new Error("Web Share API not available");
      }

      try {
        await navigator.share(data);
      } catch (error) {
        // User cancelled share dialog
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }
        toast.error("Failed to share");
        throw error;
      }
    },
    [canShare],
  );

  return { share, canShare };
};
