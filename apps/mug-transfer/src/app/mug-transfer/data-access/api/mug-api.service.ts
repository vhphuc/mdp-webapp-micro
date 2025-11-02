import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { MugConfirmPickApi, MugConfirmPrintApi, MugScanItemApi } from '../model/api/mug-api';
import { SuccessResult } from '@shared/data-access/model/api/response';

@Injectable({
  providedIn: 'root',
})
export class MugApiService {
  constructor(private _http: HttpClient) {}

  scanItem(barcode: string, factoryId: Factory, stationId: number) {
    const headers = new HttpHeaders({ factoryId: factoryId.toString(), stationId });
    return this._http.get<SuccessResult<MugScanItemApi.Response>>(`/mugapp/scan-item/${barcode}`, { headers });
  }

  scanMugPrint(barcode: string, factoryId: Factory, stationId: number, body: MugConfirmPrintApi.RequestBody) {
    const headers = new HttpHeaders({ factoryId: factoryId.toString(), stationId });
    return this._http.post<SuccessResult<never>>(`/mugapp/confirm-print/${barcode}`, body, { headers });
  }

  scanMugPick(barcode: string, factoryId: Factory, stationId: number, body: MugConfirmPickApi.RequestBody) {
    const headers = new HttpHeaders({ factoryId: factoryId.toString(), stationId });
    return this._http.post<SuccessResult<never>>(`/mugapp/confirm-pick/${barcode}`, body, { headers });
  }
}
