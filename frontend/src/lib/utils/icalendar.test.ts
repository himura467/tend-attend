import { TZDate } from "@/lib/utils/tzdate";
import { datetime, Frequency } from "rrule";
import { describe, expect, it } from "vitest";
import {
  addEXDate,
  addRDate,
  convertRRuleDateToTZDate,
  getEXDates,
  getRDates,
  hasRRule,
  matchesFrequency,
  parseRecurrence,
  removeEXDate,
  removeRDate,
} from "./icalendar";

describe(convertRRuleDateToTZDate, () => {
  it("successfully converts between different timezones", () => {
    const utcDate = datetime(2024, 1, 15, 10, 0, 0);

    // Test conversion to UTC
    const utcResult = convertRRuleDateToTZDate(utcDate, "UTC", "UTC");
    expect(utcResult).toEqual(new TZDate(utcDate));

    // Test conversion to different timezone
    const nyResult = convertRRuleDateToTZDate(utcDate, "UTC", "America/New_York");
    expect(nyResult).toEqual(new TZDate(utcDate, "America/New_York"));
  });
});

describe(parseRecurrence, () => {
  describe("with empty recurrences array", () => {
    it("returns null for empty array", () => {
      const result = parseRecurrence([]);
      expect(result).toBeNull();
    });
  });

  describe("with single RRULE", () => {
    it("handles daily recurrence", () => {
      const recurrences = ["RRULE:FREQ=DAILY"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(3);
    });

    it("handles weekly recurrence with BYDAY", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(2);
      expect(result?._rrule[0].options.byweekday).toStrictEqual([0, 2, 4]);
    });

    it("handles monthly recurrence with COUNT", () => {
      const recurrences = ["RRULE:FREQ=MONTHLY;COUNT=12"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(1);
      expect(result?._rrule[0].options.count).toBe(12);
    });

    it("handles yearly recurrence with UNTIL", () => {
      const recurrences = ["RRULE:FREQ=YEARLY;UNTIL=20251231T235959Z"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(0);
      expect(result?._rrule[0].options.until).toEqual(new TZDate(2025, 11, 31, 23, 59, 59, 0));
    });

    it("handles complex RRULE with multiple parameters", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=TU,TH;COUNT=10"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(2);
      expect(result?._rrule[0].options.interval).toBe(2);
      expect(result?._rrule[0].options.byweekday).toStrictEqual([1, 3]);
      expect(result?._rrule[0].options.count).toBe(10);
    });

    it("generates expected number of dates", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;COUNT=3"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      const dates = result?.all();
      expect(dates).toHaveLength(3);
      expect(Array.isArray(dates)).toBe(true);
    });
  });

  describe("with multiple recurrence rules", () => {
    it("handles two RRULE entries", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;BYDAY=MO", "RRULE:FREQ=MONTHLY;BYMONTHDAY=15"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(2);
      expect(result?._rrule[0].options.freq).toBe(2);
      expect(result?._rrule[1].options.freq).toBe(1);
      expect(result?._rrule[1].options.bymonthday).toStrictEqual([15]);
    });

    it("handles daily RRULE with weekend EXRULE", () => {
      const recurrences = ["RRULE:FREQ=DAILY", "EXRULE:FREQ=WEEKLY;BYDAY=SA,SU"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(3);
      expect(result?._exrule).toHaveLength(1);
      expect(result?._exrule[0].options.freq).toBe(2);
      expect(result?._exrule[0].options.byweekday).toStrictEqual([5, 6]);
    });

    it("handles weekly RRULE with specific RDATE", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;BYDAY=MO", "RDATE:20240115T100000Z,20240125T100000Z"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.byweekday).toStrictEqual([0]);
      expect(result?._rdate).toHaveLength(2);
      expect(result?._rdate[0]).toEqual(new TZDate(2024, 0, 15, 10, 0, 0, 0));
      expect(result?._rdate[1]).toEqual(new TZDate(2024, 0, 25, 10, 0, 0, 0));
    });

    it("handles daily RRULE with COUNT and EXDATE", () => {
      const recurrences = ["RRULE:FREQ=DAILY;COUNT=10", "EXDATE:20240116T100000Z,20240118T100000Z"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(3);
      expect(result?._rrule[0].options.count).toBe(10);
      expect(result?._exdate).toHaveLength(2);
      expect(result?._exdate[0]).toEqual(new TZDate(2024, 0, 16, 10, 0, 0, 0));
      expect(result?._exdate[1]).toEqual(new TZDate(2024, 0, 18, 10, 0, 0, 0));
    });
  });

  describe("error handling", () => {
    it("throws error for completely invalid syntax", () => {
      const recurrences = ["INVALID:RULE"];

      expect(() => parseRecurrence(recurrences)).toThrow();
    });

    it("throws error for invalid frequency value", () => {
      const recurrences = ["RRULE:FREQ=INVALID_FREQUENCY"];

      expect(() => parseRecurrence(recurrences)).toThrow();
    });

    it("throws error for malformed RRULE parameters", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;BYDAY=INVALID_DAY"];

      expect(() => parseRecurrence(recurrences)).toThrow();
    });

    it("throws error when mixing valid and invalid rules", () => {
      const recurrences = ["RRULE:FREQ=DAILY", "INVALID:RULE"];

      expect(() => parseRecurrence(recurrences)).toThrow();
    });
  });

  describe("RFC 5545 compliance", () => {
    it("parses DTSTART with weekly RRULE", () => {
      const recurrences = ["DTSTART:20240101T100000Z", "RRULE:FREQ=WEEKLY;BYDAY=MO"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?.dtstart()).toEqual(new TZDate(2024, 0, 1, 10, 0, 0, 0));
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(2);
      expect(result?._rrule[0].options.byweekday).toStrictEqual([0]);
    });

    it("parses DTSTART with monthly BYSETPOS RRULE", () => {
      const recurrences = ["DTSTART:20240101T100000Z", "RRULE:FREQ=MONTHLY;BYSETPOS=1;BYDAY=MO"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?.dtstart()).toEqual(new TZDate(2024, 0, 1, 10, 0, 0, 0));
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(1);
      expect(result?._rrule[0].options.bysetpos).toStrictEqual([1]);
      expect(result?._rrule[0].options.byweekday).toStrictEqual([0]);
    });

    it("combines DTSTART, RRULE and EXDATE", () => {
      const recurrences = [
        "DTSTART:20240101T100000Z",
        "RRULE:FREQ=MONTHLY;BYSETPOS=1;BYDAY=MO",
        "EXDATE:20240205T100000Z",
      ];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?.dtstart()).toEqual(new TZDate(2024, 0, 1, 10, 0, 0, 0));
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(1);
      expect(result?._rrule[0].options.bysetpos).toStrictEqual([1]);
      expect(result?._rrule[0].options.byweekday).toStrictEqual([0]);
      expect(result?._exdate).toHaveLength(1);
      expect(result?._exdate[0]).toEqual(new TZDate(2024, 1, 5, 10, 0, 0, 0));
    });

    it("parses DTSTART with timezone and weekly RRULE", () => {
      const recurrences = ["DTSTART;TZID=America/New_York:20240101T100000", "RRULE:FREQ=WEEKLY"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?.tzid()).toBe("America/New_York");
      expect(result?.dtstart()).toEqual(new TZDate(2024, 0, 1, 10, 0, 0, 0));
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("trims whitespace from daily RRULE and EXDATE", () => {
      const recurrences = ["  RRULE:FREQ=DAILY  ", "  EXDATE:20240115T100000Z  "];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(3);
      expect(result?._exdate).toHaveLength(1);
      expect(result?._exdate[0]).toEqual(new TZDate(2024, 0, 15, 10, 0, 0, 0));
    });

    it("filters out empty strings from recurrence array", () => {
      const recurrences = ["RRULE:FREQ=DAILY", "", "EXDATE:20240115T100000Z"];
      const result = parseRecurrence(recurrences);

      expect(result).not.toBeNull();
      expect(result?._rrule).toHaveLength(1);
      expect(result?._rrule[0].options.freq).toBe(3);
      expect(result?._exdate).toHaveLength(1);
      expect(result?._exdate[0]).toEqual(new TZDate(2024, 0, 15, 10, 0, 0, 0));
    });
  });
});

describe(hasRRule, () => {
  it("returns false for empty recurrences array", () => {
    const result = hasRRule([]);
    expect(result).toBe(false);
  });

  it("returns true when recurrences contain RRULE", () => {
    const recurrences = ["RRULE:FREQ=DAILY"];
    const result = hasRRule(recurrences);
    expect(result).toBe(true);
  });

  it("returns false when recurrences contain only RDATE", () => {
    const recurrences = ["RDATE:20240115T100000Z"];
    const result = hasRRule(recurrences);
    expect(result).toBe(false);
  });

  it("returns false when recurrences contain only EXDATE", () => {
    const recurrences = ["EXDATE:20240115T100000Z"];
    const result = hasRRule(recurrences);
    expect(result).toBe(false);
  });

  it("returns false when recurrences contain only DTSTART", () => {
    const recurrences = ["DTSTART:20240115T100000Z"];
    const result = hasRRule(recurrences);
    expect(result).toBe(false);
  });

  it("returns true when recurrences contain RRULE with other entries", () => {
    const recurrences = [
      "DTSTART:20240101T100000Z",
      "RRULE:FREQ=WEEKLY",
      "RDATE:20240115T100000Z",
      "EXDATE:20240122T100000Z",
    ];
    const result = hasRRule(recurrences);
    expect(result).toBe(true);
  });

  it("returns true for complex RRULE", () => {
    const recurrences = ["RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE,FR;COUNT=10"];
    const result = hasRRule(recurrences);
    expect(result).toBe(true);
  });

  it("returns false for invalid recurrences", () => {
    const recurrences = ["INVALID:RULE"];
    expect(() => hasRRule(recurrences)).toThrow();
  });
});

describe(matchesFrequency, () => {
  describe("with empty recurrences", () => {
    it("returns true when expectedFreq is undefined", () => {
      const result = matchesFrequency([]);
      expect(result).toBe(true);
    });

    it("returns false when expectedFreq is defined", () => {
      const result = matchesFrequency([], Frequency.DAILY);
      expect(result).toBe(false);
    });
  });

  describe("with frequency matching", () => {
    it("matches daily frequency", () => {
      const recurrences = ["RRULE:FREQ=DAILY;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.DAILY);
      expect(result).toBe(true);
    });

    it("matches weekly frequency", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.WEEKLY);
      expect(result).toBe(true);
    });

    it("matches monthly frequency", () => {
      const recurrences = ["RRULE:FREQ=MONTHLY;BYMONTHDAY=15;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.MONTHLY);
      expect(result).toBe(true);
    });

    it("matches yearly frequency", () => {
      const recurrences = ["RRULE:FREQ=YEARLY;BYMONTH=12;BYMONTHDAY=25;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.YEARLY);
      expect(result).toBe(true);
    });

    it("does not match different frequency", () => {
      const recurrences = ["RRULE:FREQ=DAILY;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.WEEKLY);
      expect(result).toBe(false);
    });
  });

  describe("with interval matching", () => {
    it("matches weekly frequency with interval 1 (default)", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.WEEKLY, 1);
      expect(result).toBe(true);
    });

    it("matches weekly frequency with explicit interval 1", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=MO;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.WEEKLY, 1);
      expect(result).toBe(true);
    });

    it("matches weekly frequency with interval 2", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.WEEKLY, 2);
      expect(result).toBe(true);
    });

    it("does not match weekly frequency with wrong interval", () => {
      const recurrences = ["RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO;BYHOUR=10;BYMINUTE=0;BYSECOND=0"];
      const result = matchesFrequency(recurrences, Frequency.WEEKLY, 1);
      expect(result).toBe(false);
    });
  });
});

describe(getRDates, () => {
  it("returns empty array when no RDATE entries", () => {
    const recurrences = ["RRULE:FREQ=DAILY"];
    const result = getRDates(recurrences, "UTC");
    expect(result).toEqual([]);
  });

  it("returns RDATE entries as TZDate objects", () => {
    const recurrences = ["RRULE:FREQ=WEEKLY", "RDATE:20240115T100000Z,20240125T140000Z"];
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = getRDates(recurrences, localTimezone);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(new TZDate(2024, 0, 15, 10, 0, 0, 0));
    expect(result[1]).toEqual(new TZDate(2024, 0, 25, 14, 0, 0, 0));
  });

  it("returns empty array for empty recurrences", () => {
    const result = getRDates([], "UTC");
    expect(result).toEqual([]);
  });
});

describe(getEXDates, () => {
  it("returns empty array when no EXDATE entries", () => {
    const recurrences = ["RRULE:FREQ=DAILY"];
    const result = getEXDates(recurrences, "UTC");
    expect(result).toEqual([]);
  });

  it("returns EXDATE entries as TZDate objects", () => {
    const recurrences = ["RRULE:FREQ=DAILY", "EXDATE:20240116T100000Z,20240118T100000Z"];
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = getEXDates(recurrences, localTimezone);

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual(new TZDate(2024, 0, 16, 10, 0, 0, 0));
    expect(result[1]).toEqual(new TZDate(2024, 0, 18, 10, 0, 0, 0));
  });

  it("returns empty array for empty recurrences", () => {
    const result = getEXDates([], "UTC");
    expect(result).toEqual([]);
  });
});

describe(addRDate, () => {
  it("adds RDATE to empty recurrences", () => {
    const date = new TZDate(2024, 0, 15, 10, 0, 0, 0);
    const result = addRDate([], date);

    expect(result).toHaveLength(1);
    expect(result[0]).toContain("RDATE:");
  });

  it("adds RDATE to existing recurrences", () => {
    const recurrences = ["RRULE:FREQ=WEEKLY"];
    const date = new TZDate(2024, 0, 15, 10, 0, 0, 0);
    const result = addRDate(recurrences, date);

    expect(result.length).toBeGreaterThan(1);
    expect(result.some((r) => r.includes("RRULE:"))).toBe(true);
    expect(result.some((r) => r.includes("RDATE:"))).toBe(true);
  });
});

describe(addEXDate, () => {
  it("adds EXDATE to empty recurrences", () => {
    const date = new TZDate(2024, 0, 15, 10, 0, 0, 0);
    const result = addEXDate([], date);

    expect(result).toHaveLength(1);
    expect(result[0]).toContain("EXDATE:");
  });

  it("adds EXDATE to existing recurrences", () => {
    const recurrences = ["RRULE:FREQ=DAILY"];
    const date = new TZDate(2024, 0, 16, 10, 0, 0, 0);
    const result = addEXDate(recurrences, date);

    expect(result.length).toBeGreaterThan(1);
    expect(result.some((r) => r.includes("RRULE:"))).toBe(true);
    expect(result.some((r) => r.includes("EXDATE:"))).toBe(true);
  });
});

describe(removeRDate, () => {
  it("returns original recurrences when no RDATE to remove", () => {
    const recurrences = ["RRULE:FREQ=WEEKLY"];
    const date = new TZDate(2024, 0, 15, 10, 0, 0, 0);
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = removeRDate(recurrences, date, localTimezone);

    expect(result).toEqual(recurrences);
  });

  it("removes specified RDATE entry", () => {
    const recurrences = ["RRULE:FREQ=WEEKLY", "RDATE:20240115T100000Z,20240125T140000Z"];
    const dateToRemove = new TZDate("2024-01-15T10:00:00", "UTC").withTimeZone("UTC");
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = removeRDate(recurrences, dateToRemove, localTimezone);
    const rdates = getRDates(result, localTimezone);
    expect(rdates).toHaveLength(1);
    expect(rdates[0]).toEqual(new TZDate(2024, 0, 25, 14, 0, 0, 0));
  });
});

describe(removeEXDate, () => {
  it("returns original recurrences when no EXDATE to remove", () => {
    const recurrences = ["RRULE:FREQ=DAILY"];
    const date = new TZDate(2024, 0, 16, 10, 0, 0, 0);
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = removeEXDate(recurrences, date, localTimezone);

    expect(result).toEqual(recurrences);
  });

  it("removes specified EXDATE entry", () => {
    const recurrences = ["RRULE:FREQ=DAILY", "EXDATE:20240116T100000Z,20240118T100000Z"];
    const dateToRemove = new TZDate("2024-01-16T10:00:00", "UTC").withTimeZone("UTC");
    const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const result = removeEXDate(recurrences, dateToRemove, localTimezone);
    const exdates = getEXDates(result, localTimezone);
    expect(exdates).toHaveLength(1);
    expect(exdates[0]).toEqual(new TZDate(2024, 0, 18, 10, 0, 0, 0));
  });
});
