import React from "react";
import { toast } from "sonner";

interface UseClipboardReturn {
  copy: (text: string, successMessage?: string) => Promise<void>;
  isSupported: boolean;
}

/**
 * Hook for copying text to clipboard with toast notifications
 * @returns Object with copy function and isSupported flag
 */
export const useClipboard = (): UseClipboardReturn => {
  const isSupported = React.useMemo(() => {
    return typeof window !== "undefined" && !!navigator.clipboard;
  }, []);

  const copy = React.useCallback(
    async (text: string, successMessage = "Copied to clipboard"): Promise<void> => {
      if (!isSupported) {
        toast.error("Clipboard API not available");
        throw new Error("Clipboard API not available");
      }

      try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
      } catch (e) {
        const error = e instanceof Error ? e : new Error("Failed to copy to clipboard");
        toast.error(error.message);
        throw error;
      }
    },
    [isSupported],
  );

  return { copy, isSupported };
};
