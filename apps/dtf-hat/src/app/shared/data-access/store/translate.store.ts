import { Injectable } from '@angular/core';
import { en_US, es_ES, NzI18nService } from 'ng-zorro-antd/i18n';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { Observable, of } from 'rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { TranslateService } from '@ngx-translate/core';

export enum AvailableLanguage {
  ENGLISH = 'en',
  SPANISH = 'es',
}

export interface TranslateState {
  currentLang: AvailableLanguage;
}

@Injectable({ providedIn: 'root' })
export class TranslateStore extends ComponentStore<TranslateState> {
  constructor(
    private readonly _translateSvc: TranslateService,
    private readonly _nzI18NSvc: NzI18nService,
    private readonly _lsStore: LocalStorageStore
  ) {
    super();
  }

  onAppInit() {
    const chosenLang = this._lsStore.getChosenLang();
    switch (chosenLang) {
      case AvailableLanguage.ENGLISH:
        this._nzI18NSvc.setLocale(en_US);
        break;
      case AvailableLanguage.SPANISH:
        this._nzI18NSvc.setLocale(es_ES);
        break;
      default:
        this._nzI18NSvc.setLocale(en_US);
    }
    this._translateSvc.use(chosenLang ?? AvailableLanguage.ENGLISH);
    this._translateSvc.setDefaultLang(chosenLang ?? AvailableLanguage.ENGLISH);
    this.setState({ currentLang: chosenLang ?? AvailableLanguage.ENGLISH });
  }

  useLang(lang: AvailableLanguage) {
    this._translateSvc.use(lang);
    switch (lang) {
      case AvailableLanguage.ENGLISH:
        this._nzI18NSvc.setLocale(en_US);
        break;
      case AvailableLanguage.SPANISH:
        this._nzI18NSvc.setLocale(es_ES);
        break;
    }
    this.patchState({ currentLang: lang });
    this._lsStore.setChosenLang(lang);
  }

  translate(key: string, interpolateParams?: object): Observable<string> {
    if (!key) return of('');
    return this._translateSvc.get(key, interpolateParams);
  }

  instant(key: string, interpolateParams?: object): string {
    return this._translateSvc.instant(key, interpolateParams);
  }
}
