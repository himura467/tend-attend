import { RRule } from "rrule";

export const parseRecurrence = (recurrences: string[]): RRule | null => {
  if (recurrences.length === 0) return null;
  const rfcString = recurrences.join("\n");
  return RRule.fromString(rfcString);
};
