export interface OAuth2PasswordRequestForm {
  username: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
