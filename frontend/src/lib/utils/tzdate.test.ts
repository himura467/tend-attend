import { describe, expect, it } from "vitest";
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

  describe("inheritance from TZDateMini", () => {
    it("inherits all TZDateMini methods and properties", () => {
      const date = new TZDate("2024-01-15T14:30:45", "UTC");
      expect(typeof date.withTimeZone).toBe("function");
    });

    it("behaves like a regular Date for standard operations", () => {
      const date = new TZDate("2024-01-15T14:30:45");
      const regularDate = new Date("2024-01-15T14:30:45");
      expect(date.getFullYear()).toBe(regularDate.getFullYear());
      expect(date.getMonth()).toBe(regularDate.getMonth());
      expect(date.getDate()).toBe(regularDate.getDate());
      expect(date.getHours()).toBe(regularDate.getHours());
      expect(date.getMinutes()).toBe(regularDate.getMinutes());
      expect(date.getSeconds()).toBe(regularDate.getSeconds());
      expect(date.getMilliseconds()).toBe(regularDate.getMilliseconds());
    });
  });
});
