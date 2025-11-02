import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import {
  QaStickerConfirmRejectStickerGroupApi,
  QaStickerPrintShipLabelApi,
  QaStickerResetStickerGroupApi,
  QaStickerScanCooApi,
  QaStickerScanPackageApi,
  QaStickerScanSheetApi,
  QaStickerScanTrackingNumberApi,
  QaStickerVerifyStickerGroupApi,
  QaStickerViewRejectsApi,
} from './qa-sticker-api';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { SHOW_LOADING } from '@shared/util/interceptor/interceptor';

@Injectable({
  providedIn: 'root',
})
export class QaStickerApiService {
  constructor(private readonly _http: HttpClient) {}

  scanSheet(sheetCode: string, factoryId: Factory, stationId: number) {
    const params = new HttpParams({ fromObject: { factoryId, stationId } });
    return this._http.get<SuccessResult<QaStickerScanSheetApi.Response>>(`/QaStickerApp/scanning/sheet/${sheetCode}`, { params });
  }

  verifyStickerGroup(sheetCode: string, stGrpCode: string, body: QaStickerVerifyStickerGroupApi.RequestBody) {
    return this._http.put<SuccessResult<QaStickerVerifyStickerGroupApi.Response>>(
      `/QaStickerApp/scanning/sheet/${sheetCode}/sticker-group/${stGrpCode}/verify`,
      body
    );
  }

  scanCoo(sheetCode: string, body: QaStickerScanCooApi.RequestBody) {
    return this._http.put<SuccessResult<QaStickerScanCooApi.Response>>(`/QaStickerApp/scanning/sheet/${sheetCode}/scan-coo`, body);
  }

  scanPackage(sheetCode: string, body: QaStickerScanPackageApi.RequestBody) {
    return this._http.put<SuccessResult<QaStickerScanPackageApi.Response>>(`/QaStickerApp/scanning/sheet/${sheetCode}/scan-package`, body);
  }

  resetStickerGroup(sheetCode: string, body: QaStickerResetStickerGroupApi.RequestBody) {
    return this._http.put<SuccessResult<QaStickerResetStickerGroupApi.Response>>(`/QaStickerApp/scanning/sheet/${sheetCode}/reset`, body);
  }

  confirmRejectStickerGroup(sheetCode: string, body: QaStickerConfirmRejectStickerGroupApi.RequestBody) {
    return this._http.put<SuccessResult<QaStickerConfirmRejectStickerGroupApi.Response>>(
      `/QaStickerApp/scanning/sheet/${sheetCode}/confirm`,
      body
    );
  }

  printShipLabel(sheetCode: string, body: QaStickerPrintShipLabelApi.RequestBody) {
    return this._http.put<SuccessResult<QaStickerPrintShipLabelApi.Response>>(
      `/qaapp/scanning/barcodes/${sheetCode}/print-ship-label`,
      body,
      {
        context: new HttpContext().set(SHOW_LOADING, false),
      }
    );
  }
  scanTrackingNumber(sheetCode: string, body: QaStickerScanTrackingNumberApi.RequestBody) {
    //remove 	Information separator three
    body.trackingNumber = body.trackingNumber.replace('\u001D', '');
    return this._http.put<SuccessResult<QaStickerScanTrackingNumberApi.Response>>(
      `/qaapp/scanning/barcodes/${sheetCode}/scan-tracking-number`,
      body
    );
  }

  viewRejects(sheetBarcode: string, stkGrpBarcode: string) {
    return this._http.get<SuccessResult<QaStickerViewRejectsApi.Response>>(
      `/QaStickerApp/scanning/sheet/${sheetBarcode}/sticker-group/${stkGrpBarcode}/reject-histories`
    );
  }
}
