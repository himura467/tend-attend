import { TZDate } from "@/lib/utils/tzdate";
import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalNow } from "./useLocalNow";
import { useTimezone } from "./useTimezone";

// Mock the useTimezone hook
vi.mock("./useTimezone", () => ({
  useTimezone: vi.fn(),
}));

// Mock the applyTimezone function
vi.mock("@/lib/utils/timezone", () => ({
  applyTimezone: vi.fn((date: TZDate, timezone: string) => {
    return date.withTimeZone(timezone);
  }),
}));

describe(useLocalNow, () => {
  const mockUseTimezone = vi.mocked(useTimezone);

  beforeEach(() => {
    vi.useFakeTimers();
    // Set a fixed date for consistent testing
    vi.setSystemTime(new Date("2024-01-15T14:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("should return a TZDate with current time in browser timezone", () => {
    mockUseTimezone.mockReturnValue("America/New_York");

    const { result } = renderHook(() => useLocalNow());

    expect(result.current).toBeInstanceOf(TZDate);
    expect(result.current.timeZone).toBe("America/New_York");
    expect(mockUseTimezone).toHaveBeenCalledOnce();
  });

  it("should return current system time", () => {
    mockUseTimezone.mockReturnValue("UTC");

    const { result } = renderHook(() => useLocalNow());

    // The TZDate should represent the current system time
    expect(result.current).toBeInstanceOf(TZDate);
    expect(result.current.getFullYear()).toBe(2024);
    expect(result.current.getMonth()).toBe(0);
    expect(result.current.getDate()).toBe(15);
    expect(result.current.getHours()).toBe(14);
    expect(result.current.getMinutes()).toBe(30);
    expect(result.current.getSeconds()).toBe(0);
    expect(result.current.getMilliseconds()).toBe(0);
    expect(result.current.timeZone).toBe("UTC");
  });

  it("should return updated time when hook is re-rendered", () => {
    mockUseTimezone.mockReturnValue("UTC");

    const { result, rerender } = renderHook(() => useLocalNow());
    const firstResult = result.current;

    // Advance time by 1 hour
    vi.advanceTimersByTime(60 * 60 * 1000);
    rerender();

    const secondResult = useLocalNow();

    // Should be different instances representing different times
    expect(secondResult.getTime()).toBeGreaterThan(firstResult.getTime());
  });
});
