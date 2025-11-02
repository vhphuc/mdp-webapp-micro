import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResult } from '@shared/data-access/model/api/response';
import {
  NeckLabelScanAttributeApi,
  NeckLabelScanUnitApi,
  NeckLabelVerifyDtfNeckLabelApi,
} from '../model/api/neck-label';

@Injectable({
  providedIn: 'root',
})
export class NeckLabelApiService {
  constructor(private readonly _http: HttpClient) {}

  scanItem(barcode: string, factoryId: number, stationId: number) {
    return this._http.get<SuccessResult<NeckLabelScanUnitApi.Response>>(`/necklabel/${barcode}/${factoryId}/scan-item`, {
      headers: {
        stationId: stationId.toString(),
      },
    });
  }

  scanAcceptRegularAttribute(body: NeckLabelScanAttributeApi.Request) {
    return this._http.put<SuccessResult<NeckLabelScanAttributeApi.Response>>(`/necklabel/accept-item`, body);
  }

  scanRejectRegularAttribute(body: NeckLabelScanAttributeApi.Request) {
    return this._http.put<SuccessResult<NeckLabelScanAttributeApi.Response>>(`/necklabel/reject-item`, body);
  }

  verifyDtfNecklabel(body: NeckLabelVerifyDtfNeckLabelApi.RequestBody) {
    return this._http.put<SuccessResult<never>>(`/necklabel/verify`, body);
  }
}
