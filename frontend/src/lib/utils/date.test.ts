import { TZDate } from "@/lib/utils/tzdate";
import { describe, expect, it } from "vitest";
import { getYmdDeltaDays, getYmdHm15DeltaMinutes, parseYmdDate, parseYmdHm15Date } from "./date";

describe(parseYmdDate, () => {
  it("accepts TZDate with midnight time", () => {
    const date = new TZDate("2024-01-15");
    const result = parseYmdDate(date);
    expect(result).toBeInstanceOf(TZDate);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("rejects TZDate with non-midnight time", () => {
    const date = new TZDate("2024-01-15T14:30:00");
    expect(() => parseYmdDate(date)).toThrow("Date must only contain YYYY-MM-DD (time part must be 00:00:00.000).");
  });

  it("accepts string that converts to midnight", () => {
    const result = parseYmdDate("2024-01-15");
    expect(result).toBeInstanceOf(TZDate);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("preserves timezone information", () => {
    const result = parseYmdDate("2024-01-15T15:00:00.000", "Asia/Tokyo");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(16);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.timeZone).toBe("Asia/Tokyo");
  });
});

describe(parseYmdHm15Date, () => {
  it("accepts TZDate with valid 15-minute intervals", () => {
    const validMinutes = [0, 15, 30, 45];
    validMinutes.forEach((minute) => {
      const date = new TZDate(`2024-01-15T14:${minute.toString().padStart(2, "0")}:00`);
      const result = parseYmdHm15Date(date);
      expect(result).toBeInstanceOf(TZDate);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(minute);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });
  });

  it("rejects TZDate with invalid minute intervals", () => {
    const invalidMinutes = [1, 14, 16, 29, 31, 44, 46, 59];
    invalidMinutes.forEach((minute) => {
      const date = new TZDate(`2024-01-15T14:${minute.toString().padStart(2, "0")}:00`, "UTC");
      expect(() => parseYmdHm15Date(date)).toThrow(
        "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0.",
      );
    });
  });

  it("rejects TZDate with non-zero seconds", () => {
    const date = new TZDate("2024-01-15T14:30:30", "UTC");
    expect(() => parseYmdHm15Date(date)).toThrow(
      "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0.",
    );
  });

  it("rejects TZDate with non-zero milliseconds", () => {
    const date = new TZDate("2024-01-15T14:30:00.500", "UTC");
    expect(() => parseYmdHm15Date(date)).toThrow(
      "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0.",
    );
  });

  it("preserves timezone information", () => {
    const result = parseYmdHm15Date("2024-01-15T14:30:00", "Europe/London");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(14);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
    expect(result.timeZone).toBe("Europe/London");
  });
});

describe(getYmdDeltaDays, () => {
  it("calculates positive day difference correctly", () => {
    const before = parseYmdDate(new TZDate(2024, 0, 10, 0, 0, 0, 0));
    const after = parseYmdDate(new TZDate(2024, 0, 15, 0, 0, 0, 0));
    const result = getYmdDeltaDays(before, after);
    expect(result).toBe(5);
  });

  it("calculates negative day difference correctly", () => {
    const before = parseYmdDate(new TZDate(2024, 0, 15, 0, 0, 0, 0));
    const after = parseYmdDate(new TZDate(2024, 0, 10, 0, 0, 0, 0));
    const result = getYmdDeltaDays(before, after);
    expect(result).toBe(-5);
  });

  it("returns zero when dates are the same", () => {
    const date1 = parseYmdDate(new TZDate(2024, 0, 15, 0, 0, 0, 0));
    const date2 = parseYmdDate(new TZDate(2024, 0, 15, 0, 0, 0, 0));
    const result = getYmdDeltaDays(date1, date2);
    expect(result).toBe(0);
  });

  it("validates before date using ymdDateSchema", () => {
    const before = new TZDate(2024, 0, 10, 14, 30, 0, 0); // Invalid: non-midnight time
    const after = parseYmdDate(new TZDate(2024, 0, 15, 0, 0, 0, 0));
    expect(() => getYmdDeltaDays(before, after)).toThrow(
      "Date must only contain YYYY-MM-DD (time part must be 00:00:00.000).",
    );
  });

  it("validates after date using ymdDateSchema", () => {
    const before = parseYmdDate(new TZDate(2024, 0, 10, 0, 0, 0, 0));
    const after = new TZDate(2024, 0, 15, 14, 30, 0, 0); // Invalid: non-midnight time
    expect(() => getYmdDeltaDays(before, after)).toThrow(
      "Date must only contain YYYY-MM-DD (time part must be 00:00:00.000).",
    );
  });
});

describe(getYmdHm15DeltaMinutes, () => {
  it("calculates positive minute difference correctly", () => {
    const before = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 0, 0, 0));
    const after = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 45, 0, 0));
    const result = getYmdHm15DeltaMinutes(before, after);
    expect(result).toBe(45);
  });

  it("calculates negative minute difference correctly", () => {
    const before = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 45, 0, 0));
    const after = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 0, 0, 0));
    const result = getYmdHm15DeltaMinutes(before, after);
    expect(result).toBe(-45);
  });

  it("returns zero when times are the same", () => {
    const time1 = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 30, 0, 0));
    const time2 = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 30, 0, 0));
    const result = getYmdHm15DeltaMinutes(time1, time2);
    expect(result).toBe(0);
  });

  it("validates before time using ymdHm15DateSchema", () => {
    const before = new TZDate(2024, 0, 15, 14, 20, 0, 0); // Invalid: not 15-minute interval
    const after = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 30, 0, 0));
    expect(() => getYmdHm15DeltaMinutes(before, after)).toThrow(
      "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0.",
    );
  });

  it("validates after time using ymdHm15DateSchema", () => {
    const before = parseYmdHm15Date(new TZDate(2024, 0, 15, 14, 15, 0, 0));
    const after = new TZDate(2024, 0, 15, 14, 35, 0, 0); // Invalid: not 15-minute interval
    expect(() => getYmdHm15DeltaMinutes(before, after)).toThrow(
      "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0.",
    );
  });
});
