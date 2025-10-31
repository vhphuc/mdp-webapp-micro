import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { ScanConfirm, ScanTransfer } from './dtf-hat.model';

@Injectable({
  providedIn: 'root',
})
export class DtfHatService {
  constructor(private readonly _http: HttpClient) {}

  scanTransfer(barcode: string, prms: ScanTransfer.RequestParams) {
    const params = new HttpParams({ fromObject: prms });
    return this._http.get<SuccessResult<ScanTransfer.Response>>(`/dtfhatapp/scan-transfer/${barcode}`, { params });
  }

  scanItem(barcode: string, prms: ScanTransfer.RequestParams) {
    const params = new HttpParams({ fromObject: prms });
    return this._http.get<SuccessResult<ScanTransfer.Response>>(`/dtfhatapp/scan-item/${barcode}`, { params });
  }

  scanConfirm(body: ScanConfirm.RequestBody) {
    return this._http.put<SuccessResult<string>>(`/dtfhatapp/confirm-action`, body);
  }
}
