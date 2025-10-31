import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { EmbroideryStations } from './embroidery-config.model';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { EmbroideryConfigService } from './embroidery-config.service';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { Role } from '@shared/data-access/model/api/enum/role';
import { EmbroideryStore } from '../../embroidery.store';
import { FormsModule } from '@angular/forms';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-embroidery-config',
  standalone: true,
  imports: [
    NzSpaceModule,
    NzDropDownModule,
    TranslateModule,
    NgClass,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    FormsModule,
    NzIconModule,
  ],
  template: `
    @if (!isConfiguring()) {
      <nz-space [nzSplit]="spaceSplit">
        <ng-template #spaceSplit>
          <span nz-icon nzType="minus" nzTheme="outline" class="tw:text-white"></span>
        </ng-template>

        <!-- Factory -->
        <div
          *nzSpaceItem
          nz-dropdown
          [nzDropdownMenu]="factoryMenu"
          class="tw:text-white tw:cursor-pointer tw:font-semibold"
          [class.tw:pointer-events-none]="!isAdmin()">
          {{ 'FACTORY' | translate }}: {{ config().factory!.name }}
        </div>
        <nz-dropdown-menu #factoryMenu="nzDropdownMenu">
          <ul nz-menu>
            @for (factory of userFactoriesData(); track $index) {
              <li
                nz-menu-item
                class="tw:hover:bg-primary tw:hover:text-white tw:cursor-pointer"
                (click)="onClickFactory(factory)"
                [ngClass]="config().factory!.id === factory.id ? 'tw:bg-primary tw:text-white' : ''">
                <span class="tw:inline-block tw:text-sm tw:w-full">{{ factory.name }}</span>
              </li>
            }
          </ul>
        </nz-dropdown-menu>
        <!-- Station -->
        <div
          *nzSpaceItem
          nz-dropdown
          [nzDropdownMenu]="stationMenu"
          class="tw:text-white tw:cursor-pointer tw:font-semibold"
          [class.tw:pointer-events-none]="!isAdmin()">
          {{ 'STATION' | translate }}: {{ config().station!.stationName }}
        </div>
        <nz-dropdown-menu #stationMenu="nzDropdownMenu">
          <ul nz-menu class="tw:max-h-96 tw:overflow-y-auto tw:slim-scrollbar">
            @for (station of stationsData(); track $index) {
              <li
                nz-menu-item
                class="tw:hover:bg-primary tw:hover:text-white tw:cursor-pointer"
                (click)="onClickStation(station)"
                [ngClass]="config().station!.id === station.id ? 'tw:bg-primary tw:text-white' : ''">
                <span>{{ station.stationName }}</span>
              </li>
            }
          </ul>
        </nz-dropdown-menu>
      </nz-space>
    }

    <!-- Factory Modal -->
    <nz-modal
      [nzVisible]="isFactoryModalVisible()"
      [nzTitle]="'FACTORY' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('factory-modal')"
      [nzOkDisabled]="!config().factory">
      <ng-container *nzModalContent>
        <nz-form-item class="tw:mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw:font-semibold">{{ 'FACTORY' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select id="factory-select" [ngModel]="config().factory" (ngModelChange)="signalConfigFactoryChange($event)">
              @for (factory of userFactoriesData(); track $index) {
                <nz-option [nzValue]="factory" [nzLabel]="factory.name"></nz-option>
              }
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
    <!-- Station Modal -->
    <nz-modal
      [nzVisible]="isStationModalVisible()"
      [nzTitle]="'STATION' | translate"
      (nzOnCancel)="onConfigModalCancel()"
      (nzOnOk)="onConfigModalAccept('station-modal')"
      [nzOkDisabled]="!config().station">
      <ng-container *nzModalContent>
        <nz-form-item class="tw:mb-0">
          <nz-form-label [nzSm]="4" nzRequired class="tw:font-semibold">{{ 'STATION' | translate }}</nz-form-label>
          <nz-form-control [nzSm]="20">
            <nz-select id="station-select" [ngModel]="config().station" (ngModelChange)="signalConfigStationChange($event)" nzShowSearch>
              @for (station of stationsData(); track $index) {
                <nz-option [nzValue]="station" [nzLabel]="station.stationName"></nz-option>
              }
            </nz-select>
          </nz-form-control>
        </nz-form-item>
      </ng-container>
    </nz-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmbroideryConfigComponent implements AfterViewInit {
  store = inject(EmbroideryStore);

  isFactoryModalVisible = signal(false);
  isStationModalVisible = signal(false);

  isConfiguring = computed(() => {
    const isFactoryModalVisible = this.isFactoryModalVisible();
    const isStationModalVisible = this.isStationModalVisible();
    const isFactoryChosen = this.config().factory !== null;
    const isStationChosen = this.config().station !== null;
    return isFactoryModalVisible || isStationModalVisible || !isFactoryChosen || !isStationChosen;
  });

  config = signal<{
    factory: UserFactoriesGetApi.ResponseItem | null;
    station: EmbroideryStations.ResponseItem | null;
  }>({
    factory: null,
    station: null,
  });

  cachedConfig = this._lsStore.selectSignal(s => s.embroideryConfig);

  userFactoriesData = this._lsStore.selectSignal(s => s.user?.factories);
  stationsData = signal<EmbroideryStations.Response>([]);

  isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _apiSvc: EmbroideryConfigService,
    private readonly _lsStore: LocalStorageStore,
    private readonly _authStore: AuthStore
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.getConfig(), 0);
  }

  getConfig() {
    this._lsStore
      .select(s => s.user)
      .subscribe(user => {
        if (!user) return;

        const userFactories = user.factories;
        const cachedConfig = this.cachedConfig();
        if (cachedConfig) {
          if (userFactories.some(uf => uf.id === cachedConfig.factory.id)) {
            this.config.set(cachedConfig);
            this.getDataByFactory(this.config().factory!.id);
          } else {
            this._lsStore.removeEmbroideryConfig();
            this.startConfigProcess(userFactories);
          }
        } else {
          this.startConfigProcess(userFactories);
        }
      });
  }

  getDataByFactory(factoryId: Factory) {
    this._apiSvc.getStations(factoryId).subscribe({
      next: resp => {
        if (!resp.data) return;
        this.stationsData.set(resp.data);
      },
    });
  }

  startConfigProcess(userFactories: UserFactoriesGetApi.Response) {
    if (userFactories.length > 1) {
      this.isFactoryModalVisible.set(true);
    } else if (userFactories.length === 1) {
      this.config.update(config => {
        config.factory = userFactories[0];
        return { ...config };
      });
      this.getDataByFactory(this.config().factory!.id);
      this.isStationModalVisible.set(true);
    }
  }

  onClickFactory(factory: UserFactoriesGetApi.ResponseItem) {
    if (this.config().factory!.id === factory.id) return;

    this._lsStore.removeEmbroideryConfig();
    this.config.update(config => {
      config.factory = factory;
      config.station = null;
      return { ...config };
    });
    this.getDataByFactory(factory.id);
    this.isStationModalVisible.set(true);
  }
  onClickStation(station: EmbroideryStations.ResponseItem) {
    this.config.update(config => {
      config.station = station;
      return { ...config };
    });
    this._lsStore.setEmbroideryConfig(this.config());
  }

  onConfigModalCancel() {
    this._lsStore.removeEmbroideryConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal') {
    switch (step) {
      case 'factory-modal':
        this.getDataByFactory(this.config().factory!.id);
        this.isFactoryModalVisible.set(false);
        this.isStationModalVisible.set(true);
        break;
      case 'station-modal':
        this.isStationModalVisible.set(false);
        this._lsStore.setEmbroideryConfig(this.config());
        this.store.item.set(null);
        break;
    }
  }

  signalConfigFactoryChange(factory: UserFactoriesGetApi.ResponseItem) {
    this.config.update(config => {
      config.factory = factory;
      return { ...config };
    });
  }
  signalConfigStationChange(station: EmbroideryStations.ResponseItem) {
    this.config.update(config => {
      config.station = station;
      return { ...config };
    });
  }
}
