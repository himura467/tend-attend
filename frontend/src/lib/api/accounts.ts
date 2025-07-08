import { CreateUserAccountRequest, CreateUserAccountResponse } from "@/lib/api/dtos/account";
import { fetchWithSHA256Header } from "@/lib/utils/fetch";

export const createUserAccount = async (data: CreateUserAccountRequest): Promise<CreateUserAccountResponse> => {
  return fetchWithSHA256Header<CreateUserAccountResponse>("/accounts/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
};
