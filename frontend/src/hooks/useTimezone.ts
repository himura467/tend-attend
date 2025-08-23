import React from "react";

export const useTimezone = (): string => {
  return React.useMemo(() => {
    if (typeof window === "undefined") {
      return "UTC";
    }
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }, []);
};
