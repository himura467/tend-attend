import { AuthToken, OAuth2PasswordRequestForm } from "@/lib/api/dtos/auth";
import { fetchWithSHA256Header } from "@/lib/utils/fetch";

export const createAuthToken = async (data: OAuth2PasswordRequestForm): Promise<AuthToken> => {
  return fetchWithSHA256Header<AuthToken>("/auth/tokens/create", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      username: data.username,
      password: data.password,
    }).toString(),
    credentials: "include",
  });
};
