import { GenderType } from "@/lib/types/account/gender";

export interface CreateUserAccountRequest {
  username: string;
  password: string;
  nickname: string | null;
  birth_date: string;
  gender: GenderType;
  email: string;
  followee_usernames: string[];
}

export interface CreateUserAccountResponse {
  error_codes: number[];
}
