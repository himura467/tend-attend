export interface ResetAuroraResponse {
  error_codes: number[];
}

export interface UpgradeDbResponse {
  error_codes: number[];
}

export interface StampRevisionRequest {
  revision: string;
}

export interface StampRevisionResponse {
  error_codes: number[];
}
