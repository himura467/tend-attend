import { describe, expect, it } from "vitest";
import {
  formatToLocaleYmdHm,
  getCurrentYmdDate,
  getYmdDeltaDays,
  getYmdHm15DeltaMinutes,
  parseYmdDate,
  parseYmdHm15Date,
  type YmdDate,
  type YmdHm15Date,
} from "./date";

describe(parseYmdDate, () => {
  it("parses valid Date object correctly", () => {
    const date = new Date(2024, 0, 15, 15, 0, 0, 0);
    const result = parseYmdDate(date, "UTC", "Asia/Tokyo");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(16);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("parses valid string correctly", () => {
    const result = parseYmdDate("2024-01-15T07:00:00", "Asia/Tokyo", "Africa/Johannesburg");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("throws error when ymdDateSchema cannot parse due to invalid time components", () => {
    const date = new Date(2024, 0, 15, 0, 0, 0, 0);
    expect(() => parseYmdDate(date, "Asia/Shanghai", "UTC")).toThrow(
      "Date must only contain YYYY-MM-DD (time part must be 00:00:00.000).",
    );
  });
});

describe(parseYmdHm15Date, () => {
  it("parses valid Date object correctly", () => {
    const date = new Date(2024, 0, 15, 15, 30, 0, 0);
    const result = parseYmdHm15Date(date, "UTC", "Asia/Tokyo");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(16);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("parses valid string correctly", () => {
    const result = parseYmdHm15Date("2024-01-15T08:15:00", "Asia/Tokyo", "Africa/Johannesburg");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(1);
    expect(result.getMinutes()).toBe(15);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("throws error when ymdHm15DateSchema cannot parse due to invalid time components", () => {
    const date = new Date(2024, 0, 15, 0, 40, 0, 0);
    expect(() => parseYmdHm15Date(date, "Asia/Shanghai", "UTC")).toThrow(
      "Minutes must be 0, 15, 30, or 45, and seconds/milliseconds must be 0.",
    );
  });
});

describe(getCurrentYmdDate, () => {
  it("sets time to midnight for Date object", () => {
    const date = new Date(2024, 0, 15, 14, 30, 45, 123);
    const result = getCurrentYmdDate(date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it("sets time to midnight for string input", () => {
    const result = getCurrentYmdDate("2024-01-15T14:30:45");
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe(getYmdDeltaDays, () => {
  it("calculates positive day difference correctly", () => {
    const before = new Date(2024, 0, 10, 0, 0, 0, 0) as YmdDate;
    const after = new Date(2024, 0, 15, 0, 0, 0, 0) as YmdDate;
    const result = getYmdDeltaDays(before, after);
    expect(result).toBe(5);
  });

  it("calculates negative day difference correctly", () => {
    const before = new Date(2024, 0, 15, 0, 0, 0, 0) as YmdDate;
    const after = new Date(2024, 0, 10, 0, 0, 0, 0) as YmdDate;
    const result = getYmdDeltaDays(before, after);
    expect(result).toBe(-5);
  });

  it("returns zero when dates are the same", () => {
    const date1 = new Date(2024, 0, 15, 0, 0, 0, 0) as YmdDate;
    const date2 = new Date(2024, 0, 15, 0, 0, 0, 0) as YmdDate;
    const result = getYmdDeltaDays(date1, date2);
    expect(result).toBe(0);
  });
});

describe(getYmdHm15DeltaMinutes, () => {
  it("calculates positive minute difference correctly", () => {
    const before = new Date(2024, 0, 15, 14, 0, 0, 0) as YmdHm15Date;
    const after = new Date(2024, 0, 15, 14, 45, 0, 0) as YmdHm15Date;
    const result = getYmdHm15DeltaMinutes(before, after);
    expect(result).toBe(45);
  });

  it("calculates negative minute difference correctly", () => {
    const before = new Date(2024, 0, 15, 14, 45, 0, 0) as YmdHm15Date;
    const after = new Date(2024, 0, 15, 14, 0, 0, 0) as YmdHm15Date;
    const result = getYmdHm15DeltaMinutes(before, after);
    expect(result).toBe(-45);
  });

  it("returns zero when times are the same", () => {
    const time1 = new Date(2024, 0, 15, 14, 30, 0, 0) as YmdHm15Date;
    const time2 = new Date(2024, 0, 15, 14, 30, 0, 0) as YmdHm15Date;
    const result = getYmdHm15DeltaMinutes(time1, time2);
    expect(result).toBe(0);
  });
});

describe(formatToLocaleYmdHm, () => {
  it("formats date without timezone conversion", () => {
    const date = new Date(2024, 0, 15, 14, 30, 45, 123);
    const result = formatToLocaleYmdHm(date);
    expect(result).toBe("01/15/2024, 02:30 PM");
  });

  it("formats date with timezone conversion when both timezones provided", () => {
    const date = new Date(2024, 0, 15, 14, 30, 45, 123);
    const result = formatToLocaleYmdHm(date, "UTC", "Asia/Tokyo");
    expect(result).toBe("01/15/2024, 11:30 PM");
  });

  it("ignores timezone conversion when only srcTz provided", () => {
    const date = new Date(2024, 0, 15, 14, 30, 0, 0);
    const result = formatToLocaleYmdHm(date, "UTC");
    expect(result).toBe("01/15/2024, 02:30 PM");
  });

  it("ignores timezone conversion when only dstTz provided", () => {
    const date = new Date(2024, 0, 15, 14, 30, 0, 0);
    const result = formatToLocaleYmdHm(date, undefined, "UTC");
    expect(result).toBe("01/15/2024, 02:30 PM");
  });
});
