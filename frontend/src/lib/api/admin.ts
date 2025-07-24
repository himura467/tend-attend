import {
  ResetAuroraResponse,
  StampRevisionRequest,
  StampRevisionResponse,
  UpgradeDbResponse,
} from "@/lib/api/dtos/admin";
import { BasicAuthCredentials } from "@/lib/api/dtos/auth";
import { createBasicAuthHeader } from "@/lib/utils/auth";
import { fetchWithSHA256Header } from "@/lib/utils/fetch";

export const resetAurora = async (credentials: BasicAuthCredentials): Promise<ResetAuroraResponse> => {
  return fetchWithSHA256Header<ResetAuroraResponse>("/admin/aurora/reset", {
    method: "POST",
    headers: {
      Authorization: createBasicAuthHeader(credentials),
    },
  });
};

export const upgradeDb = async (credentials: BasicAuthCredentials): Promise<UpgradeDbResponse> => {
  return fetchWithSHA256Header<UpgradeDbResponse>("/admin/migration/upgrade", {
    method: "POST",
    headers: {
      Authorization: createBasicAuthHeader(credentials),
    },
  });
};

export const stampRevision = async (
  credentials: BasicAuthCredentials,
  request: StampRevisionRequest,
): Promise<StampRevisionResponse> => {
  return fetchWithSHA256Header<StampRevisionResponse>("/admin/migration/stamp", {
    method: "POST",
    headers: {
      Authorization: createBasicAuthHeader(credentials),
    },
    body: JSON.stringify(request),
  });
};
