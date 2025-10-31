import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { ConfirmItem, ScanItem } from './embroidery.model';

@Injectable({
  providedIn: 'root',
})
export class EmbroideryService {
  constructor(private readonly _http: HttpClient) {}

  scanItem(barcode: string, factoryId: Factory) {
    return this._http.get<SuccessResult<ScanItem.Response>>(`/embroidery/${barcode}/${factoryId}/scan-item`);
  }

  confirmItem(body: ConfirmItem.RequestBody) {
    return this._http.post<SuccessResult<ConfirmItem.Response>>(`/embroidery/confirm`, body);
  }

  scanItemConfirmed(body: ScanItem.RequestBody) {
    return this._http.put<SuccessResult<ScanItem.Response>>(`/embroidery/scan-item-confirm`, body);
  }
}
