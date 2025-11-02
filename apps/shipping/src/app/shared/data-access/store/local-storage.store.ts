import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { LoginApi } from '../../../auth/auth.model';
import { lsGetKey, lsRemoveKey, lsSetKey } from '../../util/helper/local-storage-query';
import { Role } from '../model/api/enum/role';
import { PrintersGetApi } from '../model/api/printer-configuration-api';
import { StationsGetApi } from '../model/api/station-api';
import { UserFactoriesGetApi } from '../model/api/user-factories-get-api';
import { AvailableLanguage } from '../store/translate.store';

export interface ShippingConfigKey {
  factory: UserFactoriesGetApi.ResponseItem;
  station: StationsGetApi.ResponseItem;
  labelPrinter: PrintersGetApi.ResponseItem;
  laserPrinter: PrintersGetApi.ResponseItem;
  hangtagPrinter: PrintersGetApi.ResponseItem | null;
  customInsertPrinter: PrintersGetApi.ResponseItem | null;
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
  shippingConfig: ShippingConfigKey | null;

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
      shippingConfig: this.getShippingConfig(),

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

  //region Shipping Config
  shippingConfigKey = 'shipping-config';
  shippingConfig$ = this.select(state => state.shippingConfig);
  getShippingConfig() {
    return lsGetKey<ShippingConfigKey>(this.shippingConfigKey);
  }
  setShippingConfig(value: {
    factory: UserFactoriesGetApi.ResponseItem | null;
    station: StationsGetApi.ResponseItem | null;
    labelPrinter: PrintersGetApi.ResponseItem | null;
    laserPrinter: PrintersGetApi.ResponseItem | null;
    hangtagPrinter: PrintersGetApi.ResponseItem | null;
    customInsertPrinter: PrintersGetApi.ResponseItem | null;
  }) {
    const notNullValue: ShippingConfigKey = {
      factory: value.factory!,
      station: value.station!,
      labelPrinter: value.labelPrinter!,
      laserPrinter: value.laserPrinter!,
      hangtagPrinter: value.hangtagPrinter,
      customInsertPrinter: value.customInsertPrinter,
    };
    lsSetKey(this.shippingConfigKey, notNullValue);
    this.patchState({ shippingConfig: notNullValue });
  }
  removeShippingConfig() {
    lsRemoveKey(this.shippingConfigKey);
    this.patchState({ shippingConfig: null });
  }

  //endregion

  removeNonPersistKey() {
    this.removeToken();
    this.removeUser();
  }
}
