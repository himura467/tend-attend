import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useClipboard } from "./useClipboard";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe(useClipboard, () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    Object.defineProperty(global.navigator, "clipboard", {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("isSupported", () => {
    it("should return true when navigator.clipboard is available", () => {
      const { result } = renderHook(() => useClipboard());

      expect(result.current.isSupported).toBe(true);
    });

    it("should return false when navigator.clipboard is not available", () => {
      Object.defineProperty(global.navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      expect(result.current.isSupported).toBe(false);
    });
  });

  describe("copy", () => {
    it("should successfully copy text with default success message", async () => {
      const { toast } = await import("sonner");
      mockWriteText.mockResolvedValue(undefined);

      const { result } = renderHook(() => useClipboard());
      await result.current.copy("test text");

      expect(mockWriteText).toHaveBeenCalledWith("test text");
      expect(toast.success).toHaveBeenCalledWith("Copied to clipboard");
    });

    it("should successfully copy text with custom success message", async () => {
      const { toast } = await import("sonner");
      mockWriteText.mockResolvedValue(undefined);

      const { result } = renderHook(() => useClipboard());
      await result.current.copy("test text", "Custom success message");

      expect(mockWriteText).toHaveBeenCalledWith("test text");
      expect(toast.success).toHaveBeenCalledWith("Custom success message");
    });

    it("should show error toast when clipboard API is not available", async () => {
      const { toast } = await import("sonner");
      Object.defineProperty(global.navigator, "clipboard", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useClipboard());

      await expect(result.current.copy("test text")).rejects.toThrow("Clipboard API not available");
      expect(toast.error).toHaveBeenCalledWith("Clipboard API not available");
      expect(mockWriteText).not.toHaveBeenCalled();
    });

    it("should handle Error exceptions from clipboard API", async () => {
      const { toast } = await import("sonner");
      const error = new Error("Permission denied");
      mockWriteText.mockRejectedValue(error);

      const { result } = renderHook(() => useClipboard());

      await expect(result.current.copy("test text")).rejects.toThrow("Permission denied");
      expect(mockWriteText).toHaveBeenCalledWith("test text");
      expect(toast.error).toHaveBeenCalledWith("Permission denied");
    });

    it("should handle non-Error exceptions from clipboard API", async () => {
      const { toast } = await import("sonner");
      mockWriteText.mockRejectedValue("String error");

      const { result } = renderHook(() => useClipboard());

      await expect(result.current.copy("test text")).rejects.toThrow("Failed to copy to clipboard");
      expect(mockWriteText).toHaveBeenCalledWith("test text");
      expect(toast.error).toHaveBeenCalledWith("Failed to copy to clipboard");
    });
  });

  describe("memoization", () => {
    it("should return stable copy function reference across re-renders", () => {
      const { result, rerender } = renderHook(() => useClipboard());
      const firstCopy = result.current.copy;

      rerender();

      expect(result.current.copy).toBe(firstCopy);
    });

    it("should maintain stable isSupported value across re-renders", () => {
      const { result, rerender } = renderHook(() => useClipboard());
      const firstIsSupported = result.current.isSupported;

      rerender();

      expect(result.current.isSupported).toBe(firstIsSupported);
    });
  });
});
