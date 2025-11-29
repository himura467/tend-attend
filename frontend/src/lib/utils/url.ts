import url from "url";

export const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://localhost:8000";

export const formatUrl = (urlObject: string | url.UrlObject): string => {
  return url.format(urlObject);
};
