import { computed, Injectable, Signal, signal } from '@angular/core';
import { ComponentStore, OnStoreInit, tapResponse } from '@ngrx/component-store';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { distinctUntilChanged, filter, forkJoin, pipe, switchMap, tap } from 'rxjs';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { StationsGetApi } from '@shared/data-access/model/api/station-api';
import { StationApiService } from '@shared/data-access/api/station-api.service';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';

export interface MugConfigState {
  userFactoriesData: UserFactoriesGetApi.Response;
  stationsData: StationsGetApi.Response;
}

const initialState: MugConfigState = {
  userFactoriesData: [],
  stationsData: [],
};

export type MugConfig = {
  factory: UserFactoriesGetApi.ResponseItem | null;
  station: StationsGetApi.ResponseItem | null;
};

@Injectable()
export class MugConfigStore extends ComponentStore<MugConfigState> implements OnStoreInit {
  $isFactoryModalVisible = signal(false);
  $isStationModalVisible = signal(false);

  $isConfiguring = computed(() => {
    let isConfiguring = false;
    if (!this.$config().factory) isConfiguring = true;
    if (!this.$config().station) isConfiguring = true;
    if (this.$isFactoryModalVisible()) isConfiguring = true;
    if (this.$isStationModalVisible()) isConfiguring = true;
    return isConfiguring;
  });

  $config = signal<MugConfig>({
    factory: null,
    station: null,
  });

  $vm: Signal<MugConfigState> = this.selectSignal(s => s);

  $mugConfig = toSignal(this._lsStore.mugConfig$);

  constructor(
    private readonly _stationApiSvc: StationApiService,
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
      filter(() => !!this.$mugConfig()),
      switchMap(() => {
        const factoryId = this.$mugConfig()!.factory.id;
        return forkJoin([this._stationApiSvc.stationsGet(factoryId, <StationRole>'Mug')]).pipe(
          tapResponse(
            ([stationsGet]) => {
              this.patchState({
                stationsData: stationsGet.data,
              });
            },
            () => {}
          )
        );
      })
    )
  );

  // need to wait view settle to open modal.
  readonly getConfig = this.effect<never>(
    pipe(
      switchMap(() => this._lsStore.select(s => s.user?.factories)),
      filter(userFactories => !!userFactories),
      tap(userFactories => {
        if (!userFactories) return;

        if (this.$mugConfig()) {
          if (userFactories.some(uf => uf.id === this.$mugConfig()!.factory.id)) {
            this.$config.set(this.$mugConfig()!);
          } else {
            this._lsStore.removeMugConfig();
            this.startConfigProcess(userFactories);
          }
        } else {
          this.startConfigProcess(userFactories);
        }
      })
    )
  );

  readonly getDataOnChooseFactory = this.effect<Factory>(
    pipe(
      distinctUntilChanged(),
      switchMap(factoryId => {
        return forkJoin([this._stationApiSvc.stationsGet(factoryId, <StationRole>'Mug')]).pipe(
          tapResponse(
            ([stationsGet]) => {
              this.patchState({
                stationsData: stationsGet.data,
              });
            },
            () => {}
          )
        );
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
