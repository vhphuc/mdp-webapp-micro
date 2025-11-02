import { computed, Injectable, Signal, signal } from '@angular/core';
import { ComponentStore, OnStoreInit, tapResponse } from '@ngrx/component-store';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { distinctUntilChanged, filter, forkJoin, pipe, switchMap, tap } from 'rxjs';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { QaLeadPrintersGetApi, QaLeadStationsGetApi } from '../model/qa-lead-config-api';
import { QaLeadConfigApiService } from '../api/qa-lead-config-api.service';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { StationType } from '@shared/data-access/model/api/enum/station-type';

export interface QaLeadConfigState {
  userFactoriesData: UserFactoriesGetApi.Response;
  stationsData: QaLeadStationsGetApi.Response;
  labelPrintersData: QaLeadPrintersGetApi.Response;
  ticketLabelPrintersData: QaLeadPrintersGetApi.Response;
  laserPrintersData: QaLeadPrintersGetApi.Response;
  labelPrinter2x4sData: QaLeadPrintersGetApi.Response;
}

const initialState: QaLeadConfigState = {
  userFactoriesData: [],
  stationsData: [],
  labelPrintersData: [],
  ticketLabelPrintersData: [],
  laserPrintersData: [],
  labelPrinter2x4sData: [],
};

export type QaLeadConfig = {
  factory: UserFactoriesGetApi.ResponseItem | null;
  station: QaLeadStationsGetApi.ResponseItem | null;
  labelPrinter: QaLeadPrintersGetApi.ResponseItem | null;
  ticketLabelPrinter: QaLeadPrintersGetApi.ResponseItem | null;
  laserPrinter: QaLeadPrintersGetApi.ResponseItem | null;
};

@Injectable()
export class QaLeadConfigStore extends ComponentStore<QaLeadConfigState> implements OnStoreInit {
  $isFactoryModalVisible = signal(false);
  $isStationModalVisible = signal(false);
  $isLabelPrinterModalVisible = signal(false);
  $isTicketLabelPrinterModalVisible = signal(false);
  $isLaserPrinterModalVisible = signal(false);

  $isConfiguring = computed(() => {
    let isConfiguring = false;
    if (this.$isFactoryModalVisible()) isConfiguring = true;
    if (this.$isStationModalVisible()) isConfiguring = true;
    if (this.$isLabelPrinterModalVisible()) isConfiguring = true;
    if (this.$isTicketLabelPrinterModalVisible()) isConfiguring = true;
    if (this.$isLaserPrinterModalVisible()) isConfiguring = true;
    if (!this.$config().factory) isConfiguring = true;
    if (!this.$config().station) isConfiguring = true;
    if (!this.$config().labelPrinter) isConfiguring = true;
    if (this.$config().station?.stationType === StationType.QaSock && !this.$config().ticketLabelPrinter) isConfiguring = true;
    if (!this.$config().laserPrinter) isConfiguring = true;
    return isConfiguring;
  });

  $config = signal<QaLeadConfig>({
    factory: null,
    station: null,
    labelPrinter: null,
    ticketLabelPrinter: null,
    laserPrinter: null,
  });

  $vm: Signal<QaLeadConfigState> = this.selectSignal(s => s);

  qaLeadConfig = this._lsStore.selectSignal(s => s.qaLeadConfig);

  constructor(
    private readonly _qaLeadConfigApiSvc: QaLeadConfigApiService,
    private readonly _lsStore: LocalStorageStore
  ) {
    super(initialState);
  }

  ngrxOnStoreInit() {
    this.#getUserFactories();
    this.#getDataIfAlreadySetupConfig();
  }

  readonly #getUserFactories = this.effect<never>(
    pipe(
      switchMap(() => this._lsStore.select(s => s.user?.factories)),
      filter(userFactories => !!userFactories),
      tap(userFactoriesData => this.patchState({ userFactoriesData }))
    )
  );

  readonly #getDataIfAlreadySetupConfig = this.effect<never>(
    pipe(
      filter(() => !!this.qaLeadConfig()?.factory),
      switchMap(() => {
        const factoryId = this.qaLeadConfig()!.factory.id;
        return forkJoin([
          this._qaLeadConfigApiSvc.stationsGet(factoryId, false),
          this._qaLeadConfigApiSvc.labelPrintersGet(factoryId),
          this._qaLeadConfigApiSvc.ticketLabelPrintersGet(factoryId),
          this._qaLeadConfigApiSvc.laserPrintersGet(factoryId),
          this._qaLeadConfigApiSvc.labelPrinter2x4sGet(factoryId),
        ]).pipe(
          tapResponse(
            ([stationsData, labelPrintersData, ticketLabelPrintersData, laserPrintersData, labelPrinter2x4sData]) => {
              this.patchState({
                stationsData: stationsData.data,
                labelPrintersData: labelPrintersData.data,
                ticketLabelPrintersData: ticketLabelPrintersData.data,
                laserPrintersData: laserPrintersData.data,
                labelPrinter2x4sData: labelPrinter2x4sData.data,
              });
            },
            () => {}
          )
        );
      })
    )
  );

  readonly getDataOnChooseFactory = this.effect<Factory>(
    pipe(
      distinctUntilChanged(),
      switchMap(factoryId => {
        return forkJoin([
          this._qaLeadConfigApiSvc.stationsGet(factoryId, false),
          this._qaLeadConfigApiSvc.labelPrintersGet(factoryId),
          this._qaLeadConfigApiSvc.ticketLabelPrintersGet(factoryId),
          this._qaLeadConfigApiSvc.laserPrintersGet(factoryId),
          this._qaLeadConfigApiSvc.labelPrinter2x4sGet(factoryId),
        ]).pipe(
          tapResponse(
            ([stationsData, labelPrintersData, ticketLabelPrintersData, laserPrintersData, labelPrinter2x4sData]) => {
              this.patchState({
                stationsData: stationsData.data,
                labelPrintersData: labelPrintersData.data,
                ticketLabelPrintersData: ticketLabelPrintersData.data,
                laserPrintersData: laserPrintersData.data,
                labelPrinter2x4sData: labelPrinter2x4sData.data,
              });
            },
            () => {}
          )
        );
      })
    )
  );

  readonly getConfig = this.effect<never>(
    pipe(
      switchMap(() => this._lsStore.select(s => s.user?.factories)),
      filter(userFactories => !!userFactories),
      tap(userFactories => {
        if (!userFactories) return;

        if (this.qaLeadConfig()?.factory) {
          if (userFactories.some(uf => uf.id === this.qaLeadConfig()!.factory.id)) {
            this.$config.set(this.qaLeadConfig()!);
          } else {
            this._lsStore.removeQaLeadConfig();
            this.startConfigProcess(userFactories);
          }
        } else {
          this.startConfigProcess(userFactories);
        }
      })
    )
  );

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
