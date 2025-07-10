import url from "url";

export const formatUrl = (urlObject: string | url.UrlObject): string => {
  return url.format(urlObject);
};
