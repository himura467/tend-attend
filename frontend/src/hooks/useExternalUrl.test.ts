import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useExternalUrl } from "./useExternalUrl";

describe(useExternalUrl, () => {
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

  it("should generate URL from simple string href", async () => {
    const { result } = renderHook(() => useExternalUrl());

    await waitFor(() => {
      const generateUrl = result.current;
      const url = generateUrl({ href: "/signup" });
      expect(url).toBe("https://example.com/signup");
    });
  });

  it("should generate URL from object href with pathname", async () => {
    const { result } = renderHook(() => useExternalUrl());

    await waitFor(() => {
      const generateUrl = result.current;
      const url = generateUrl({
        href: {
          pathname: "/events/attend",
        },
      });
      expect(url).toBe("https://example.com/events/attend");
    });
  });

  it("should generate URL from object href with pathname and query", async () => {
    const { result } = renderHook(() => useExternalUrl());

    await waitFor(() => {
      const generateUrl = result.current;
      const url = generateUrl({
        href: {
          pathname: "/signup",
          query: { followees: "user1,user2" },
        },
      });
      expect(url).toBe("https://example.com/signup?followees=user1%2Cuser2");
    });
  });
});
