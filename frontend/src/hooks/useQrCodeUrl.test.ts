import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
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
});
