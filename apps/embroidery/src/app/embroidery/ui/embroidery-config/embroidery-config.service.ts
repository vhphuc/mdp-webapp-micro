import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { EmbroideryStations } from './embroidery-config.model';
import { Factory } from '@shared/data-access/model/api/enum/factory';

@Injectable({ providedIn: 'root' })
export class EmbroideryConfigService {
  constructor(private readonly _http: HttpClient) {}

  getStations(factoryId: Factory) {
    const params = new HttpParams().append('stationRole', <StationRole>'Embroidery');
    return this._http.get<SuccessResult<EmbroideryStations.Response>>(`/station/factory/${factoryId}`, { params });
  }
}
