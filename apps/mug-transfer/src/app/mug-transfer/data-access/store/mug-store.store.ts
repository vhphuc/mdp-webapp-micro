import { Injectable, signal } from '@angular/core';
import { ComponentStore, OnStoreInit, tapResponse } from '@ngrx/component-store';
import { MugScanItemApi } from '../model/api/mug-api';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { MugApiService } from '../api/mug-api.service';
import { MugPickScanCode, MugPrintScanCode } from '../model/ui/scan-code';
import { MugStepGroup } from '../model/api/enum/mug-step-group';

export interface MugState {
  item: MugScanItemApi.Response['scanningOrderDetailUnit'] | null;
  controlError: ErrorResult | null;
}

const initialState: MugState = {
  item: null,
  controlError: null,
};

@Injectable()
export class MugStore extends ComponentStore<MugState> implements OnStoreInit {
  $currStep = signal<'scan-item' | 'confirm-print' | 'scan-mug-bin' | 'confirm-pick' | 'scan-next-item'>('scan-item');
  $mugConfig = toSignal(this._lsStore.mugConfig$);

  constructor(
    private readonly _mugApiSvc: MugApiService,
    private readonly _lsStore: LocalStorageStore
  ) {
    super(initialState);
  }

  ngrxOnStoreInit() {
    this.onResetScan();
  }

  readonly onResetScan = this.effect<never>(
    pipe(
      switchMap(() => this.select(s => s.item)),
      filter(item => !item),
      tap(() => {
        this.patchState({ controlError: null });
        this.$currStep.set('scan-item');
      })
    )
  );

  readonly scanItem = this.effect<{ barcode: string }>(
    pipe(
      switchMap(({ barcode }) => {
        const factoryId = this.$mugConfig()!.factory.id;
        const stationId = this.$mugConfig()!.station.id;
        return this._mugApiSvc.scanItem(barcode, factoryId, stationId).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.patchState({ item: resp.data.scanningOrderDetailUnit, controlError: null });
                switch (resp.data.groupType) {
                  case MugStepGroup.ConfirmPick:
                    this.$currStep.set('scan-mug-bin');
                    break;
                  case MugStepGroup.ConfirmPrint:
                    this.$currStep.set('confirm-print');
                    break;
                }
              }
            },
            (error: ErrorResult) => {
              this.patchState({ controlError: error });
            }
          )
        );
      })
    )
  );

  readonly scanMugPrint = this.effect<{ actionBarcode: MugPrintScanCode }>(
    pipe(
      switchMap(({ actionBarcode }) => {
        const factoryId = this.$mugConfig()!.factory.id;
        const stationId = this.$mugConfig()!.station.id;
        const barcode = this.selectSignal(s => s.item!.barcode)();
        return this._mugApiSvc.scanMugPrint(barcode, factoryId, stationId, { actionBarcode }).pipe(
          tapResponse(
            resp => {
              if (actionBarcode === MugPrintScanCode.Reject) {
                this.$currStep.set('scan-next-item');
              } else if (actionBarcode === MugPrintScanCode.Accept) {
                this.$currStep.set('scan-mug-bin');
              }
              this.patchState(s => {
                s.item!.printScannedCode = actionBarcode;
                return { ...s };
              });
            },
            (error: ErrorResult) => {
              this.patchState({ controlError: error });
            }
          )
        );
      })
    )
  );

  readonly scanMugPick = this.effect<{ pickActionBarcode: MugPickScanCode }>(
    pipe(
      switchMap(({ pickActionBarcode }) => {
        const factoryId = this.$mugConfig()!.factory.id;
        const stationId = this.$mugConfig()!.station.id;
        const barcode = this.selectSignal(s => s.item!.barcode)();
        const binId = this.selectSignal(s => s.item!.binId)();
        return this._mugApiSvc.scanMugPick(barcode, factoryId, stationId, { binId, pickActionBarcode }).pipe(
          tapResponse(
            _ => {
              if (pickActionBarcode === MugPickScanCode.Accept) {
                this.$currStep.set('scan-next-item');
              } else {
                this.patchState({ controlError: { errorKey: 'MUG.MUG_REJECTED' } });
                this.$currStep.set('scan-mug-bin');
              }
              this.patchState(s => {
                s.item!.pickScannedCode = pickActionBarcode;
                return { ...s };
              });
            },
            (error: ErrorResult) => {
              this.patchState({ controlError: error });
            }
          )
        );
      })
    )
  );
}
