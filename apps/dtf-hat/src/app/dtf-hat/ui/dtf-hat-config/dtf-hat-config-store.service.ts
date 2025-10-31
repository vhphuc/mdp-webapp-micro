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

export type DtfHatConfig = {
  factory: UserFactoriesGetApi.ResponseItem | null;
  station: StationsGetApi.ResponseItem | null;
  regularPrinter: PrintersGetApi.ResponseItem | null;
};

@Injectable()
export class DtfHatConfigStoreService {
  $factories = signal<UserFactoriesGetApi.Response>([]);
  $station = signal<StationsGetApi.Response>([]);
  $regularPrinter = signal<PrintersGetApi.Response>([]);

  $isFactoryModalVisible = signal(false);
  $isStationModalVisible = signal(false);
  $isRegularPrinterModalVisible = signal(false);

  $isConfiguring = computed(() => {
    let isConfiguring = false;
    const isFactoryModalVisible = this.$isFactoryModalVisible();
    const isStationModalVisible = this.$isStationModalVisible();
    const isRegularPrinterModalVisible = this.$isRegularPrinterModalVisible();
    const config = this.$config();
    if (isFactoryModalVisible) isConfiguring = true;
    if (isStationModalVisible) isConfiguring = true;
    if (isRegularPrinterModalVisible) isConfiguring = true;
    if (!config.factory) isConfiguring = true;
    if (!config.station) isConfiguring = true;
    if (!config.regularPrinter) isConfiguring = true;
    return isConfiguring;
  });

  $config = signal<DtfHatConfig>({
    factory: null,
    station: null,
    regularPrinter: null,
  });

  $dtfHatConfig = this._lsStore.selectSignal(s => s.dtfHatConfig);

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
    if (!this.$dtfHatConfig()) return;

    const factoryId = this.$dtfHatConfig()!.factory.id;

    forkJoin([
      this._stationApiSvc.stationsGet(factoryId, 'DTF-Hat'),
      this._printerConfigurationApiSvc.printersGet(factoryId, PrinterType.DTFHatRegular),
    ]).subscribe(([station, printer]) => {
      this.$station.set(station.data!);
      this.$regularPrinter.set(printer.data!);
    });
  }

  getDataOnChooseFactory(factoryId: Factory) {
    forkJoin([
      this._stationApiSvc.stationsGet(factoryId, 'DTF-Hat'),
      this._printerConfigurationApiSvc.printersGet(factoryId, PrinterType.DTFHatRegular),
    ]).subscribe(([station, printer]) => {
      this.$station.set(station.data!);
      this.$regularPrinter.set(printer.data!);
    });
  }

  getConfig() {
    this._lsStore
      .select(s => s.user?.factories)
      .subscribe(factories => {
        if (!factories) return;

        if (this.$dtfHatConfig()) {
          if (factories.some(uf => uf.id === this.$dtfHatConfig()!.factory.id)) {
            this.$config.set(this.$dtfHatConfig()!);
          } else {
            this._lsStore.removeDtfHatConfig();
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
