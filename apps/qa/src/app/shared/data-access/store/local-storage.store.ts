import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { LoginApi } from '../../../auth/auth.model';
import { lsGetKey, lsRemoveKey, lsSetKey } from '../../util/helper/local-storage-query';
import { Role } from '../model/api/enum/role';
import { UserFactoriesGetApi } from '../model/api/user-factories-get-api';
import { AvailableLanguage } from '../store/translate.store';
import { QaPrintersGetApi, QaStationsGetApi } from '../../../qa/data-access/model/qa-config-api';

export interface QaConfigKey {
  chosenFactory: UserFactoriesGetApi.ResponseItem;
  chosenStation: QaStationsGetApi.ResponseItem;
  chosenLabelPrinter: QaPrintersGetApi.ResponseItem;
  chosenTicketLabelPrinter: QaPrintersGetApi.ResponseItem;
  chosenLaserPrinter: QaPrintersGetApi.ResponseItem;
}

export interface UserKey {
  fullName: string;
  roles: Role[];
  factories: UserFactoriesGetApi.Response;
  id: number;
  appLogin: string;
  smartBatchingConfiguration?: LoginApi.Response['smartBatchingConfiguration'];
}

export interface LocalStorageState {
  chosenLang: AvailableLanguage | null;
  qaConfig: QaConfigKey | null;

  //region remove when log out
  token: string | null;
  user: UserKey | null;
  //endregion
}

@Injectable({ providedIn: 'root' })
export class LocalStorageStore extends ComponentStore<LocalStorageState> {
  constructor() {
    super();
  }

  // retrieve all key saved in local storage after site refresh
  onAppInit() {
    const initialState: LocalStorageState = {
      chosenLang: this.getChosenLang(),
      qaConfig: this.getQaConfig(),

      token: this.getToken(),
      user: this.getUser(),
    };
    this.setState(initialState);
  }

  //region ChosenLang
  chosenLangKey = 'chosen-lang';
  chosenLang$ = this.select(state => state.chosenLang);
  getChosenLang() {
    return lsGetKey<AvailableLanguage>(this.chosenLangKey);
  }
  setChosenLang(value: AvailableLanguage) {
    lsSetKey(this.chosenLangKey, value);
    this.patchState({ chosenLang: value });
  }
  removeChosenLang() {
    lsRemoveKey(this.chosenLangKey);
    this.patchState({ chosenLang: null });
  }
  //endregion

  //region Token
  tokenKey = 'token';
  token$ = this.select(state => state.token);
  getToken() {
    return lsGetKey<string>(this.tokenKey);
  }
  setToken(value: string) {
    lsSetKey(this.tokenKey, value);
    this.patchState({ token: value });
  }
  removeToken() {
    lsRemoveKey(this.tokenKey);
    this.patchState({ token: null });
  }
  //endregion

  //region User
  userKey = 'user';
  getUser() {
    return lsGetKey<UserKey>(this.userKey);
  }
  setUser(value: UserKey) {
    lsSetKey(this.userKey, value);
    this.patchState({ user: value });
  }
  removeUser() {
    lsRemoveKey(this.userKey);
    this.patchState({ user: null });
  }
  //endregion

  //region QA Config
  qaConfigKey = 'qa-config';
  qaConfig$ = this.select(state => state.qaConfig);
  getQaConfig() {
    return lsGetKey<QaConfigKey>(this.qaConfigKey);
  }
  setQaConfig(value: {
    chosenFactory: UserFactoriesGetApi.ResponseItem | null;
    chosenStation: QaStationsGetApi.ResponseItem | null;
    chosenLabelPrinter: QaPrintersGetApi.ResponseItem | null;
    chosenTicketLabelPrinter: QaPrintersGetApi.ResponseItem | null;
    chosenLaserPrinter: QaPrintersGetApi.ResponseItem | null;
  }) {
    const notNullValue = {
      chosenFactory: value.chosenFactory!,
      chosenStation: value.chosenStation!,
      chosenLabelPrinter: value.chosenLabelPrinter!,
      chosenTicketLabelPrinter: value.chosenTicketLabelPrinter!,
      chosenLaserPrinter: value.chosenLaserPrinter!,
    };
    lsSetKey(this.qaConfigKey, notNullValue);
    this.patchState({ qaConfig: notNullValue });
  }
  removeQaConfig() {
    lsRemoveKey(this.qaConfigKey);
    this.patchState({ qaConfig: null });
  }

  //endregion

  removeNonPersistKey() {
    this.removeToken();
    this.removeUser();
  }
}
