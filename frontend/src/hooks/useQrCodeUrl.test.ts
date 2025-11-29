import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useQrCodeUrl } from "./useQrCodeUrl";

describe(useQrCodeUrl, () => {
  it("should generate QR code URL from simple string href", () => {
    const { result } = renderHook(() => useQrCodeUrl());
    const generateUrl = result.current;

    const url = generateUrl({ href: "/signup" });
    expect(url).toBe("https://api.example.com/qrcode/signup");
  });

  it("should generate QR code URL from object href with pathname", () => {
    const { result } = renderHook(() => useQrCodeUrl());
    const generateUrl = result.current;

    const url = generateUrl({
      href: {
        pathname: "/events/attend",
      },
    });
    expect(url).toBe("https://api.example.com/qrcode/events/attend");
  });

  it("should generate QR code URL from object href with pathname and query", () => {
    const { result } = renderHook(() => useQrCodeUrl());
    const generateUrl = result.current;

    const url = generateUrl({
      href: {
        pathname: "/signup",
        query: { followees: "user1,user2" },
      },
    });
    expect(url).toBe("https://api.example.com/qrcode/signup?followees=user1%2Cuser2");
  });

  it("should add multiple arbitrary query parameters", () => {
    const { result } = renderHook(() => useQrCodeUrl());
    const generateUrl = result.current;

    const url = generateUrl(
      {
        href: "/signup",
      },
      {
        width: 400,
        height: 400,
        image: "https://example.com/logo.svg",
        dotsColor: "#000000",
        backgroundColor: "#ffffff",
      },
    );
    expect(url).toBe(
      "https://api.example.com/qrcode/signup?width=400&height=400&image=https%3A%2F%2Fexample.com%2Flogo.svg&dotsColor=%23000000&backgroundColor=%23ffffff",
    );
  });

  it("should preserve existing query parameters and add QR code options", () => {
    const { result } = renderHook(() => useQrCodeUrl());
    const generateUrl = result.current;

    const url = generateUrl(
      {
        href: {
          pathname: "/signup",
          query: { followees: "user1,user2" },
        },
      },
      { width: 400, height: 400, image: "https://example.com/logo.svg" },
    );
    expect(url).toBe(
      "https://api.example.com/qrcode/signup?followees=user1%2Cuser2&width=400&height=400&image=https%3A%2F%2Fexample.com%2Flogo.svg",
    );
  });

  it("should warn and not override existing query parameter", () => {
    const { result } = renderHook(() => useQrCodeUrl());
    const generateUrl = result.current;
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const url = generateUrl(
      {
        href: {
          pathname: "/signup",
          query: { width: "300" },
        },
      },
      { width: 400 },
    );
    expect(url).toBe("https://api.example.com/qrcode/signup?width=300");
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("width=400 provided as argument but width=300 already exists"),
    );

    consoleWarnSpy.mockRestore();
  });
});
