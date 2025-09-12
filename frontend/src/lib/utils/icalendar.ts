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

// Helper function to check if recurrence matches expected frequency
export const matchesFrequency = (recurrences: string[], expectedFreq?: number): boolean => {
  if (expectedFreq === undefined) {
    return recurrences.length === 0;
  }

  const rruleSet = parseRecurrence(recurrences);
  if (!rruleSet || rruleSet._rrule.length === 0) {
    return false;
  }

  const rrule = rruleSet._rrule[0];
  return rrule.options.freq === expectedFreq;
};
