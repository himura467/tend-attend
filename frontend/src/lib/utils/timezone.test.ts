import { expect, it } from "vitest";
import { applyTimezone } from "./timezone";

it("returns the same date when source and destination timezones are the same", () => {
  const date = new Date(2024, 0, 1, 12, 0, 0, 500);
  const result = applyTimezone(date, "UTC", "UTC");
  expect(result).toEqual(date);
});

it("converts timezone correctly", () => {
  const date = new Date(2024, 0, 1, 12, 0, 0, 750);
  const result = applyTimezone(date, "UTC", "America/New_York");
  expect(result).toBeInstanceOf(Date);
});

it("handles different timezone conversions", () => {
  const date = new Date(2024, 5, 15, 14, 30, 45, 123);
  const result = applyTimezone(date, "America/New_York", "Europe/London");
  expect(result).toBeInstanceOf(Date);
  expect(result.getFullYear()).toBe(2024);
  expect(result.getMonth()).toBe(5);
  expect(result.getDate()).toBe(15);
  expect(result.getHours()).toBe(19);
  expect(result.getMinutes()).toBe(30);
  expect(result.getSeconds()).toBe(0);
  expect(result.getMilliseconds()).toBe(0);
});
