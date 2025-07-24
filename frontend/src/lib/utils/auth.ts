import { BasicAuthCredentials } from "@/lib/api/dtos/auth";

export const createBasicAuthHeader = (credentials: BasicAuthCredentials): string => {
  return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
};
