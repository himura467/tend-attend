import { useEffect, useState } from "react";

export const useTimezone = (): string => {
  const [timezone, setTimezone] = useState<string>("");

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  return timezone;
};
