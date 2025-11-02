import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { DetailImage, EmbroideredImageDetail, PrintLeadScanItem, PrintLeadResetItem } from '../model/print-lead.model';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';

@Injectable({
  providedIn: 'root',
})
export class PrintLeadService {
  constructor(private readonly _http: HttpClient) {}

  stationGetList(stationRole: StationRole, factoryId: number, stationName: string) {
    const params = new HttpParams({ fromString: `stationRole=${stationRole}` });
    return this._http.get<SuccessResult<StationsGetApi.Response>>(`/station/factory/${factoryId}`, {
      params,
      headers: {
        MD_CLIENT_NAME: stationName,
      },
    });
  }

  getDetailImage(id: number, stationName: string) {
    return this._http.get<SuccessResult<DetailImage.Response>>(`/printlead/detail/${id}`, {
      headers: {
        MD_CLIENT_NAME: stationName,
      },
    });
  }

  getDetailEmbroideredImage(orderItemAttrId: number, orderDetailUnitId: number) {
    return this._http.get<SuccessResult<EmbroideredImageDetail.Response>>(
      `/printlead/embroidery-image-detail/${orderItemAttrId}/${orderDetailUnitId}`
    );
  }

  scan(barcode: string, factoryId: number, stationName: string) {
    return this._http.get<SuccessResult<PrintLeadScanItem.Response>>(`/printlead/scanitem/${barcode}/${factoryId}`, {
      headers: {
        MD_CLIENT_NAME: stationName,
      },
    });
  }

  scanItemAction(payload: PrintLeadScanItem.RequestParam, model: PrintLeadScanItem.RequestBody, stationName: string) {
    return this._http.put<SuccessResult<PrintLeadScanItem.Response>>(
      `/printlead/scanitem/${payload.barcode}/${payload.actionBarcode}/${payload.stationId}/${payload.factoryId}`,
      { ...model },
      {
        headers: {
          MD_CLIENT_NAME: stationName,
        },
      }
    );
  }

  resetItem(barcode: string, location: string, stationName: string, payload: PrintLeadResetItem.RequestBody) {
    return this._http.put<SuccessResult<never>>(
      `/printlead/reset-item/${barcode}/${location}`,
      payload,
      {
        headers: {
          MD_CLIENT_NAME: stationName,
        },
      }
    );
  }
}
