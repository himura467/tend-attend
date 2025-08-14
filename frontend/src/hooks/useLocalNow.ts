import { applyTimezone } from "@/lib/utils/timezone";
import { TZDate } from "@/lib/utils/tzdate";
import React from "react";
import { useTimezone } from "./useTimezone";

export const useLocalNow = (): TZDate => {
  const timezone = useTimezone();
  return React.useMemo(() => applyTimezone(new TZDate(), timezone), [timezone]);
};
