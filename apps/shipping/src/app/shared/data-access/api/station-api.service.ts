import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';

@Injectable({
  providedIn: 'root',
})
export class StationApiService {
  constructor(private _http: HttpClient) {}

  stationsGet(factoryId: Factory, stationRole: StationRole) {
    const params = new HttpParams().set('stationRole', stationRole);
    return this._http.get<SuccessResult<StationsGetApi.Response>>(`/station/factory/${factoryId}`, { params });
  }
}
