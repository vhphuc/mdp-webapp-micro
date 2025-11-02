import { Injectable } from '@angular/core';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { QaScanItemApi } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { QaLeadConfirmRejectApi, QaLeadOrderRemoveShipAlertApi, QaLeadResetSockStatusApi, QaLeadResetStatusApi } from './qa-lead-api';

@Injectable({
  providedIn: 'root',
})
export class QaLeadApiService {
  constructor(private readonly _http: HttpClient) {}

  scanItem(barcode: string, factoryId: Factory, stationId: number) {
    const params = new HttpParams().set('factoryId', factoryId).set('stationId', stationId);
    return this._http.get<SuccessResult<QaScanItemApi.Response>>(`/qaapp/lead/scanning/barcodes/${barcode}`, { params });
  }

  confirmReject(barcode: string, body: QaLeadConfirmRejectApi.RequestBody) {
    return this._http.put<SuccessResult<QaLeadConfirmRejectApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/confirm-reject`, body);
  }

  resetStatus(barcode: string, body: QaLeadResetStatusApi.RequestBody) {
    return this._http.put<SuccessResult<QaLeadResetStatusApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/reset`, body);
  }

  resetSockStatus(barcode: string, body: QaLeadResetSockStatusApi.RequestBody) {
    return this._http.post<SuccessResult<QaLeadResetSockStatusApi.Response>>(`/qaapp/sock/scanning/barcodes/${barcode}/reset`, body);
  }

  removeShipAlertPut(orderId: string) {
    return this._http.put<SuccessResult<QaLeadOrderRemoveShipAlertApi.Response>>(`/orderInfo/${orderId}/remove-shipping-alert`, {});
  }
}
