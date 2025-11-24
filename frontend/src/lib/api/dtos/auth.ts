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
  is_authenticated: boolean;
  error_codes: string[];
}

export interface BasicAuthCredentials {
  username: string;
  password: string;
}
