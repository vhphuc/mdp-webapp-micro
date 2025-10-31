import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { PrinterType } from '@shared/data-access/model/api/enum/printer-type';
import { PageSizeType } from '@shared/data-access/model/api/enum/page-size';
import { PrintersGetApi } from '@shared/data-access/model/api/printer-configuration-api';

@Injectable({
  providedIn: 'root',
})
export class PrinterConfigurationApiService {
  constructor(private readonly _http: HttpClient) {}

  printersGet(factoryId: Factory, type: PrinterType, pageSize?: PageSizeType) {
    const params = new HttpParams().set('type', type).set('pageSize', pageSize ?? '');
    return this._http.get<SuccessResult<PrintersGetApi.Response>>(`/printerconfiguration/factory/${factoryId}`, { params });
  }

  jitPrintersGet(factoryId: Factory, pageSize?: PageSizeType) {
    const params = new HttpParams();
    if (pageSize) params.set('pageSize', pageSize);
    return this._http.get<SuccessResult<PrintersGetApi.Response>>(`/printerconfiguration/jit/factory/${factoryId}`, { params });
  }
}
