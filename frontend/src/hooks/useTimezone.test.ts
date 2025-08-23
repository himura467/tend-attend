import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTimezone } from "./useTimezone";

describe(useTimezone, () => {
  it("should return the browser timezone", () => {
    const { result } = renderHook(() => useTimezone());

    expect(result.current).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });
});
