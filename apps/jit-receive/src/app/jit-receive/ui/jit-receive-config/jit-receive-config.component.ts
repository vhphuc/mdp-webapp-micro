import { AfterViewInit, ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { TranslateModule } from '@ngx-translate/core';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { Role } from '@shared/data-access/model/api/enum/role';
import { NgClass } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { JitReceiveConfigStoreService } from './jit-receive-config-store.service';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { PrintersGetApi } from '@shared/data-access/model/api/printer-configuration-api';
import { FormsModule } from '@angular/forms';
import { AuthStore } from 'src/app/auth/auth.store';

@Component({
  selector: 'app-jit-receive-config',
  standalone: true,
  imports: [
    NzSpaceModule,
    TranslateModule,
    NzDropDownModule,
    NzIconModule,
    NgClass,
    NzFormModule,
    NzGridModule,
    NzModalModule,
    NzSelectModule,
    FormsModule
  ],
  providers: [JitReceiveConfigStoreService],
  templateUrl: './jit-receive-config.component.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JitReceiveConfigComponent implements AfterViewInit {
  configStore = inject(JitReceiveConfigStoreService);

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

    this._lsStore.removeJitReceivingConfig();
    this.$config.update(config => {
      config.factory = factory;
      config.station = null;
      config.regularReceivingPrinter = null;
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
    this._lsStore.setJitReceivingConfig(this.$config());
  }
  onClickRegularReceivingPrinter(receivingPrinter: PrintersGetApi.ResponseItem) {
    this.$config.update(config => {
      config.regularReceivingPrinter = receivingPrinter;
      return { ...config };
    });
    this._lsStore.setJitReceivingConfig(this.$config());
  }

  onConfigModalCancel() {
    this._lsStore.removeJitReceivingConfig();
    this._authStore.signOut();
  }
  onConfigModalAccept(step: 'factory-modal' | 'station-modal' | 'regular-receiving-printer-modal') {
    switch (step) {
      case 'factory-modal':
        this.configStore.getDataOnChooseFactory(this.$config().factory!.id);
        this.configStore.$isFactoryModalVisible.set(false);
        this.configStore.$isStationModalVisible.set(true);
        break;
      case 'station-modal':
        this.configStore.$isStationModalVisible.set(false);
        this.configStore.$isRegularReceivingPrinterModalVisible.set(true);
        break;
      case 'regular-receiving-printer-modal':
        this.configStore.$isRegularReceivingPrinterModalVisible.set(false);
        this._lsStore.setJitReceivingConfig(this.$config());
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
  signalConfigRegularReceivingPrinterChange(receivingPrinter: PrintersGetApi.ResponseItem) {
    this.$config.update(config => {
      config.regularReceivingPrinter = receivingPrinter;
      return { ...config };
    });
  }

  protected readonly StationType = StationType;
}
