import { format } from "date-fns";
import React from "react";

/**
 * Hook that safely formats dates with SSR support using useSyncExternalStore
 * to prevent hydration mismatches between server and client rendering
 */
export const useSSRSafeFormat = (date: Date, formatString: string): string => {
  return React.useSyncExternalStore(
    () => () => {},
    () => format(date, formatString),
    () => "",
  );
};
