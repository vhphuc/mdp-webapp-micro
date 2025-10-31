import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessResult } from '@shared/data-access/model/api/response';
import { BYPASS_AUTHORIZE } from '@shared/util/interceptor/interceptor';
import { environment } from '../../environments/environment';
import { LoginApi } from './auth.model';
import { appApiHeader } from '../app.const';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private readonly _http: HttpClient) {}

  login(model: LoginApi.Request) {
    return this._http.post<SuccessResult<LoginApi.Response>>('/account/login-barcode', model, {
      headers: {
        AppName: appApiHeader,
      },
    });
  }

  logout() {
    return this._http.post<SuccessResult<LoginApi.Response>>('/account/logout', null);
  }

  logoutAllApps(token: string) {
    return this._http.put<SuccessResult<LoginApi.Response>>(`${environment.API_DOMAIN}/account/clear-app-loggedIn`, null, {
      headers: {
        AppName: appApiHeader,
        Authorization: `Bearer ${token || ''}`,
      },
      context: new HttpContext().set(BYPASS_AUTHORIZE, true),
    });
  }
}
