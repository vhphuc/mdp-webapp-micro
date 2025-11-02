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

export interface TrimConfigState {
  userFactoriesData: UserFactoriesGetApi.Response;
  stationsData: StationsGetApi.Response;
}

const initialState: TrimConfigState = {
  userFactoriesData: [],
  stationsData: [],
};

export type TrimConfig = {
  factory: UserFactoriesGetApi.ResponseItem | null;
  station: StationsGetApi.ResponseItem | null;
};

@Injectable()
export class TrimConfigStore extends ComponentStore<TrimConfigState> implements OnStoreInit {
  $isFactoryModalVisible = signal(false);
  $isStationModalVisible = signal(false);

  $isConfiguring = computed(() => {
    return !this.$config().factory || !this.$config().station || this.$isFactoryModalVisible() || this.$isStationModalVisible();
  });

  $config = signal<TrimConfig>({
    factory: null,
    station: null,
  });

  $vm: Signal<TrimConfigState> = this.selectSignal(s => s);

  $trimConfig = toSignal(this._lsStore.trimConfig$);

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
      filter(() => !!this.$trimConfig()),
      switchMap(() => {
        const factoryId = this.$trimConfig()!.factory.id;
        return forkJoin([this._stationApiSvc.stationsGet(factoryId, <StationRole>'TrimApp')]).pipe(
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

        if (this.$trimConfig()) {
          if (userFactories.some(uf => uf.id === this.$trimConfig()!.factory.id)) {
            this.$config.set(this.$trimConfig()!);
          } else {
            this._lsStore.removeTrimConfig();
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
        return forkJoin([this._stationApiSvc.stationsGet(factoryId, <StationRole>'TrimApp')]).pipe(
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
