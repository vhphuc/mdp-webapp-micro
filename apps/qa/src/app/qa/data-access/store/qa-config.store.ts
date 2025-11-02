import { ChangeDetectorRef, Injectable, Signal, signal } from '@angular/core';
import { ComponentStore, OnStoreInit, tapResponse } from '@ngrx/component-store';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { combineLatest, distinctUntilChanged, filter, forkJoin, pipe, switchMap, tap } from 'rxjs';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { QaPrintersGetApi, QaStationsGetApi } from '../model/qa-config-api';
import { QaConfigApiService } from '../api/qa-config-api.service';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { StationType } from '@shared/data-access/model/api/enum/station-type';

export interface QaConfigState {
  userFactoriesData: UserFactoriesGetApi.Response;
  stationsData: QaStationsGetApi.Response;
  labelPrintersData: QaPrintersGetApi.Response;
  ticketLabelPrintersData: QaPrintersGetApi.Response;
  laserPrintersData: QaPrintersGetApi.Response;
  labelPrinter2x4sData: QaPrintersGetApi.Response;
}

const initialState: QaConfigState = {
  userFactoriesData: [],
  stationsData: [],
  labelPrintersData: [],
  ticketLabelPrintersData: [],
  laserPrintersData: [],
  labelPrinter2x4sData: [],
};

@Injectable()
export class QaConfigStore extends ComponentStore<QaConfigState> implements OnStoreInit {
  $isFactoryModalVisible = signal(false);
  $isStationModalVisible = signal(false);
  $isLabelPrinterModalVisible = signal(false);
  $isTicketLabelPrinterModalVisible = signal(false);
  $isLaserPrinterModalVisible = signal(false);

  configForm = new FormGroup({
    chosenFactory: new FormControl<UserFactoriesGetApi.ResponseItem | null>(null, [Validators.required]),
    chosenStation: new FormControl<QaStationsGetApi.ResponseItem | null>(null, [Validators.required]),
    chosenLabelPrinter: new FormControl<QaPrintersGetApi.ResponseItem | null>(null, [Validators.required]),
    chosenTicketLabelPrinter: new FormControl<QaPrintersGetApi.ResponseItem | null>(null),
    chosenLaserPrinter: new FormControl<QaPrintersGetApi.ResponseItem | null>(null, [Validators.required]),
  });

  $vm: Signal<QaConfigState> = this.selectSignal(s => s);

  $qaConfig = toSignal(this._lsStore.qaConfig$);

  constructor(
    private readonly _qaConfigApiSvc: QaConfigApiService,
    private readonly _lsStore: LocalStorageStore,
    private readonly _cdr: ChangeDetectorRef
  ) {
    super(initialState);
  }

  ngrxOnStoreInit() {
    this.#getUserFactories();

    // get data if already setup qa config
    this.#getData();
  }

  readonly #getUserFactories = this.effect<never>(
    pipe(
      switchMap(() => this._lsStore.select(s => s.user?.factories)),
      filter(userFactories => !!userFactories),
      tap(userFactoriesData => this.patchState({ userFactoriesData }))
    )
  );

  readonly #getData = this.effect<never>(
    pipe(
      filter(() => !!this.$qaConfig()),
      switchMap(() => {
        const factoryId = this.$qaConfig()!.chosenFactory.id;
        return forkJoin([
          this._qaConfigApiSvc.stationsGet(factoryId),
          this._qaConfigApiSvc.labelPrintersGet(factoryId),
          this._qaConfigApiSvc.ticketLabelPrintersGet(factoryId),
          this._qaConfigApiSvc.laserPrintersGet(factoryId),
          this._qaConfigApiSvc.labelPrinter2x4sGet(factoryId),
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
      switchMap(() => combineLatest([this._lsStore.qaConfig$, this._lsStore.select(s => s.user?.factories)])),
      filter(([_, userFactories]) => !!userFactories),
      tap(([qaConfig, userFactories]) => {
        if (qaConfig) {
          if (userFactories!.some(uf => uf.id === qaConfig.chosenFactory.id)) {
            this.configForm.setValue(qaConfig);
          } else {
            this._lsStore.removeQaConfig();
          }
        } else if (userFactories!.length > 1) {
          this.$isFactoryModalVisible.set(true);
        } else if (userFactories!.length === 1) {
          this.configForm.controls.chosenFactory.patchValue(userFactories![0]);
          this.getDataOnChooseFactory(this.configForm.controls.chosenFactory.getRawValue()!.id);
          this.$isStationModalVisible.set(true);
        }
        this._cdr.markForCheck();
      })
    )
  );

  readonly getDataOnChooseFactory = this.effect<Factory>(
    pipe(
      distinctUntilChanged(),
      switchMap(factoryId => {
        return forkJoin([
          this._qaConfigApiSvc.stationsGet(factoryId),
          this._qaConfigApiSvc.labelPrintersGet(factoryId),
          this._qaConfigApiSvc.ticketLabelPrintersGet(factoryId),
          this._qaConfigApiSvc.laserPrintersGet(factoryId),
          this._qaConfigApiSvc.labelPrinter2x4sGet(factoryId),
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
}
