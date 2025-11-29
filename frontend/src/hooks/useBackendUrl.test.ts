import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBackendUrl } from "./useBackendUrl";

describe(useBackendUrl, () => {
  it("should generate URL from simple string href", () => {
    const { result } = renderHook(() => useBackendUrl());
    const generateUrl = result.current;

    const url = generateUrl({ href: "/events/create" });
    expect(url).toBe("https://api.example.com/events/create");
  });

  it("should generate URL from object href with pathname", () => {
    const { result } = renderHook(() => useBackendUrl());
    const generateUrl = result.current;

    const url = generateUrl({
      href: {
        pathname: "/events/goals",
      },
    });
    expect(url).toBe("https://api.example.com/events/goals");
  });

  it("should generate URL from object href with pathname and query", () => {
    const { result } = renderHook(() => useBackendUrl());
    const generateUrl = result.current;

    const url = generateUrl({
      href: {
        pathname: "/events/goals",
        query: { "event-id": "123", start: "2024-01-01" },
      },
    });
    expect(url).toBe("https://api.example.com/events/goals?event-id=123&start=2024-01-01");
  });
});
