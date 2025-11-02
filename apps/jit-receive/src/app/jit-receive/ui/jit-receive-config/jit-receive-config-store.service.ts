import { computed, Injectable, signal } from '@angular/core';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { PrintersGetApi } from '@shared/data-access/model/api/printer-configuration-api';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { StationApiService } from '@shared/data-access/api/station-api.service';
import { PrinterConfigurationApiService } from '@shared/data-access/api/printer-configuration-api.service';
import { forkJoin } from 'rxjs';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { PrinterType } from '@shared/data-access/model/api/enum/printer-type';

export type JitReceivingConfig = {
  factory: UserFactoriesGetApi.ResponseItem | null;
  station: StationsGetApi.ResponseItem | null;
  regularReceivingPrinter: PrintersGetApi.ResponseItem | null;
};

@Injectable()
export class JitReceiveConfigStoreService {
  $factories = signal<UserFactoriesGetApi.Response>([]);
  $station = signal<StationsGetApi.Response>([]);
  $regularReceivingPrinter = signal<PrintersGetApi.Response>([]);

  $isFactoryModalVisible = signal(false);
  $isStationModalVisible = signal(false);
  $isRegularReceivingPrinterModalVisible = signal(false);

  $isConfiguring = computed(() => {
    let isConfiguring = false;
    const isFactoryModalVisible = this.$isFactoryModalVisible();
    const isStationModalVisible = this.$isStationModalVisible();
    const isRegularReceivingPrinterModalVisible = this.$isRegularReceivingPrinterModalVisible();
    const config = this.$config();
    if (isFactoryModalVisible) isConfiguring = true;
    if (isStationModalVisible) isConfiguring = true;
    if (isRegularReceivingPrinterModalVisible) isConfiguring = true;
    if (!config.factory) isConfiguring = true;
    if (!config.station) isConfiguring = true;
    if (!config.regularReceivingPrinter) isConfiguring = true;
    return isConfiguring;
  });

  $config = signal<JitReceivingConfig>({
    factory: null,
    station: null,
    regularReceivingPrinter: null,
  });

  $jitReceivingConfig = this._lsStore.selectSignal(s => s.jitReceivingConfig);

  constructor(
    private readonly _lsStore: LocalStorageStore,
    private readonly _stationApiSvc: StationApiService,
    private readonly _printerConfigurationApiSvc: PrinterConfigurationApiService
  ) {
    this.getUserFactories();
    this.getDataIfAlreadySetupConfig();
  }

  getUserFactories() {
    this._lsStore
      .select(s => s.user?.factories)
      .subscribe(factories => {
        if (!factories) return;
        this.$factories.set(factories);
      });
  }

  getDataIfAlreadySetupConfig() {
    if (
      !this.$jitReceivingConfig()?.factory ||
      !this.$jitReceivingConfig()?.station ||
      !this.$jitReceivingConfig()?.regularReceivingPrinter
    )
      return;

    const factoryId = this.$jitReceivingConfig()!.factory.id;

    forkJoin([
      this._stationApiSvc.stationsGet(factoryId, 'JitReceivingApp'),
      this._printerConfigurationApiSvc.jitPrintersGet(factoryId),
    ]).subscribe(([station, printer]) => {
      this.$station.set(station.data!);
      this.$regularReceivingPrinter.set(printer.data!.filter(printer => printer.printerType === PrinterType.JitRegular));
    });
  }

  getDataOnChooseFactory(factoryId: Factory) {
    forkJoin([
      this._stationApiSvc.stationsGet(factoryId, 'JitReceivingApp'),
      this._printerConfigurationApiSvc.jitPrintersGet(factoryId),
    ]).subscribe(([station, printer]) => {
      this.$station.set(station.data!);
      this.$regularReceivingPrinter.set(printer.data!.filter(printer => printer.printerType === PrinterType.JitRegular));
    });
  }

  getConfig() {
    this._lsStore
      .select(s => s.user?.factories)
      .subscribe(factories => {
        if (!factories) return;

        if (
          this.$jitReceivingConfig()?.factory &&
          this.$jitReceivingConfig()?.station &&
          this.$jitReceivingConfig()?.regularReceivingPrinter
        ) {
          if (factories.some(uf => uf.id === this.$jitReceivingConfig()!.factory.id)) {
            this.$config.set(this.$jitReceivingConfig()!);
          } else {
            this._lsStore.removeJitReceivingConfig();
            this.startConfigProcess(factories);
          }
        } else {
          this.startConfigProcess(factories);
        }
      });
  }

  startConfigProcess(userFactories: UserFactoriesGetApi.Response) {
    if (userFactories.length > 1) {
      this.$isFactoryModalVisible.set(true);
    } else if (userFactories.length === 1) {
      this.$config.update(config => {
        config.factory = userFactories[0];
        return { ...config };
      });
      this.getDataOnChooseFactory(this.$config().factory!.id);
      this.$isStationModalVisible.set(true);
    }
  }
}
