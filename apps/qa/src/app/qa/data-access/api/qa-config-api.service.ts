import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { QaPrintersGetApi, QaStationsGetApi } from '../model/qa-config-api';
import { PrinterType } from '@shared/data-access/model/api/enum/printer-type';
import { PageSizeType } from '@shared/data-access/model/api/enum/page-size';
import { SuccessResult } from '@shared/data-access/model/api/response';

@Injectable({
  providedIn: 'root',
})
export class QaConfigApiService {
  constructor(private readonly _http: HttpClient) {}

  stationsGet(factoryId: Factory) {
    const params = new HttpParams().set('stationRole', <StationRole>'QA').set('isPod', false);
    return this._http.get<SuccessResult<QaStationsGetApi.Response>>(`/station/factory/${factoryId}`, { params });
  }

  labelPrintersGet(factoryId: Factory) {
    const params = new HttpParams().set('type', PrinterType.ShipStation).set('pageSize', PageSizeType._4X6);
    return this._http.get<SuccessResult<QaPrintersGetApi.Response>>(`/printerconfiguration/factory/${factoryId}`, { params });
  }

  labelPrinter2x4sGet(factoryId: Factory) {
    const params = new HttpParams().set('type', PrinterType.ShipStation).set('pageSize', PageSizeType._2X4);
    return this._http.get<SuccessResult<QaPrintersGetApi.Response>>(`/printerconfiguration/factory/${factoryId}`, { params });
  }

  laserPrintersGet(factoryId: Factory) {
    const params = new HttpParams().set('type', PrinterType.ShipStation).set('pageSize', PageSizeType._8X11);
    return this._http.get<SuccessResult<QaPrintersGetApi.Response>>(`/printerconfiguration/factory/${factoryId}`, { params });
  }

  ticketLabelPrintersGet(factoryId: Factory) {
    const params = new HttpParams().set('type', PrinterType.Regular).set('pageSize', PageSizeType._2X3);
    return this._http.get<SuccessResult<QaPrintersGetApi.Response>>(`/printerconfiguration/factory/${factoryId}`, { params });
  }
}
