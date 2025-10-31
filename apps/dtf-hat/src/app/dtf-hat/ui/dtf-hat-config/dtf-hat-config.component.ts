import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Role } from '@shared/data-access/model/api/enum/role';
import { AuthStore } from 'src/app/auth/auth.store';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { PrintersGetApi } from '@shared/data-access/model/api/printer-configuration-api';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { FormsModule } from '@angular/forms';
import { DtfHatConfigStoreService } from './dtf-hat-config-store.service';

@Component({
  selector: 'app-dtf-hat-config',
  standalone: true,
  imports: [
    NzSpaceModule,
    NzIconModule,
    NzDropDownModule,
    TranslateModule,
    NzModalModule,
    NzFormModule,
    NzSelectModule,
    NgClass,
    FormsModule,
  ],
  templateUrl: './dtf-hat-config.component.html',
  styles: ``,
  providers: [DtfHatConfigStoreService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DtfHatConfigComponent implements AfterViewInit {
  configStore = inject(DtfHatConfigStoreService);

  $config = this.configStore.$config;
  $isConfiguring = this.configStore.$isConfiguring;
  $isAdmin = this._lsStore.selectSignal(s => s.user?.roles.includes(Role.Administrator) ?? false);

  constructor(
    private readonly _authStore: AuthStore,
    private readonly _lsStore: LocalStorageStore
  ) {}

  ngAfterViewInit() {
    setTimeout(() => this.configStore.getConfig(), 0);
  }

  onClickFactory(factory: UserFactoriesGetApi.ResponseItem) {
    if (this.$config().factory!.id === factory.id) return;

    this._lsStore.removeDtfHatConfig();
    this.$config.update(config => {
      config.factory = factory;
      config.station = null;
      config.regularPrinter = null;
      return { ...config };
    });
    this.configStore.getDataOnChooseFactory(factory.id);
    this.configStore.$isStationModalVisible.set(true);
  }
  onClickStation(station: StationsGetApi.ResponseItem) {
    this.$config.update(config => {
      config.station = station;
      return { ...config };
    });
    this._lsStore.setDtfHatConfig(this.$config());
  }
  onClickRegularPrinter(receivingPrinter: PrintersGetApi.ResponseItem) {
    this.$config.update(config => {
      config.regularPrinter = receivingPrinter;
      return { ...config };
    });
    this._lsStore.setDtfHatConfig(this.$config());
  }

  onConfigModalCancel() {
    this._lsStore.removeDtfHatConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal' | 'regular-printer-modal') {
    switch (step) {
      case 'factory-modal':
        this.configStore.getDataOnChooseFactory(this.$config().factory!.id);
        this.configStore.$isFactoryModalVisible.set(false);
        this.configStore.$isStationModalVisible.set(true);
        break;
      case 'station-modal':
        this.configStore.$isStationModalVisible.set(false);
        this.configStore.$isRegularPrinterModalVisible.set(true);
        break;
      case 'regular-printer-modal':
        this.configStore.$isRegularPrinterModalVisible.set(false);
        this._lsStore.setDtfHatConfig(this.$config());
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
  signalConfigRegularPrinterChange(regularPrinter: PrintersGetApi.ResponseItem) {
    this.$config.update(config => {
      config.regularPrinter = regularPrinter;
      return { ...config };
    });
  }

  protected readonly StationType = StationType;
}
