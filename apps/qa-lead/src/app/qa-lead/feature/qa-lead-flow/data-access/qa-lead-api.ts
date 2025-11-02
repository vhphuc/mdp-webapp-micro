
import { QaLeadResetLocationType } from 'src/app/qa-lead/data-access/model/common/enum/qa-lead-reset-location-type';
import { QaScanStepApiResponse } from './qa-api';

export namespace QaLeadResetStatusApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    locationName: string;
    type: QaLeadResetLocationType;
  };
  export type Response = QaScanStepApiResponse;
}

export namespace QaLeadResetSockStatusApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    type: QaLeadResetLocationType;
  };
  export type Response = QaScanStepApiResponse;
}

export namespace QaLeadConfirmRejectApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    barcode: string;
  };
  export type Response = QaScanStepApiResponse;
}

export namespace QaLeadOrderRemoveShipAlertApi {
  export type Response = {
    data: number;
    message: string;
  };
}

