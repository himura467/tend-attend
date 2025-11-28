import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useBaseUrl } from "./useBaseUrl";

describe(useBaseUrl, () => {
  beforeEach(() => {
    Object.defineProperty(window, "location", {
      value: {
        origin: "https://example.com",
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should return window.location.origin", async () => {
    const { result } = renderHook(() => useBaseUrl());

    await waitFor(() => {
      expect(result.current).toBe("https://example.com");
    });
  });
});
