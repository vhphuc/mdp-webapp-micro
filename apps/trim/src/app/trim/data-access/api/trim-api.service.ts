import { Injectable } from '@angular/core';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { TrimConfirmApi, TrimScanItemApi } from '../model/trim-api';

@Injectable({
  providedIn: 'root',
})
export class TrimApiService {
  constructor(private readonly _http: HttpClient) {}

  scanItem(barcode: string, factoryId: Factory, stationId: number): Observable<SuccessResult<TrimScanItemApi.Response>> {
    const params = new HttpParams().set('factoryId', factoryId).set('stationId', stationId);
    return this._http.get<SuccessResult<TrimScanItemApi.Response>>(`/trimapp/scanning/barcodes/${barcode}`, { params });
  }

  confirm(barcode: string, factoryId: number, stationId: number, body: TrimConfirmApi.RequestBody) {
    const params = new HttpParams().set('factoryId', factoryId).set('stationId', stationId);
    return this._http.post<SuccessResult<TrimConfirmApi.Response>>(`/trimapp/scanning/barcodes/${barcode}/confirm`, body, { params });
  }
}
