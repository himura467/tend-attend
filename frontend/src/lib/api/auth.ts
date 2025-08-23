import { CreateAuthSessionResponse, OAuth2PasswordRequestForm } from "@/lib/api/dtos/auth";
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
