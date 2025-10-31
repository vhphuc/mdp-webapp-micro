import { ErrorResult } from '@shared/data-access/model/api/response';

export namespace LoginApi {
  export interface Request {
    barcode: string;
  }

  export interface Response {
    accessToken: string;
    tokenType: string;
    refreshToken: string;
    scope: string;
    expiresIn: number;
    requiresTwoFactor: boolean;
    isRequested2Fa: boolean;
    outOfExpireRequest2FA: boolean;
    userId: number;
    appName: string;
    isLoggedInOtherApp: boolean;
    smartBatchingConfiguration: {
      miami: {
        isEnabled: boolean;
        enabledCustomPartnerIds: string[];
      };
      juarez: {
        isEnabled: boolean;
        enabledCustomPartnerIds: string[];
      };
      tijuana: {
        isEnabled: boolean;
        enabledCustomPartnerIds: string[];
      };
    };
  }

  export type User = Response;

  export type LoginError = ErrorResult & {
    data?: {
      userId: number;
      isLoggedInOtherApp: boolean;
    };
  };
}
