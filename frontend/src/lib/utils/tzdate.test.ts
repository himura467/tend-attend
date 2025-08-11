import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TZDate } from "./tzdate";

describe(TZDate, () => {
  describe("constructor with no arguments", () => {
    it("creates a new TZDate with current time in UTC", () => {
      const date = new TZDate();
      const now = new Date();

      // Check that the date is within 1 second of current UTC time
      const timeDiff = Math.abs(date.getTime() - now.getTime());
      expect(timeDiff).toBeLessThan(1000);
      expect(date.timeZone).toBe("UTC");
    });
  });

  describe("constructor with ISO-8601 string", () => {
    it("accepts valid YYYY-MM-DD format", () => {
      const date = new TZDate("2024-01-15");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(0);
      expect(date.getMinutes()).toBe(0);
      expect(date.getSeconds()).toBe(0);
      expect(date.getMilliseconds()).toBe(0);
      expect(date.timeZone).toBe("UTC");
    });

    it("accepts valid YYYY-MM-DDTHH:mm:ss format", () => {
      const date = new TZDate("2024-01-15T14:30:45");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(0);
      expect(date.timeZone).toBe("UTC");
    });

    it("accepts valid YYYY-MM-DDTHH:mm:ss.sss format", () => {
      const date = new TZDate("2024-01-15T14:30:45.123");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
      expect(date.timeZone).toBe("UTC");
    });

    it("accepts timezone parameter with ISO string", () => {
      const date = new TZDate("2024-01-15T14:30:45", "Asia/Tokyo");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(0);
      expect(date.timeZone).toBe("Asia/Tokyo");
    });

    it("throws error for invalid ISO-8601 format", () => {
      expect(() => new TZDate("2024/01/15")).toThrow();
      expect(() => new TZDate("15-01-2024")).toThrow();
      expect(() => new TZDate("2024-1-15")).toThrow();
      expect(() => new TZDate("not-a-date")).toThrow();
    });

    it("throws error for ISO-8601 strings with Z suffix (timezone should be handled by parameter)", () => {
      expect(() => new TZDate("2024-01-15T14:30:45Z")).toThrow();
      expect(() => new TZDate("2024-01-15T14:30:45.123Z")).toThrow();
    });
  });

  describe("constructor with Date object", () => {
    it("accepts Date object without timezone", () => {
      const inputDate = new Date(2024, 0, 15, 14, 30, 45, 123);
      const date = new TZDate(inputDate);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
      expect(date.timeZone).toBe("UTC");
    });

    it("accepts Date object with timezone", () => {
      const inputDate = new Date(2024, 0, 15, 14, 30, 45, 123);
      const date = new TZDate(inputDate, "Europe/London");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
      expect(date.timeZone).toBe("Europe/London");
    });
  });

  describe("constructor with timestamp", () => {
    it("accepts timestamp without timezone", () => {
      const timestamp = new Date(2024, 0, 15, 14, 30, 45, 123).getTime();
      const date = new TZDate(timestamp);
      expect(date.getTime()).toBe(timestamp);
      expect(date.timeZone).toBe("UTC");
    });

    it("accepts timestamp with timezone", () => {
      const timestamp = new Date(2024, 0, 15, 14, 30, 45, 123).getTime();
      const date = new TZDate(timestamp, "America/New_York");
      expect(date.getTime()).toBe(timestamp);
      expect(date.timeZone).toBe("America/New_York");
    });
  });

  describe("constructor with date components", () => {
    it("accepts full date components without timezone", () => {
      const date = new TZDate(2024, 0, 15, 14, 30, 45, 123);
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
      expect(date.timeZone).toBe("UTC");
    });

    it("accepts full date components with timezone", () => {
      const date = new TZDate(2024, 0, 15, 14, 30, 45, 123, "Pacific/Auckland");
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
      expect(date.timeZone).toBe("Pacific/Auckland");
    });
  });

  describe("withTimeZone method", () => {
    it("returns TZDate instance with new timezone", () => {
      const originalDate = new TZDate("2024-01-15T14:30:45", "Pacific/Auckland");
      const zonedDate = originalDate.withTimeZone("Asia/Tokyo");

      expect(zonedDate).toBeInstanceOf(TZDate);
      expect(zonedDate.getFullYear()).toBe(2024);
      expect(zonedDate.getMonth()).toBe(0);
      expect(zonedDate.getDate()).toBe(15);
      expect(zonedDate.getHours()).toBe(10);
      expect(zonedDate.getMinutes()).toBe(30);
      expect(zonedDate.getSeconds()).toBe(45);
      expect(zonedDate.getMilliseconds()).toBe(0);
      expect(zonedDate.timeZone).toBe("Asia/Tokyo");
    });

    it("preserves the original TZDate instance", () => {
      const originalDate = new TZDate("2024-01-15T14:30:45");
      const zonedDate = originalDate.withTimeZone("Europe/London");

      expect(originalDate.timeZone).toBe("UTC");
      expect(zonedDate.timeZone).toBe("Europe/London");
      expect(originalDate).not.toBe(zonedDate);
    });
  });

  describe("addDays method", () => {
    it("adds positive days to date", () => {
      const date = new TZDate("2024-01-15T14:30:45");
      const result = date.addDays(5);

      expect(result).not.toBe(date); // Returns new instance (immutable)
      expect(result).toBeInstanceOf(TZDate);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.timeZone).toBe("UTC");
    });

    it("adds negative days (subtracts) from date", () => {
      const date = new TZDate("2024-01-15T14:30:45");
      const result = date.addDays(-10);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(5);
      expect(result.getHours()).toBe(14);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(0);
    });

    it("handles zero days correctly", () => {
      const originalDate = new TZDate("2024-01-15T14:30:45");
      const originalTime = originalDate.getTime();
      const result = originalDate.addDays(0);

      expect(result).not.toBe(originalDate); // Returns new instance
      expect(result.getTime()).toBe(originalTime);
      expect(result.getDate()).toBe(15);
    });

    it("handles month boundaries correctly", () => {
      const date = new TZDate("2024-01-30T12:00:00");
      const result = date.addDays(5);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(4);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(date.getMonth()).toBe(0);
    });

    it("handles year boundaries correctly", () => {
      const date = new TZDate("2023-12-30T12:00:00");
      const result = date.addDays(5);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(4);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it("handles leap year correctly", () => {
      const date = new TZDate("2024-02-28T12:00:00");
      const result = date.addDays(1);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(1);
      expect(result.getDate()).toBe(29);
      expect(result.getHours()).toBe(12);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
    });

    it("preserves original instance unchanged", () => {
      const date = new TZDate("2024-01-15T14:30:45.123", "Asia/Tokyo");
      const originalTime = date.getTime();
      date.addDays(7);

      expect(date.getTime()).toBe(originalTime); // Original unchanged
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
      expect(date.timeZone).toBe("Asia/Tokyo");
    });

    it("preserves timezone information", () => {
      const date = new TZDate("2024-01-15T14:30:45", "Asia/Tokyo");
      const result = date.addDays(7);

      expect(result.getDate()).toBe(22);
      expect(result.timeZone).toBe("Asia/Tokyo");
    });

    it("supports method chaining", () => {
      const date = new TZDate("2024-01-15T14:30:45", "Asia/Tokyo");
      const result = date.addDays(5).withTimeZone("Africa/Windhoek");

      expect(result).toBeInstanceOf(TZDate);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(20);
      expect(result.getHours()).toBe(7);
      expect(result.getMinutes()).toBe(30);
      expect(result.getSeconds()).toBe(45);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.timeZone).toBe("Africa/Windhoek");
    });
  });

  describe("startOfDay method", () => {
    it("sets time to start of day (00:00:00.000)", () => {
      const date = new TZDate("2024-01-15T14:30:45.123");
      const result = date.startOfDay();

      expect(result).not.toBe(date); // Returns new instance (immutable)
      expect(result).toBeInstanceOf(TZDate);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.timeZone).toBe("UTC");
    });

    it("preserves original instance unchanged", () => {
      const date = new TZDate("2024-01-15T14:30:45.123", "Asia/Tokyo");
      const originalTime = date.getTime();
      date.startOfDay();

      expect(date.getTime()).toBe(originalTime); // Original unchanged
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
      expect(date.timeZone).toBe("Asia/Tokyo");
    });

    it("preserves timezone information", () => {
      const date = new TZDate("2024-01-15T14:30:45", "Europe/Paris");
      const result = date.startOfDay();

      expect(result.timeZone).toBe("Europe/Paris");
      expect(date.timeZone).toBe("Europe/Paris");
    });

    it("works with different timezones", () => {
      const utcDate = new TZDate("2024-06-15T18:45:30");
      const tokyoDate = new TZDate("2024-06-15T18:45:30", "Asia/Tokyo");

      const utcStart = utcDate.startOfDay();
      const tokyoStart = tokyoDate.startOfDay();

      expect(utcStart.getHours()).toBe(0);
      expect(tokyoStart.getHours()).toBe(0);
      expect(utcStart.timeZone).toBe("UTC");
      expect(tokyoStart.timeZone).toBe("Asia/Tokyo");
    });
  });

  describe("endOfDay method", () => {
    it("sets time to end of day (23:59:59.999)", () => {
      const date = new TZDate("2024-01-15T14:30:45.123");
      const result = date.endOfDay();

      expect(result).not.toBe(date); // Returns new instance (immutable)
      expect(result).toBeInstanceOf(TZDate);
      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(15);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
      expect(result.timeZone).toBe("UTC");
    });

    it("preserves original instance unchanged", () => {
      const date = new TZDate("2024-01-15T14:30:45.123", "Asia/Tokyo");
      const originalTime = date.getTime();
      date.endOfDay();

      expect(date.getTime()).toBe(originalTime); // Original unchanged
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(14);
      expect(date.getMinutes()).toBe(30);
      expect(date.getSeconds()).toBe(45);
      expect(date.getMilliseconds()).toBe(123);
    });

    it("preserves timezone information", () => {
      const date = new TZDate("2024-01-15T14:30:45", "Europe/London");
      const result = date.endOfDay();

      expect(result.timeZone).toBe("Europe/London");
      expect(date.timeZone).toBe("Europe/London");
    });

    it("works with different timezones", () => {
      const utcDate = new TZDate("2024-06-15T06:15:30");
      const parisDate = new TZDate("2024-06-15T06:15:30", "Europe/Paris");

      const utcEnd = utcDate.endOfDay();
      const parisEnd = parisDate.endOfDay();

      expect(utcEnd.getHours()).toBe(23);
      expect(utcEnd.getMinutes()).toBe(59);
      expect(parisEnd.getHours()).toBe(23);
      expect(parisEnd.getMinutes()).toBe(59);
      expect(utcEnd.timeZone).toBe("UTC");
      expect(parisEnd.timeZone).toBe("Europe/Paris");
    });

    it("can be chained with other methods", () => {
      const date = new TZDate("2024-01-15T14:30:45");
      const result = date.endOfDay().addDays(1);

      expect(result.getFullYear()).toBe(2024);
      expect(result.getMonth()).toBe(0);
      expect(result.getDate()).toBe(16);
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
      expect(result.getSeconds()).toBe(59);
      expect(result.getMilliseconds()).toBe(999);
    });
  });

  describe("localNow static method", () => {
    let originalDateTimeFormat: typeof Intl.DateTimeFormat;

    beforeEach(() => {
      originalDateTimeFormat = Intl.DateTimeFormat;
    });

    afterEach(() => {
      Intl.DateTimeFormat = originalDateTimeFormat;
    });

    it("creates TZDate with current time in mocked local timezone", () => {
      // Mock Intl.DateTimeFormat to return a specific timezone
      Intl.DateTimeFormat = vi.fn(
        (): Partial<Intl.DateTimeFormat> => ({
          resolvedOptions: (): Intl.ResolvedDateTimeFormatOptions => ({
            locale: "en-US",
            calendar: "gregory",
            numberingSystem: "latn",
            timeZone: "America/New_York",
          }),
        }),
      ) as unknown as typeof Intl.DateTimeFormat;

      const before = Date.now();
      const localDate = TZDate.localNow();
      const after = Date.now();

      expect(localDate).toBeInstanceOf(TZDate);
      expect(localDate.timeZone).toBe("America/New_York");

      // Check that the date is within the time range of test execution
      expect(localDate.getTime()).toBeGreaterThanOrEqual(before);
      expect(localDate.getTime()).toBeLessThanOrEqual(after);
    });
  });
});
