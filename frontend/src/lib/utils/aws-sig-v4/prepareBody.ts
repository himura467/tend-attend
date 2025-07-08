import { isArrayBuffer } from "@/lib/utils/arrayBuffer";

export const prepareBody = (
  data: unknown,
  contentType: string,
): string | ArrayBuffer | ArrayBufferView | URLSearchParams => {
  if (typeof data === "string" || isArrayBuffer(data) || ArrayBuffer.isView(data)) {
    return data;
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    if (data instanceof URLSearchParams) {
      return data;
    } else if (typeof data === "object" && data !== null) {
      const params = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        params.append(key, String(value));
      });
      return params;
    } else {
      return String(data);
    }
  } else if (contentType.includes("application/json")) {
    return JSON.stringify(data);
  }
  return String(data);
};
