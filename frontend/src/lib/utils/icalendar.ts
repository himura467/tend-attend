import { TZDate } from "@/lib/utils/tzdate";
import { datetime, Frequency, RRuleSet, rrulestr } from "rrule";

// Export types and enums for other modules to use
export { Frequency } from "rrule";
export type { Options as RRuleOptions } from "rrule";

/**
 * Convert a Date instance from rrule.js to TZDate with proper timezone handling
 * @param date - Date instance from rrule.js
 * @param localTimezone - Local timezone identifier for the conversion
 * @param targetTimezone - Target timezone identifier (from RRuleSet)
 * @returns TZDate instance with proper timezone conversion
 */
export const convertRRuleDateToTZDate = (date: Date, localTimezone: string, targetTimezone: string): TZDate => {
  return new TZDate(
    new TZDate(date, localTimezone).withTimeZone("UTC").toISOString({ excludeZ: true }),
    targetTimezone,
  );
};

/**
 * Parse recurrence strings into an RRuleSet object
 * @param recurrences - Array of recurrence rule strings
 * @returns RRuleSet object or null if no recurrences
 */
export const parseRecurrence = (recurrences: string[]): RRuleSet | null => {
  if (recurrences.length === 0) return null;
  const rfcString = recurrences.join("\n");

  // Always use forceset to ensure we get an RRuleSet, which properly handles RDATE/EXDATE
  const result = rrulestr(rfcString, {
    cache: true,
    forceset: true,
  });

  return result as RRuleSet;
};

/**
 * Convert RRuleSet back to string array format for backend compatibility
 * Uses rrule's built-in valueOf() which produces RFC 5545 compliant string array
 * @param rruleSet - The RRuleSet to convert
 * @returns Array of RFC 5545 compliant recurrence strings
 */
function rruleSetToStrings(rruleSet: RRuleSet): string[] {
  return rruleSet.valueOf();
}

/**
 * Check if recurrence has any RRULE
 * @param recurrences - Array of recurrence rule strings
 * @returns True if recurrence contains at least one RRULE
 */
export const hasRRule = (recurrences: string[]): boolean => {
  const rruleSet = parseRecurrence(recurrences);
  return rruleSet ? rruleSet._rrule.length > 0 : false;
};

/**
 * Check if recurrence matches expected frequency and interval
 * @param recurrences - Array of recurrence rule strings
 * @param expectedFreq - Expected frequency value (optional)
 * @param expectedInterval - Expected interval value (optional)
 * @returns True if recurrence matches the expected frequency and interval
 */
export const matchesFrequency = (
  recurrences: string[],
  expectedFreq?: Frequency,
  expectedInterval?: number,
): boolean => {
  if (expectedFreq === undefined) {
    return recurrences.length === 0;
  }

  const rruleSet = parseRecurrence(recurrences);
  if (!rruleSet || rruleSet._rrule.length === 0) {
    return false;
  }

  const options = rruleSet._rrule[0].options;

  // Check frequency
  if (expectedFreq !== undefined && options.freq !== expectedFreq) {
    return false;
  }

  // Check interval
  if (expectedInterval !== undefined && options.interval !== expectedInterval) {
    return false;
  }

  return true;
};

/**
 * Get RDATE dates from recurrence strings
 * @param recurrences - Array of recurrence rule strings
 * @param timezone - Timezone identifier
 * @returns Array of RDATE dates as TZDate objects
 */
export const getRDates = (recurrences: string[], timezone: string): TZDate[] => {
  const rruleSet = parseRecurrence(recurrences);
  if (!rruleSet) return [];

  return rruleSet._rdate.map((rdate) => {
    return convertRRuleDateToTZDate(rdate, timezone, rruleSet.tzid());
  });
};

/**
 * Get EXDATE dates from recurrence strings
 * @param recurrences - Array of recurrence rule strings
 * @param timezone - Timezone identifier
 * @returns Array of EXDATE dates as TZDate objects
 */
export const getEXDates = (recurrences: string[], timezone: string): TZDate[] => {
  const rruleSet = parseRecurrence(recurrences);
  if (!rruleSet) return [];

  return rruleSet._exdate.map((exdate) => {
    return convertRRuleDateToTZDate(exdate, timezone, rruleSet.tzid());
  });
};

/**
 * Add RDATE to existing recurrence strings
 * @param recurrences - Array of existing recurrence rule strings
 * @param newDate - Date to add as RDATE
 * @returns Updated array of recurrence strings with new RDATE
 */
export const addRDate = (recurrences: string[], newDate: TZDate): string[] => {
  const rruleSet = parseRecurrence(recurrences) || new RRuleSet();
  const utcDate = datetime(
    newDate.getFullYear(),
    newDate.getMonth() + 1, // rrule.datetime uses 1-based months
    newDate.getDate(),
    newDate.getHours(),
    newDate.getMinutes(),
    newDate.getSeconds(),
  );
  rruleSet.rdate(utcDate);
  return rruleSetToStrings(rruleSet);
};

/**
 * Add EXDATE to existing recurrence strings
 * @param recurrences - Array of existing recurrence rule strings
 * @param newDate - Date to add as EXDATE
 * @returns Updated array of recurrence strings with new EXDATE
 */
export const addEXDate = (recurrences: string[], newDate: TZDate): string[] => {
  const rruleSet = parseRecurrence(recurrences) || new RRuleSet();
  const utcDate = datetime(
    newDate.getFullYear(),
    newDate.getMonth() + 1, // rrule.datetime uses 1-based months
    newDate.getDate(),
    newDate.getHours(),
    newDate.getMinutes(),
    newDate.getSeconds(),
  );
  rruleSet.exdate(utcDate);
  return rruleSetToStrings(rruleSet);
};

/**
 * Remove RDATE from existing recurrence strings
 * @param recurrences - Array of existing recurrence rule strings
 * @param dateToRemove - Date to remove from RDATE list
 * @param timezone - Timezone identifier
 * @returns Updated array of recurrence strings with RDATE removed
 */
export const removeRDate = (recurrences: string[], dateToRemove: TZDate, timezone: string): string[] => {
  const rruleSet = parseRecurrence(recurrences);
  if (!rruleSet) return recurrences;

  const newRRuleSet = new RRuleSet();
  rruleSet._rrule.forEach((rule) => newRRuleSet.rrule(rule));
  rruleSet._rdate.forEach((rdate) => {
    if (convertRRuleDateToTZDate(rdate, timezone, rruleSet.tzid()).getTime() !== dateToRemove.getTime()) {
      newRRuleSet.rdate(rdate);
    }
  });
  rruleSet._exdate.forEach((exdate) => newRRuleSet.exdate(exdate));

  return rruleSetToStrings(newRRuleSet);
};

/**
 * Remove EXDATE from existing recurrence strings
 * @param recurrences - Array of existing recurrence rule strings
 * @param dateToRemove - Date to remove from EXDATE list
 * @param timezone - Timezone identifier
 * @returns Updated array of recurrence strings with EXDATE removed
 */
export const removeEXDate = (recurrences: string[], dateToRemove: TZDate, timezone: string): string[] => {
  const rruleSet = parseRecurrence(recurrences);
  if (!rruleSet) return recurrences;

  const newRRuleSet = new RRuleSet();
  rruleSet._rrule.forEach((rule) => newRRuleSet.rrule(rule));
  rruleSet._rdate.forEach((rdate) => newRRuleSet.rdate(rdate));
  rruleSet._exdate.forEach((exdate) => {
    if (convertRRuleDateToTZDate(exdate, timezone, rruleSet.tzid()).getTime() !== dateToRemove.getTime()) {
      newRRuleSet.exdate(exdate);
    }
  });

  return rruleSetToStrings(newRRuleSet);
};
