import {
  CreateAuthSessionResponse,
  GetAuthStatusResponse,
  OAuth2PasswordRequestForm,
  RevokeAuthSessionResponse,
} from "@/lib/api/dtos/auth";
import { fetchWithSHA256Header } from "@/lib/utils/fetch";

export const createAuthSession = async (data: OAuth2PasswordRequestForm): Promise<CreateAuthSessionResponse> => {
  return fetchWithSHA256Header<CreateAuthSessionResponse>("/auth/sessions/create", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: data.username,
      password: data.password,
    }).toString(),
    credentials: "include",
  });
};

export const revokeAuthSession = async (): Promise<RevokeAuthSessionResponse> => {
  return fetchWithSHA256Header<RevokeAuthSessionResponse>("/auth/sessions", {
    method: "DELETE",
    credentials: "include",
  });
};

export const getAuthStatus = async (): Promise<GetAuthStatusResponse> => {
  return fetchWithSHA256Header<GetAuthStatusResponse>("/auth/status", {
    method: "GET",
    credentials: "include",
  });
};
