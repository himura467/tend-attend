import { getPayloadHash, prepareBody, SHA256_HEADER } from "@/lib/utils/aws-sig-v4";
import { BACKEND_API_URL } from "@/lib/utils/url";

async function addSHA256Header(init?: RequestInit): Promise<Headers> {
  const headers = new Headers(init?.headers);
  if (init && ["POST", "PUT"].includes(init.method?.toUpperCase() || "")) {
    const contentType = headers.get("Content-Type") || "";
    const bodyToHash = prepareBody(init.body, contentType);
    headers.set(SHA256_HEADER, await getPayloadHash(bodyToHash));
  }
  return headers;
}

async function fetchWithSHA256Header<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const headers = await addSHA256Header(init);
  // Set default Content-Type if not already set
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const initWithHeaders: RequestInit = {
    ...init,
    headers,
  };
  const url = typeof input === "string" && !input.startsWith("http") ? `${BACKEND_API_URL}${input}` : input;
  const response = await fetch(url, initWithHeaders);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
}

export { fetchWithSHA256Header };
