import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { AcceptOrRejectReceipt, ScanTrackingV2 } from './jit-receive.model';

@Injectable({
  providedIn: 'root',
})
export class JitReceiveService {
  constructor(private readonly _http: HttpClient) {}

  acceptReceipt(preQrCode: string, body: AcceptOrRejectReceipt.RequestBody) {
    return this._http.put<SuccessResult<never>>(`/JitReceivingApp/v2/accept-receipt/${preQrCode}`, body);
  }

  rejectReceipt(preQrCode: string, body: AcceptOrRejectReceipt.RequestBody) {
    return this._http.put<SuccessResult<never>>(`/JitReceivingApp/v2/reject-receipt/${preQrCode}`, body);
  }
  
  scanTracking(trackingNumber: string, rParams: ScanTrackingV2.RequestParams) {
    const params = new HttpParams({ fromObject: rParams });
    return this._http.get<SuccessResult<ScanTrackingV2.Response>>(`/JitReceivingApp/v2/scan-tracking-number/${trackingNumber}`, {
      params,
    });
  }
}
