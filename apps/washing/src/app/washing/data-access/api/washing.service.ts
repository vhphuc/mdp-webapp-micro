import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { WashingScanItem } from '../model/washing.model';

@Injectable({
  providedIn: 'root',
})
export class WashingService {
  constructor(private readonly _http: HttpClient) {}

  scan(barcode: string, factoryId: number, stationName: string) {
    return this._http.get<SuccessResult<WashingScanItem.Response>>(`/washstation/scanitem/${barcode}/${factoryId}`, {
      headers: {
        MD_CLIENT_NAME: stationName,
      },
    });
  }

  washStation(payload: WashingScanItem.RequestParam, model: WashingScanItem.RequestBody, stationName: string) {
    return this._http.put<SuccessResult<WashingScanItem.Response>>(
      `/washstation/scanitem/${payload.barcode}/${payload.barcodeAction}/${payload.stationId}/${payload.factoryId}`,
      { ...model },
      {
        headers: {
          MD_CLIENT_NAME: stationName,
        },
      }
    );
  }
}
