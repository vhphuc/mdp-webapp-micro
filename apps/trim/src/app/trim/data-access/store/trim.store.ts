import { inject, Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { pipe, switchMap } from 'rxjs';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { TrimConfirmApi, TrimScanItemApi } from '../model/trim-api';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { TrimApiService } from '../api/trim-api.service';
import { TrimType } from '../model/enum/trim-type';
import { TrimScanAction } from '../model/enum/trim-scan-action';
import { TrimAppColor } from '../model/enum/trim-app-color';
import { cloneDeep } from 'lodash-es';
import { TranslateStore } from '@shared/data-access/store/translate.store';

export interface TrimState {
  item: TrimScanItemApi.Response | null;

  controlError: ErrorResult | null;
  confirmApiMsg: TrimConfirmApi.Response | null;
}

const initialState: TrimState = {
  item: null,
  controlError: null,
  confirmApiMsg: null,
};

@Injectable()
export class TrimStore extends ComponentStore<TrimState> {
  $currStep = this.selectSignal<'scan-item' | 'confirm-picked-trims' | 'confirm-hangtags' | 'confirm-sticker' | 'scan-next-item'>(s => {
    const item = s.item;
    if (!item) return 'scan-item';

    if (item.isTrimComplete && item.trims.length === 0) return 'scan-next-item';

    const trims = item.trims;
    const isVerifiedAll = trims.every(
      trim => trim.verifiedBarcode !== null && !(trim.isRequired && trim.verifiedBarcode.action === TrimScanAction.Reject)
    );
    if (!isVerifiedAll) return 'confirm-picked-trims';

    const acceptedTrims = trims.filter(trim => trim.verifiedBarcode!.action === TrimScanAction.Accept);

    const acceptedHangtags = acceptedTrims.filter(trim => trim.trimType === TrimType.Hangtag);
    if (acceptedHangtags.some(trim => trim.confirmedBarcode === null)) return 'confirm-hangtags';

    const stickers = acceptedTrims.filter(trim => trim.trimType === TrimType.Sticker);
    if (stickers.some(trim => trim.confirmedBarcode === null)) return 'confirm-sticker';

    if (acceptedTrims.every(trim => trim.confirmedBarcode! !== null)) return 'scan-next-item';

    return 'scan-item';
  });
  $trimConfig = toSignal(this._lsStore.trimConfig$);
  translateStore = inject(TranslateStore);

  constructor(
    private readonly _trimApiSvc: TrimApiService,
    private readonly _lsStore: LocalStorageStore
  ) {
    super(initialState);
  }

  readonly scanItem = this.effect<{ barcode: string }>(
    pipe(
      switchMap(({ barcode }) => {
        const factoryId = this.$trimConfig()!.factory.id;
        const stationId = this.$trimConfig()!.station.id;
        return this._trimApiSvc.scanItem(barcode, factoryId, stationId).pipe(
          tapResponse(
            resp => {
              if (!resp.data) return;

              // Assign index per trimType group
              const groupIndices: { [key: number]: number } = {};
              resp.data.trims.forEach((trim) => {
                if (groupIndices[trim.trimType] === undefined) groupIndices[trim.trimType] = 1;
                trim.trimTypeIndex = groupIndices[trim.trimType];
                groupIndices[trim.trimType] += 1;
              });

              if (resp.data.isTrimComplete) {
                const respData = {
                  isTrimComplete: true,
                  messageKey: resp.data.messageKey,
                  messageParams: resp.data.messageParams,
                  color: TrimAppColor.Green,
                };
                this.customMessage(respData);
                this.patchState({
                  item: resp.data,
                  controlError: null,
                  confirmApiMsg: {
                    isTrimComplete: true,
                    messageKey: respData.messageKey,
                    messageParams: respData.messageParams,
                    color: TrimAppColor.Green,
                  },
                });
              } else {
                this.patchState({ item: resp.data, controlError: null, confirmApiMsg: null });
              }
            },
            (error: ErrorResult) => {
              this.patchState({ controlError: error, item: null });
            }
          )
        );
      })
    )
  );

  readonly confirm = this.effect<never>(
    pipe(
      switchMap(() => {
        const barcode = this.selectSignal(s => s.item!.orderDetailUnit.barcode)();
        const trims = cloneDeep(this.selectSignal(s => s.item!.trims)());
        const factoryId = this.$trimConfig()!.factory.id;
        const stationId = this.$trimConfig()!.station.id;
        return this._trimApiSvc.confirm(barcode, factoryId, stationId, { trims }).pipe(
          tapResponse({
            next: resp => {
              if (!resp.data) return;
              if (resp.data.color === TrimAppColor.Red) {
                this.patchState({
                  item: null,
                  controlError: {
                    errorKey: resp.data.messageKey,
                    paramError: resp.data.messageParams,
                  },
                });
              } else if (resp.data.color === TrimAppColor.Green) {
                this.customMessage(resp.data);
                this.patchState({ confirmApiMsg: resp.data });
              }
            },
            error: () => {},
          })
        );
      })
    )
  );

  customMessage(data: TrimConfirmApi.Response) {
    if (
      data.messageKey === 'SERVER_SUCCESS_BAG_ITEM_NO_MERGE_BIN_SEND_TO_MERGE_STATION' ||
      data.messageKey === 'SERVER_SUCCESS_BAG_ITEM_NO_PRIORITY_MERGE_BIN_SEND_TO_MERGE_STATION'
    ) {
      const orderQty = Number(data.messageParams['orderQty']);
      const qtyFleece = Number(data.messageParams['qtyFleece']);
      const qtyMug = Number(data.messageParams['qtyMug']);
      const qtyShirt = Number(data.messageParams['qtyShirt']);
      const qtySticker = Number(data.messageParams['qtySticker']);
      const qtyDtfAccessory = Number(data.messageParams['qtyDtfAccessory']);
      const qtySock = Number(data.messageParams['qtySock']);
      const qtyHeavyweightJacket = Number(data.messageParams['qtyHeavyweightJacket']);
      const qtyPulloverJacket = Number(data.messageParams['qtyPulloverJacket']);
      const qtySatinJacket = Number(data.messageParams['qtySatinJacket']);
      let items = [
        { value: qtyShirt, key: 'SERVER_ERROR.SHIRT' },
        { value: qtyMug, key: 'SERVER_ERROR.MUGS' },
        { value: qtyFleece, key: 'SERVER_ERROR.FLEECE' },
        { value: qtySticker, key: 'SERVER_ERROR.STICKER' },
        { value: qtyDtfAccessory, key: qtyDtfAccessory<1?'DTF_ACCESSORY':'DTF_ACCESSORIES' },
        { value: qtySock, key: 'SERVER_ERROR.SOCK' },
        { value: qtyHeavyweightJacket, key: 'SERVER_ERROR.HEAVYWEIGHT_JACKET' },
        { value: qtyPulloverJacket, key: 'SERVER_ERROR.PULLOVER_JACKET' },
        { value: qtySatinJacket, key: 'SERVER_ERROR.SATIN_JACKET' },
      ];
      items = items.filter(x => x.value > 0);
      let msg = this.translateStore.instant(data.messageKey, data.messageParams) + ' ';
      if (orderQty > 0) {
        items.forEach((x, indx) => {
          if (x.value > 0) {
            let itemTranslate = this.translateStore.instant(x.key).toLowerCase();
            if (x.value > 1 && x.key !== 'DTF_ACCESSORY' && x.key !== 'DTF_ACCESSORIES') {
              itemTranslate += 's';
            }
            msg += `${x.value} ${itemTranslate}`;
            if (items.length > 1 && indx < items.length - 1) {
              msg += ', ';
            }
          }
        });
      }
      data.messageKey = msg;
    }
  }
}
