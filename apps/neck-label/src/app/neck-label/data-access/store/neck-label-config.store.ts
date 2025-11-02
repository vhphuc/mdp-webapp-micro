import { computed, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ComponentStore, OnStoreInit } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import { Factory } from '@shared/data-access/model/api/enum/factory';
import { StationRole } from '@shared/data-access/model/api/enum/station-role';
import { UserFactoriesGetApi } from '@shared/data-access/model/api/user-factories-get-api';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { distinctUntilChanged, filter, pipe, switchMap, tap } from 'rxjs';
import { StationApiService } from 'src/app/shared/data-access/api/station-api.service';
import { StationsGetApi } from 'src/app/shared/data-access/model/api/station-api';

export interface NeckLabelConfigState {
  userFactoriesData: UserFactoriesGetApi.Response;
  stationsData: StationsGetApi.Response;
}

const initialState: NeckLabelConfigState = {
  userFactoriesData: [],
  stationsData: [],
};

export type NeckLabelConfig = {
  factory: UserFactoriesGetApi.ResponseItem | null;
  station: StationsGetApi.ResponseItem | null;
};

@Injectable()
export class NeckLabelConfigStore extends ComponentStore<NeckLabelConfigState> implements OnStoreInit {
  $isFactoryModalVisible = signal(false);
  $isStationModalVisible = signal(false);

  $isConfiguring = computed(() => {
    return this.$isFactoryModalVisible() || this.$isStationModalVisible() || !this.$config().factory || !this.$config().station;
  });

  $config = signal<NeckLabelConfig>({
    factory: null,
    station: null,
  });

  $nlConfig = toSignal(this._lsStore.necklabelConfig$);

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
      filter(() => !!this.$nlConfig()),
      switchMap(() => {
        const factoryId = this.$nlConfig()!.factory.id;
        return this._stationApiSvc.stationsGet(factoryId, <StationRole>'NeckLabel').pipe(
          tapResponse({
            next: resp => {
              this.patchState({ stationsData: resp.data });
            },
            error: () => {},
          })
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

        if (this.$nlConfig()) {
          if (userFactories.some(uf => uf.id === this.$nlConfig()!.factory.id)) {
            this.$config.set(this.$nlConfig()!);
          } else {
            this._lsStore.removeNeckLabelConfig();
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
        return this._stationApiSvc.stationsGet(factoryId, <StationRole>'NeckLabel').pipe(
          tapResponse({
            next: resp => this.patchState({ stationsData: resp.data }),
            error: () => {},
          }),
        );
      }),
    ),
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
