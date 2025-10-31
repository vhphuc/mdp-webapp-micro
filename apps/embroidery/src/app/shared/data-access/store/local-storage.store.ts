import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { EmbroideryStations } from 'src/app/embroidery/ui/embroidery-config/embroidery-config.model';
import { LoginApi } from '../../../auth/auth.model';
import { lsGetKey, lsRemoveKey, lsSetKey } from '../../util/helper/local-storage-query';
import { Role } from '../model/api/enum/role';
import { UserFactoriesGetApi } from '../model/api/user-factories-get-api';
import { AvailableLanguage } from '../store/translate.store';

//region Embroidery Config
export interface EmbroideryConfigKey {
  factory: UserFactoriesGetApi.ResponseItem;
  station: EmbroideryStations.ResponseItem;
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
  embroideryConfig: EmbroideryConfigKey | null;

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
      embroideryConfig: this.getEmbroideryConfig(),

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

  //region Embroidery Config

  embroideryConfigKey = 'embroidery-config';
  getEmbroideryConfig() {
    return lsGetKey<EmbroideryConfigKey>(this.embroideryConfigKey);
  }
  setEmbroideryConfig(value: {
    factory: UserFactoriesGetApi.ResponseItem | null;
    station: EmbroideryStations.ResponseItem | null;
  }) {
    const notNullValue: EmbroideryConfigKey = {
      factory: value.factory!,
      station: value.station!,
    };
    lsSetKey(this.embroideryConfigKey, notNullValue);
    this.patchState({ embroideryConfig: notNullValue });
  }
  removeEmbroideryConfig() {
    lsRemoveKey(this.embroideryConfigKey);
    this.patchState({ embroideryConfig: null });
  }

  //endregion

  removeNonPersistKey() {
    this.removeToken();
    this.removeUser();
  }
}
