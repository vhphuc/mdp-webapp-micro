import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { ScanBarcode } from './hangtag.model';
import { SHOW_LOADING } from '@shared/util/interceptor/interceptor';

@Injectable({
  providedIn: 'root',
})
export class HangtagService {
  constructor(private readonly _http: HttpClient) {}

  scanBarcode(barcode: string, factoryId: number, hangtagPrinterId: number) {
    const params = new HttpParams().set('barcode', barcode);
    return this._http.post<SuccessResult<ScanBarcode.Response>>(
      `/PackageInsertsApp/scan-barcode`,
      {
        factoryId,
        hangtagPrinterId,
      },
      { params }
    );
  }

  printHangtag(orderDetailUnitId: number, orderItemAttributeId: number, factoryId: number, hangtagPrinterId: number) {
    const params = new HttpParams().set('orderDetailUnitId', orderDetailUnitId).set('orderItemAttributeId', orderItemAttributeId);
    return this._http.post<SuccessResult<never>>(
      `/PackageInsertsApp/print-hangtag`,
      {
        factoryId,
        hangtagPrinterId,
      },
      { params, context: new HttpContext().set(SHOW_LOADING, false) }
    );
  }
}
