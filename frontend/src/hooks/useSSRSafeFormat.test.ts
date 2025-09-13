import { renderHook } from "@testing-library/react";
import { format } from "date-fns";
import { describe, expect, it } from "vitest";
import { useSSRSafeFormat } from "./useSSRSafeFormat";

describe(useSSRSafeFormat, () => {
  const testDate = new Date("2023-12-25T10:30:00.000Z");
  const formatString = "EEE MMM dd";

  it("should return properly formatted date", () => {
    const { result } = renderHook(() => useSSRSafeFormat(testDate, formatString));

    const expected = format(testDate, formatString);
    expect(result.current).toBe(expected);
  });
});
