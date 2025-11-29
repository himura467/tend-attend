export interface OAuth2PasswordRequestForm {
  username: string;
  password: string;
}

export interface CreateAuthSessionResponse {
  error_codes: string[];
}

export interface RevokeAuthSessionResponse {
  error_codes: string[];
}

export interface GetAuthStatusResponse {
  username: string | null;
  group: string | null;
  error_codes: string[];
}

export interface BasicAuthCredentials {
  username: string;
  password: string;
}
