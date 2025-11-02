import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { TranslateModule } from '@ngx-translate/core';
import { Role } from '@shared/data-access/model/api/enum/role';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { provideComponentStore } from '@ngrx/component-store';
import { TrimConfigStore } from '../data-access/store/trim-config.store';
import { FormsModule } from '@angular/forms';
import { TrimStore } from '../data-access/store/trim.store';
import { AuthStore } from 'src/app/auth/auth.store';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';

@Component({
  selector: 'app-trim-config',
  standalone: true,
  imports: [
    CommonModule,
    NzDropDownModule,
    NzFormModule,
    NzGridModule,
    NzIconModule,
    NzMenuModule,
    NzModalModule,
    NzSelectModule,
    NzSpaceModule,
    TranslateModule,
    FormsModule,
  ],
  providers: [provideComponentStore(TrimConfigStore)],
  template: `
    <!-- if already done config and config has been transferred to form -->
    <nz-space [nzSplit]="spaceSplit" *ngIf="!$isConfiguring()">
      <ng-template #spaceSplit>
        <span nz-icon nzType="minus" nzTheme="outline" class="tw-text-white"></span>
      </ng-template>

      <!-- Factory -->
      <div
        *nzSpaceItem
        nz-dropdown
        [nzDropdownMenu]="factoryMenu"
        class="tw-text-white tw-cursor-pointer tw-font-semibold"
        [class.tw-pointer-events-none]="!$isAdmin()">
        {{ 'TRIM.FACTORY' | translate }}: {{ $config().factory!.name }}
      </div>
      <nz-dropdown-menu #factoryMenu="nzDropdownMenu">
        <ul nz-menu>
          <li
            nz-menu-item
            *ngFor="let factory of $vm().userFactoriesData"
            class="hover:tw-bg-primary-light hover:tw-text-white tw-cursor-pointer"
            (click)="onClickFactory(factory)"
            [ngClass]="$config().factory!.id === factory.id ? 'tw-bg-primary tw-text-white' : ''">
            <span class="tw-inline-block tw-text-sm tw-w-full">{{ factory.name }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
      <!-- Station -->
      <div
        *nzSpaceItem
        nz-dropdown
        [nzDropdownMenu]="stationMenu"
        class="tw-text-white tw-cursor-pointer tw-font-semibold"
        [class.tw-pointer-events-none]="!$isAdmin()">
        {{ 'TRIM.STATION' | translate }}: {{ $config().station!.stationName }}
      </div>
      <nz-dropdown-menu #stationMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let station of $vm().stationsData"
            class="hover:tw-bg-primary-light hover:tw-text-white tw-cursor-pointer"
            (click)="onClickStation(station)"
            [ngClass]="$config().station!.id === station.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ station.stationName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
    </nz-space>

    <!-- Factory -->
    <nz-modal
      [nzVisible]="trimConfigStore.$isFactoryModalVisible()"
      [nzTitle]="'TRIM.FACTORY' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('factory-modal')"
      [nzOkDisabled]="!$config().factory">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'TRIM.FACTORY' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select id="factory-select" [ngModel]="$config().factory" (ngModelChange)="signalConfigFactoryChange($event)">
              <nz-option *ngFor="let factory of $vm().userFactoriesData" [nzValue]="factory" [nzLabel]="factory.name"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <!-- Station -->
    <nz-modal
      [nzVisible]="trimConfigStore.$isStationModalVisible()"
      [nzTitle]="'TRIM.STATION' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('station-modal')"
      [nzOkDisabled]="!$config().station">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'TRIM.STATION' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select id="station-select" [ngModel]="$config().station" (ngModelChange)="signalConfigStationChange($event)" nzShowSearch>
              <nz-option *ngFor="let station of $vm().stationsData" [nzValue]="station" [nzLabel]="station.stationName"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimConfigComponent implements AfterViewInit {
  trimStore = inject(TrimStore);
  trimConfigStore = inject(TrimConfigStore);
  $vm = this.trimConfigStore.$vm;
  $config = this.trimConfigStore.$config;
  $isConfiguring = this.trimConfigStore.$isConfiguring;
  $isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _lsStore: LocalStorageStore
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.trimConfigStore.getConfig());
  }

  onClickFactory(factory: UserFactoriesGetApi.ResponseItem) {
    if (this.$config().factory!.id === factory.id) return;

    this._lsStore.removeTrimConfig();
    this.$config.update(config => {
      config.factory = factory;
      config.station = null;
      return { ...config };
    });
    this.trimConfigStore.getDataOnChooseFactory(factory.id);
    this.trimConfigStore.$isStationModalVisible.set(true);
  }
  onClickStation(station: StationsGetApi.ResponseItem) {
    this.trimConfigStore.$config.update(config => {
      config.station = station;
      return { ...config };
    });
    this._lsStore.setTrimConfig(this.$config());
  }
  onConfigModalCancel() {
    this._lsStore.removeTrimConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal') {
    switch (step) {
      case 'factory-modal':
        this.trimConfigStore.getDataOnChooseFactory(this.$config().factory!.id);
        this.trimConfigStore.$isFactoryModalVisible.set(false);
        this.trimConfigStore.$isStationModalVisible.set(true);
        break;
      case 'station-modal':
        this.trimConfigStore.$isStationModalVisible.set(false);
        this._lsStore.setTrimConfig(this.$config());
        this.trimStore.patchState({ item: null, controlError: null, confirmApiMsg: null });
        break;
    }
  }

  signalConfigFactoryChange(factory: UserFactoriesGetApi.ResponseItem) {
    this.$config.update(config => {
      config.factory = factory;
      return { ...config };
    });
  }
  signalConfigStationChange(station: StationsGetApi.ResponseItem) {
    this.$config.update(config => {
      config.station = station;
      return { ...config };
    });
  }
}
