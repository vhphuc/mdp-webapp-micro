import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResult } from '../model/api/response';
import { UserFactoriesGetApi } from '../model/api/user-factories-get-api';
import { ProfileGetApi } from '@shared/data-access/model/api/profile-get-api';

@Injectable({
  providedIn: 'root',
})
export class CommonApiService {
  constructor(private readonly _http: HttpClient) {}

  profileGet() {
    return this._http.get<SuccessResult<ProfileGetApi.Response>>(`/account/profile`);
  }

  userFactoriesGet() {
    return this._http.get<SuccessResult<UserFactoriesGetApi.Response>>(`/common/get-user-factories`);
  }
}
