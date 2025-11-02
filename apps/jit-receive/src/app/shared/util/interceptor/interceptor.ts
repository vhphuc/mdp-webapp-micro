import { HttpContextToken, HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { inject } from '@angular/core';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { AuthStore } from 'src/app/auth/auth.store';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { TranslateStore } from '@shared/data-access/store/translate.store';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { EMPTY, Observable, tap, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { appApiHeader, appMdClientRole } from 'src/app/app.const';
import { environment } from '../../../../environments/environment';
import { GlobalSpinnerStore } from '@shared/ui/component/global-spinner/global-spinner.store';

export const SHOW_LOADING = new HttpContextToken<boolean>(() => true);
export const BYPASS_AUTHORIZE = new HttpContextToken(() => false);

export const interceptors = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const lsStore = inject(LocalStorageStore);
  const authStore = inject(AuthStore);
  const notification = inject(NzNotificationService);
  const translate = inject(TranslateStore);
  const globalSpinnerStore = inject(GlobalSpinnerStore);

  const appNameHeader = appApiHeader;
  const token = lsStore.getToken();
  const mdClientRole = appMdClientRole;
  if (!req.context.get(BYPASS_AUTHORIZE)) {
    req = req.clone({
      url: !req.url.includes('http') ? environment.API_DOMAIN + req.url : req.url,
      setHeaders: {
        Authorization: `Bearer ${token ?? ''}`,
        StandardTimeZoneName: `${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
        MD_CLIENT_TYPE: 'Browser',
        MD_CLIENT_ROLE: mdClientRole,
        MD_CLIENT_NAME: lsStore.getJitReceivingConfig()?.station.stationName ?? '',
        AppLogin: lsStore.getUser()?.appLogin ?? '',
        AppName: appNameHeader,
      },
    });
  }
  const showLoading = req.context.get(SHOW_LOADING);
  setLoading(showLoading, () => globalSpinnerStore.start());

  return next(req).pipe(
    tap({
      next: response => {},
      finalize: () => setLoading(showLoading, () => globalSpinnerStore.stop()),
    }),
    catchError((error: HttpErrorResponse, _: Observable<HttpEvent<unknown>>) => {
      if (error.status === HttpStatusCode.Unauthorized) {
        if (error.error == 'MULTIPLE_APP_LOGIN_DETECTED') {
          authStore.signOutWithoutCallApi();
          translate.translate('MULTIPLE_APP_LOGIN_DETECTED').subscribe((text: string) => {
            notification.error('Error', text);
          });
        } else {
          authStore.signOutWithoutCallApi();
          translate.translate('SERVER_UNAUTHORIZED').subscribe((text: string) => {
            notification.error('Error', text);
          });
          return EMPTY;
        }
      }

      if (error.status === HttpStatusCode.Forbidden) {
        authStore.signOutWithoutCallApi();
        translate.translate('SERVER_FORBIDDEN').subscribe((text: string) => {
          notification.error('Error', text);
        });
        return EMPTY;
      }

      const apiError = error.error as ErrorResult | null;
      if (!apiError?.errorKey) {
        return throwError(
          () =>
            <ErrorResult>{
              errorKey: error.error ? JSON.stringify(error.error) : `Error Code: ${error.status}`,
              paramError: {},
            }
        );
      }

      return throwError(() => apiError);
    })
  );
};

function setLoading(showLoading: boolean, func: () => void) {
  if (showLoading) {
    func();
  }
}