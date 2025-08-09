import { RRuleSet, rrulestr } from "rrule";

export const parseRecurrence = (recurrences: string[]): RRuleSet | null => {
  if (recurrences.length === 0) return null;
  const rfcString = recurrences.join("\n");
  const result = rrulestr(rfcString);
  if (result instanceof RRuleSet) {
    return result;
  }
  const rruleSet = new RRuleSet();
  rruleSet.rrule(result);
  return rruleSet;
};
