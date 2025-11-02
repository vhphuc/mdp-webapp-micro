import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { SuccessResult } from '@shared/data-access/model/api/response';
import {
  QaPrintCustomInsertApi,
  QaPrintPickTicketApi,
  QaPrintShipLabelApi,
  QaScanCooApi,
  QaScanItemApi,
  QaScanMugTicketApi,
  QaScanPackageApi,
  QaScanPackageInsertApi,
  QaScanSizeApi,
  QaScanSockTrimApi,
  QaScanTrackingNumberApi,
  QaScanVerifyLocationApi,
  QaScanVerifySockBarcodeApi,
  QaViewRejectsApi,
} from './qa-api';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { SHOW_LOADING } from '@shared/util/interceptor/interceptor';

@Injectable({
  providedIn: 'root',
})
export class QaApiService {
  constructor(private readonly _http: HttpClient) {}

  scanItem(barcode: string, factoryId: Factory, stationId: number, printerId: number) {
    const params = new HttpParams().set('factoryId', factoryId).set('stationId', stationId).set('printerId', printerId);
    return this._http.get<SuccessResult<QaScanItemApi.Response>>(`/qaapp/scanning/barcodes/${barcode}`, { params });
  }

  printPickTicket(barcode: string, body: QaPrintPickTicketApi.Body) {
    return this._http.post<SuccessResult<QaPrintPickTicketApi.Response>>(`/qaapp/sock/scanning/barcodes/${barcode}/print-pick-ticket`, body, {
      context: new HttpContext().set(SHOW_LOADING, false),
    });
  }

  scanSize(barcode: string, body: QaScanSizeApi.RequestBody) {
    return this._http.put<SuccessResult<QaScanSizeApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/scan-size`, body);
  }

  scanVerifyLocation(barcode: string, body: QaScanVerifyLocationApi.RequestBody) {
    return this._http.put<SuccessResult<QaScanVerifyLocationApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/verify`, body);
  }

  scanVerifySockBarcode(barcode: string, body: QaScanVerifySockBarcodeApi.Body) {
    return this._http.post<SuccessResult<QaScanVerifySockBarcodeApi.Response>>(`/qaapp/sock/scanning/barcodes/${barcode}/verify`, body);
  }

  scanConfirmSockTrim(barcode: string, body: QaScanSockTrimApi.Body) {
    return this._http.post<SuccessResult<QaScanSockTrimApi.Response>>(`/qaapp/sock/scanning/barcodes/${barcode}/trim-confirm`, body);
  }

  scanCoo(barcode: string, body: QaScanCooApi.RequestBody) {
    return this._http.put<SuccessResult<QaScanVerifyLocationApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/scan-coo`, body);
  }

  scanPackage(barcode: string, body: QaScanPackageApi.RequestBody) {
    return this._http.put<SuccessResult<QaScanPackageApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/scan-package`, body);
  }

  scanPackageInsert(barcode: string, body: QaScanPackageInsertApi.RequestBody) {
    return this._http.put<SuccessResult<QaScanPackageApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/scan-package-insert`, body);
  }

  printShipLabel(barcode: string, body: QaPrintShipLabelApi.RequestBody) {
    return this._http.put<SuccessResult<QaPrintShipLabelApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/print-ship-label`, body, {
      context: new HttpContext().set(SHOW_LOADING, false),
    });
  }

  scanTrackingNumber(barcode: string, body: QaScanTrackingNumberApi.RequestBody) {
    //remove 	Information separator three
    body.trackingNumber = body.trackingNumber.replace('\u001D', '');
    return this._http.put<SuccessResult<QaPrintShipLabelApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/scan-tracking-number`, body);
  }

  viewRejects(barcode: string) {
    return this._http.get<SuccessResult<QaViewRejectsApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/reject-histories`);
  }

  scanMugTicket(barcode: string, body: QaScanMugTicketApi.RequestBody) {
    return this._http.put<SuccessResult<QaScanMugTicketApi.Response>>(`/qaapp/scanning/barcodes/${barcode}/scan-mug-ticket`, body);
  }

  printCustomInsert(barcode: string, body: QaPrintCustomInsertApi.RequestBody) {
    return this._http.post<SuccessResult<QaPrintCustomInsertApi.Response>>(
      `/qaapp/scanning/barcodes/${barcode}/print-custom-inserts`,
      body,
      {
        context: new HttpContext().set(SHOW_LOADING, false),
      }
    );
  }
}
