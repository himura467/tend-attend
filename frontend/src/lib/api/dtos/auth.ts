export interface OAuth2PasswordRequestForm {
  username: string;
  password: string;
}

export interface CreateAuthSessionResponse {
  error_codes: string[];
}

export interface BasicAuthCredentials {
  username: string;
  password: string;
}
