import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { LoginApi } from '../../../auth/auth.model';
import { lsGetKey, lsRemoveKey, lsSetKey } from '../../util/helper/local-storage-query';
import { Role } from '../model/api/enum/role';
import { PrintersGetApi } from '../model/api/printer-configuration-api';
import { StationsGetApi } from '../model/api/station-api';
import { UserFactoriesGetApi } from '../model/api/user-factories-get-api';
import { AvailableLanguage } from '../store/translate.store';

export interface JitReceivingConfigKey {
  factory: UserFactoriesGetApi.ResponseItem;
  station: StationsGetApi.ResponseItem;
  regularReceivingPrinter: PrintersGetApi.ResponseItem;
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
  jitReceivingConfig: JitReceivingConfigKey | null;

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
      jitReceivingConfig: this.getJitReceivingConfig(),

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

  //region JIT Receiving Config

  jitReceivingConfigKey = 'jit-receiving-config';
  getJitReceivingConfig() {
    return lsGetKey<JitReceivingConfigKey>(this.jitReceivingConfigKey);
  }
  setJitReceivingConfig(value: {
    factory: UserFactoriesGetApi.ResponseItem | null;
    station: StationsGetApi.ResponseItem | null;
    regularReceivingPrinter: PrintersGetApi.ResponseItem | null;
  }) {
    const notNullValue: JitReceivingConfigKey = {
      factory: value.factory!,
      station: value.station!,
      regularReceivingPrinter: value.regularReceivingPrinter!,
    };
    lsSetKey(this.jitReceivingConfigKey, notNullValue);
    this.patchState({ jitReceivingConfig: notNullValue });
  }
  removeJitReceivingConfig() {
    lsRemoveKey(this.jitReceivingConfigKey);
    this.patchState({ jitReceivingConfig: null });
  }

  //endregion

  removeNonPersistKey() {
    this.removeToken();
    this.removeUser();
  }
}
