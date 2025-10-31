import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from "@angular/core";
import { provideRouter } from "@angular/router";

import { registerLocaleData } from "@angular/common";
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from "@angular/common/http";
import en from "@angular/common/locales/en";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { en_US, provideNzI18n } from "ng-zorro-antd/i18n";
import { routes } from "./app.routes";
import { NzConfig, provideNzConfig } from "ng-zorro-antd/core/config";
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { BYPASS_AUTHORIZE, interceptors } from "@shared/util/interceptor/interceptor";
import { Observable } from "rxjs";
import { environment } from "../environments/environment";
import { NzNotificationModule } from "ng-zorro-antd/notification";
import { NzModalModule } from "ng-zorro-antd/modal";
import { LocalStorageStore } from "@shared/data-access/store/local-storage.store";
import { TranslateStore } from "@shared/data-access/store/translate.store";
import { AuthStore } from "./auth/auth.store";
import { SignalRService } from "@shared/lib/signlr/signal-r.service";

registerLocaleData(en);

const nzConfig: NzConfig = {
  modal: {
    nzMaskClosable: false,
    nzCloseOnNavigation: true,
  },
};

export class HttpTranslationLoader implements TranslateLoader {
  constructor(private readonly _http: HttpClient) {}

  getTranslation(lang: string): Observable<unknown> {
    if (!lang) {
      lang = 'en';
    }
    const urlGetTranslateData = environment.TRANSLATE_DOMAIN + `/i18n/WebApp/${lang}.json`;
    return new Observable(obs => {
      this._http
        .get(urlGetTranslateData, {
          context: new HttpContext().set(BYPASS_AUTHORIZE, true),
        })
        .subscribe({
          next: res => {
            obs.next(res);
            obs.complete();
          },
          error: err => {
            console.log(err);
          },
        });
    });
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimationsAsync(),
    provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
    
    provideHttpClient(
      withInterceptors([interceptors])
    ),
    
    importProvidersFrom([
      NzNotificationModule,
      NzModalModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: (http: HttpClient) => new HttpTranslationLoader(http),
          deps: [HttpClient],
        },
      }),
    ]),

    {
      provide: APP_INITIALIZER,
        useFactory: (lsStore: LocalStorageStore, tStore: TranslateStore, signalRService: SignalRService) => () => {
        lsStore.onAppInit();
        tStore.onAppInit();
        // connect signal r
        const token = lsStore.getToken();
        if (token) {
          signalRService.start(token);
        }
      },
      deps: [LocalStorageStore, TranslateStore, SignalRService],
      multi: true,
    },
    

    provideNzI18n(en_US),
    provideNzConfig(nzConfig),
  ],
};
