import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { TranslateModule } from '@ngx-translate/core';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NeckLabelConfigStore } from '../data-access/store/neck-label-config.store';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { Role } from '@shared/data-access/model/api/enum/role';
import { NeckLabelStore } from '../data-access/store/neck-label.store';
import { FormsModule } from '@angular/forms';
import { provideComponentStore } from '@ngrx/component-store';
import { AuthStore } from 'src/app/auth/auth.store';
import { StationsGetApi } from 'src/app/shared/data-access/model/api/station-api';

@Component({
  selector: 'app-neck-label-config',
  standalone: true,
  imports: [
    CommonModule,
    NzDropDownModule,
    NzIconModule,
    NzMenuModule,
    NzSpaceModule,
    TranslateModule,
    NzFormModule,
    NzGridModule,
    NzModalModule,
    NzSelectModule,
    FormsModule,
  ],
  providers: [provideComponentStore(NeckLabelConfigStore)],
  template: `
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
        {{ 'NECK_LABEL.FACTORY' | translate }}: {{ $config().factory!.name }}
      </div>
      <nz-dropdown-menu #factoryMenu="nzDropdownMenu">
        <ul nz-menu>
          <li
            nz-menu-item
            *ngFor="let factory of $vm().userFactoriesData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
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
        {{ 'NECK_LABEL.STATION' | translate }}: {{ $config().station!.stationName }}
      </div>
      <nz-dropdown-menu #stationMenu="nzDropdownMenu">
        <ul nz-menu class="tw-max-h-96 tw-overflow-y-auto tw-slim-scrollbar">
          <li
            nz-menu-item
            *ngFor="let station of $vm().stationsData"
            class="hover:tw-bg-primary hover:tw-text-white tw-cursor-pointer"
            (click)="onClickStation(station)"
            [ngClass]="$config().station!.id === station.id ? 'tw-bg-primary tw-text-white' : ''">
            <span>{{ station.stationName }}</span>
          </li>
        </ul>
      </nz-dropdown-menu>
    </nz-space>

    <!-- Factory Modal -->
    <nz-modal
      [nzVisible]="nlConfigStore.$isFactoryModalVisible()"
      [nzTitle]="'NECK_LABEL.FACTORY' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('factory-modal')"
      [nzOkDisabled]="!$config().factory">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'SHIPPING.FACTORY' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select id="factory-select" [ngModel]="$config().factory" (ngModelChange)="signalConfigFactoryChange($event)">
              <nz-option *ngFor="let factory of $vm().userFactoriesData" [nzValue]="factory" [nzLabel]="factory.name"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <!-- Station Modal -->
    <nz-modal
      [nzVisible]="nlConfigStore.$isStationModalVisible()"
      [nzTitle]="'NECK_LABEL.STATION' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('station-modal')"
      [nzOkDisabled]="!$config().station">
      <ng-container *nzModalContent>
        <nz-form-item class="tw-mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw-font-semibold">{{ 'SHIPPING.STATION' | translate }}</nz-form-label>
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
export class NeckLabelConfigComponent implements AfterViewInit {
  nlStore = inject(NeckLabelStore);
  nlConfigStore = inject(NeckLabelConfigStore);
  $vm = this.nlConfigStore.selectSignal(s => s);
  $config = this.nlConfigStore.$config;
  $isConfiguring = this.nlConfigStore.$isConfiguring;
  $isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _lsStore: LocalStorageStore
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.nlConfigStore.getConfig(), 0);
  }

  onClickFactory(factory: UserFactoriesGetApi.ResponseItem) {
    if (this.$config().factory!.id === factory.id) return;

    this._lsStore.removeNeckLabelConfig();
    this.$config.update(config => {
      config.factory = factory;
      config.station = null;
      return { ...config };
    });
    this.nlConfigStore.getDataOnChooseFactory(factory.id);
    this.nlConfigStore.$isStationModalVisible.set(true);
  }
  onClickStation(station: StationsGetApi.ResponseItem) {
    this.$config.update(config => {
      config.station = station;
      return { ...config };
    });
    this._lsStore.setNeckLabelConfig(this.$config());
  }

  onConfigModalCancel() {
    this._lsStore.removeNeckLabelConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal') {
    switch (step) {
      case 'factory-modal':
        this.nlConfigStore.getDataOnChooseFactory(this.$config().factory!.id);
        this.nlConfigStore.$isFactoryModalVisible.set(false);
        this.nlConfigStore.$isStationModalVisible.set(true);
        break;
      case 'station-modal':
        this.nlConfigStore.$isStationModalVisible.set(false);
        this._lsStore.setNeckLabelConfig(this.$config());
        this.nlStore.patchState({ scanItem: null });
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
