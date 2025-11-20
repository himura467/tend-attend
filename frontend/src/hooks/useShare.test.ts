import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useShare } from "./useShare";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe(useShare, () => {
  const mockShare = vi.fn();
  const mockCanShare = vi.fn();

  beforeEach(() => {
    Object.defineProperty(global.navigator, "share", {
      value: mockShare,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(global.navigator, "canShare", {
      value: mockCanShare,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("canShare", () => {
    it("should return false when navigator.canShare is not available", () => {
      Object.defineProperty(global.navigator, "canShare", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useShare());

      expect(result.current.canShare()).toBe(false);
    });

    it("should return true when navigator.canShare is available and no data provided", () => {
      mockCanShare.mockReturnValue(true);

      const { result } = renderHook(() => useShare());

      expect(result.current.canShare()).toBe(true);
    });

    it("should call navigator.canShare with data when data is provided", () => {
      const shareData: ShareData = {
        text: "Test Text",
        title: "Test Title",
        url: "https://example.com",
      };
      mockCanShare.mockReturnValue(true);

      const { result } = renderHook(() => useShare());
      const canShareResult = result.current.canShare(shareData);

      expect(canShareResult).toBe(true);
      expect(mockCanShare).toHaveBeenCalledWith(shareData);
    });

    it("should return false when navigator.canShare returns false for specific data", () => {
      const shareData: ShareData = {
        text: "Test Text",
        title: "Test Title",
        url: "https://example.com",
      };
      mockCanShare.mockReturnValue(false);

      const { result } = renderHook(() => useShare());
      const canShareResult = result.current.canShare(shareData);

      expect(canShareResult).toBe(false);
      expect(mockCanShare).toHaveBeenCalledWith(shareData);
    });
  });

  describe("share", () => {
    it("should successfully share data when canShare returns true", async () => {
      const shareData: ShareData = {
        text: "Test Text",
        title: "Test Title",
        url: "https://example.com",
      };
      mockCanShare.mockReturnValue(true);
      mockShare.mockResolvedValue(undefined);

      const { result } = renderHook(() => useShare());
      await result.current.share(shareData);

      expect(mockShare).toHaveBeenCalledWith(shareData);
    });

    it("should throw error and show toast when canShare returns false", async () => {
      const { toast } = await import("sonner");
      const shareData: ShareData = {
        text: "Test Text",
        title: "Test Title",
        url: "https://example.com",
      };
      mockCanShare.mockReturnValue(false);

      const { result } = renderHook(() => useShare());

      await expect(result.current.share(shareData)).rejects.toThrow("Web Share API not available");
      expect(toast.error).toHaveBeenCalledWith("Web Share API not available");
      expect(mockShare).not.toHaveBeenCalled();
    });

    it("should silently handle user cancellation (AbortError)", async () => {
      const { toast } = await import("sonner");
      const shareData: ShareData = {
        text: "Test Text",
        title: "Test Title",
        url: "https://example.com",
      };
      mockCanShare.mockReturnValue(true);
      const abortError = new Error("User cancelled");
      abortError.name = "AbortError";
      mockShare.mockRejectedValue(abortError);

      const { result } = renderHook(() => useShare());
      await result.current.share(shareData);

      expect(mockShare).toHaveBeenCalledWith(shareData);
      expect(toast.error).not.toHaveBeenCalled();
    });

    it("should show error toast and throw when share fails with non-AbortError", async () => {
      const { toast } = await import("sonner");
      const shareData: ShareData = {
        text: "Test Text",
        title: "Test Title",
        url: "https://example.com",
      };
      mockCanShare.mockReturnValue(true);
      const error = new Error("Network error");
      mockShare.mockRejectedValue(error);

      const { result } = renderHook(() => useShare());

      await expect(result.current.share(shareData)).rejects.toThrow("Network error");
      expect(mockShare).toHaveBeenCalledWith(shareData);
      expect(toast.error).toHaveBeenCalledWith("Failed to share");
    });

    it("should handle non-Error exceptions", async () => {
      const { toast } = await import("sonner");
      const shareData: ShareData = {
        text: "Test Text",
        title: "Test Title",
        url: "https://example.com",
      };
      mockCanShare.mockReturnValue(true);
      mockShare.mockRejectedValue("String error");

      const { result } = renderHook(() => useShare());

      await expect(result.current.share(shareData)).rejects.toBe("String error");
      expect(toast.error).toHaveBeenCalledWith("Failed to share");
    });
  });

  describe("memoization", () => {
    it("should return stable function references across re-renders", () => {
      const { result, rerender } = renderHook(() => useShare());
      const firstShare = result.current.share;
      const firstCanShare = result.current.canShare;

      rerender();

      expect(result.current.share).toBe(firstShare);
      expect(result.current.canShare).toBe(firstCanShare);
    });
  });
});
