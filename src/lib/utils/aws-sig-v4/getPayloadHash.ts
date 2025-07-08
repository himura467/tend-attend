import { isArrayBuffer } from "@/lib/utils/arrayBuffer";
import { UNSIGNED_PAYLOAD } from "./constants";

const toUint8Array = (data: string | ArrayBuffer | ArrayBufferView | URLSearchParams): Uint8Array => {
  if (typeof data === "string") {
    return new TextEncoder().encode(data);
  } else if (isArrayBuffer(data)) {
    return new Uint8Array(data);
  } else if (ArrayBuffer.isView(data)) {
    return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
  }
  // URLSearchParams case
  return new TextEncoder().encode(data.toString());
};

export const getPayloadHash = async (
  body: string | ArrayBuffer | ArrayBufferView | URLSearchParams | FormData | undefined,
): Promise<string> => {
  // Empty body hash (SHA-256 of empty string)
  if (body === undefined) {
    return "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
  }
  if (typeof body === "string" || isArrayBuffer(body) || ArrayBuffer.isView(body) || body instanceof URLSearchParams) {
    const hash = await crypto.subtle.digest("SHA-256", toUint8Array(body));
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  }
  return UNSIGNED_PAYLOAD;
};
