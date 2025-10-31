import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { LoginApi } from '../../../auth/auth.model';
import { lsGetKey, lsRemoveKey, lsSetKey } from '../../util/helper/local-storage-query';
import { Role } from '../model/api/enum/role';
import { PrintersGetApi } from '../model/api/printer-configuration-api';
import { UserFactoriesGetApi } from '../model/api/user-factories-get-api';
import { AvailableLanguage } from '../store/translate.store';

//region Hangtag Config
export interface HangtagConfigKey {
  factory: UserFactoriesGetApi.ResponseItem;
  hangtagPrinter: PrintersGetApi.ResponseItem;
}
//endregion

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
  hangtagConfig: HangtagConfigKey | null;

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
      hangtagConfig: this.getHangtagConfig(),

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

  //region Hangtag Config

  hangtagConfigKey = 'hangtag-config';
  getHangtagConfig() {
    return lsGetKey<HangtagConfigKey>(this.hangtagConfigKey);
  }
  setHangtagConfig(value: { factory: UserFactoriesGetApi.ResponseItem | null; hangtagPrinter: PrintersGetApi.ResponseItem | null }) {
    const notNullValue: HangtagConfigKey = {
      factory: value.factory!,
      hangtagPrinter: value.hangtagPrinter!,
    };
    lsSetKey(this.hangtagConfigKey, notNullValue);
    this.patchState({ hangtagConfig: notNullValue });
  }
  removeHangtagConfig() {
    lsRemoveKey(this.hangtagConfigKey);
    this.patchState({ hangtagConfig: null });
  }

  //endregion

  removeNonPersistKey() {
    this.removeToken();
    this.removeUser();
  }
}
