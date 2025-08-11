import { TZDate } from "@/lib/utils/tzdate";
import { describe, expect, it } from "vitest";
import { applyTimezone } from "./timezone";

describe(applyTimezone, () => {
  it("handles timezone conversions", () => {
    const date = new TZDate(2024, 5, 15, 14, 30, 45, 600, "Asia/Shanghai");
    const result = applyTimezone(date, "Europe/London");
    expect(result).toBeInstanceOf(Date);
    expect(result.getFullYear()).toBe(2024);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(7);
    expect(result.getMinutes()).toBe(30);
    expect(result.getSeconds()).toBe(45);
    expect(result.getMilliseconds()).toBe(600);
    expect(result.timeZone).toBe("Europe/London");
  });
});
