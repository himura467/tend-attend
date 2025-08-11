import { TZDate } from "@/lib/utils/tzdate";

export const applyTimezone = (date: TZDate, timezone: string): TZDate => {
  return date.withTimeZone(timezone);
};
