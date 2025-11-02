import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { exhaustMap, pipe, switchMap, tap } from 'rxjs';
import { ENeckLabelType, NeckLabelScanAttributeApi, NeckLabelScanUnitApi } from '../model/api/neck-label';
import { NeckLabelApiService } from '../api/neck-label-api.service';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { NeckLabelStep } from '../model/ui/neck-label-step';
import { NeckLabelScanAction } from '../model/api/enum/neck-label-scan-action';
import { ItemTransitionStatus, ItemTransitionStatusMap } from '@shared/data-access/model/api/enum/item-transition-status';

export interface NeckLabelState {
  scanItem: NeckLabelScanUnitApi.Response | null;
  scanMessage: { key: string; params?: ErrorResult['paramError']; color: 'red' | 'green'; apiError?: boolean } | null;
}

const initialState: NeckLabelState = {
  scanItem: null,
  scanMessage: null,
};

@Injectable()
export class NeckLabelStore extends ComponentStore<NeckLabelState> {
  $currStep = this.selectSignal(s => {
    const scanItem = s.scanItem;
    if (!scanItem) return null;
    if (s.scanMessage?.apiError) return NeckLabelStep.ScanNextItem;
    if (scanItem.neckLabelBinId && scanItem.isRejectedNeckLabel) return NeckLabelStep.ScanNextItem;
    if (scanItem.neckLabelBinId && !scanItem.isAcceptedNeckLabel) return NeckLabelStep.RegularAttribute;
    if (scanItem.patchBinId && !scanItem.isAcceptedPatch) return NeckLabelStep.RegularAttribute;
    if (scanItem.dtfNeckLabelStep && !scanItem.dtfNeckLabelStep.isIgnoreScan && !scanItem.dtfNeckLabelStep.isScanned)
      return NeckLabelStep.DtfNecklabel;

    return NeckLabelStep.ScanNextItem;
  });

  $acceptBarcodes = this.selectSignal(s => {
    const scanItem = s.scanItem;
    if (!scanItem) return [];
    const barcodes = [];
    if (scanItem.patchBinId) barcodes.push({ code: scanItem.acceptPatchCode, type: ENeckLabelType.Patch });
    if (scanItem.neckLabelBinId) barcodes.push({ code: scanItem.acceptNLCode, type: ENeckLabelType.NeckLabel });
    return barcodes;
  });

  constructor(
    private readonly _nApiSvc: NeckLabelApiService,
    private readonly _lsStore: LocalStorageStore
  ) {
    super(initialState);
  }

  readonly scanItem = this.effect<string>(
    pipe(
      tap(() => this.patchState({ scanMessage: null })),
      switchMap(barcode => {
        const config = this._lsStore.getNeckLabelConfig()!;
        return this._nApiSvc.scanItem(barcode, config.factory.id, config.station.id).pipe(
          tapResponse({
            next: resp => {
              this.patchState({ scanItem: resp.data });
            },
            error: (error: ErrorResult) => {
              this.patchState({
                scanItem: null,
                scanMessage: { key: error.errorKey, params: error.paramError, color: 'red' },
              });
            },
          })
        );
      })
    )
  );

  readonly scanAcceptUnitAttribute = this.effect<{ code: string; type: ENeckLabelType }>($params =>
    $params.pipe(
      tap(() => this.patchState({ scanMessage: null })),
      switchMap(acceptBarcode => {
        const config = this._lsStore.getNeckLabelConfig()!;
        const $barcode = this.selectSignal(s => s.scanItem!.barcode);
        return this._nApiSvc
          .scanAcceptRegularAttribute({
            factoryId: config.factory.id,
            stationId: config.station.id,
            barcode: $barcode(),
            type: acceptBarcode.type,
          })
          .pipe(
            tapResponse({
              next: resp => {
                if (!resp.data) return;
                this.updateStateAfterAccept({ attrType: acceptBarcode.type, acceptAttributeResult: resp.data });
              },
              error: (error: ErrorResult) => {
                this.patchState({
                  scanMessage: { key: error.errorKey, params: error.paramError, color: 'red' },
                });
              },
            })
          );
      })
    )
  );

  scanRejectUnitAttribute(type: ENeckLabelType) {
    this.patchState({ scanMessage: null });

    const config = this._lsStore.getNeckLabelConfig()!;
    const $barcode = this.selectSignal(s => s.scanItem!.barcode);
    this._nApiSvc
      .scanRejectRegularAttribute({
        barcode: $barcode(),
        factoryId: config.factory.id,
        stationId: config.station.id,
        type: type,
      })
      .subscribe({
        next: resp => {
          if (!resp.data) return;
          this.updateStateAfterReject({ attrType: type, rejectAttributeResult: resp.data });
        },
        error: (error: ErrorResult) => {
          this.patchState({
            scanMessage: { key: error.errorKey, params: error.paramError, color: 'red' },
          });
        },
      });
  }

  readonly verifyDtfNeckLabel = this.effect<{ reviewBarcode: string }>(
    pipe(
      exhaustMap(({ reviewBarcode }) => {
        const config = this._lsStore.getNeckLabelConfig()!;
        const barcode = this.selectSignal(s => s.scanItem!.barcode)();
        return this._nApiSvc
          .verifyDtfNecklabel({
            factoryId: config.factory.id,
            stationId: config.station.id,
            barcode,
            reviewBarcode,
          })
          .pipe(
            tapResponse({
              next: resp => {
                this.patchState(s => {
                  s.scanItem!.dtfNeckLabelStep!.isScanned = true;
                  const rejectLabelBarcode = s.scanItem!.dtfNeckLabelStep!.rejectLabelBarcodes.find(lb => lb.barcode === reviewBarcode);
                  const verifyLabelBarcode = s.scanItem!.dtfNeckLabelStep!.verifyLabelBarcodes.find(lb => lb.barcode === reviewBarcode);
                  if (rejectLabelBarcode?.type === NeckLabelScanAction.DtfLabelMissing) {
                    s.scanItem!.status = ItemTransitionStatus.DtfLabelMissing;
                  }
                  if (rejectLabelBarcode?.type === NeckLabelScanAction.DtfLabelDamaged) {
                    s.scanItem!.status = ItemTransitionStatus.DtfLabelDamaged;
                  }
                  if (rejectLabelBarcode?.type === NeckLabelScanAction.DtfLabelWrong) {
                    s.scanItem!.status = ItemTransitionStatus.DtfLabelWrong;
                  }
                  if (verifyLabelBarcode?.type === NeckLabelScanAction.Reject) {
                    s.scanItem!.status = ItemTransitionStatus.DtfLabelRejected;
                  }
                  if (verifyLabelBarcode?.type === NeckLabelScanAction.Accept) {
                    s.scanItem!.status = ItemTransitionStatus.DtfLabelled;
                  }
                  s.scanItem!.statusName = ItemTransitionStatusMap.names.get(s.scanItem!.status)!;
                  s.scanMessage = {
                    key: resp.message,
                    params: resp.paramSuccess,
                    color: verifyLabelBarcode?.type === NeckLabelScanAction.Accept ? 'green' : 'red',
                  };
                  return { ...s };
                });
              },
              error: (err: ErrorResult) => {
                this.patchState({
                  scanMessage: { key: err.errorKey, params: err.paramError, color: 'red', apiError: true },
                });
              },
            })
          );
      })
    )
  );

  readonly updateStateAfterAccept = this.updater(
    (s, arg: { attrType: ENeckLabelType; acceptAttributeResult: NeckLabelScanAttributeApi.Response }) => {
      const scanItem = s.scanItem!;
      if (arg.attrType === ENeckLabelType.NeckLabel) {
        this.updateAcceptNeckLabel(s);
      } else if (arg.attrType === ENeckLabelType.Patch) {
        this.updateAcceptPatch(s);
      }

      if (scanItem.isSmartBatching) {
        if (arg.acceptAttributeResult.isLabelledAllCart && arg.acceptAttributeResult.isPrioritySmartBatching) {
          s.scanMessage = {
            key: 'CART_X1_SUCCESSFULLY_NECK_LABELLED_USE_TRANSFER_APP_TO_TRANSFER_THIS_CART_TO_PMPDS',
            params: { x1: arg.acceptAttributeResult.pickingCartName! },
            color: 'green',
          };
        } else if (arg.acceptAttributeResult.isLabelledAllCart) {
          if (arg.acceptAttributeResult.isQaPod) {
            s.scanMessage = {
              key: 'SERVER_SUCCESS_PICKING_CART_ACCEPTED_NECKLABEL_TO_QA',
              color: 'green',
              params: {
                cartName: arg.acceptAttributeResult.pickingCartName!,
                podName: arg.acceptAttributeResult.podName!,
              },
            };
          } else {
            // MDP-2665: Automated dropping feature - New Heat Transfer Neck Label Flow
            // If IsLabelledAllCart = true, then show Cart '<id>' Successfully Neck Labelled.\nSend to Print Station
            s.scanMessage = {
              key: 'SERVER_SUCCESS_PICKING_CART_ACCEPTED_NECKLABEL_TO_PRINT',
              color: 'green',
              params: {
                cartName: arg.acceptAttributeResult.pickingCartName!,
                podName: arg.acceptAttributeResult.podName!,
                machineName: arg.acceptAttributeResult.machineName!,
                machineType: arg.acceptAttributeResult.machineType!,
              },
            };
          }
        }
      }

      if (
        (scanItem.isAcceptedNeckLabel && scanItem.isAcceptedPatch) ||
        (!scanItem.patchBinId && scanItem.isAcceptedNeckLabel) ||
        (!scanItem.neckLabelBinId && scanItem.isAcceptedPatch)
      ) {
        scanItem.status = ItemTransitionStatus.Labeled;
        scanItem.statusName = ItemTransitionStatusMap.names.get(ItemTransitionStatus.Labeled)!;
      }
      return { ...s };
    }
  );

  updateAcceptNeckLabel(s: NeckLabelState) {
    const scanItem = s.scanItem!;

    scanItem.isAcceptedNeckLabel = true;

    if (scanItem.isAcceptedPatch || !scanItem.patchBinId) {
      if (!scanItem.dtfNeckLabelStep || scanItem.dtfNeckLabelStep.isIgnoreScan) {
        s.scanMessage = { key: 'SERVER_SUCCESS_ACCEPTED_NECKLABEL_TO_PRINT', color: 'green' };
        if (scanItem.isSmartBatching) {
          s.scanMessage = {
            key: 'SERVER_SUCCESS_SMART_BATCHING_ACCEPTED_NECKLABEL',
            color: 'green',
            params: { cartName: scanItem.pickingCartName },
          };
        }
      }
    } else {
      s.scanMessage = { key: 'SERVER_SUCCESS_ACCEPTED_NECKLABEL', color: 'green' };
    }
  }

  updateAcceptPatch(s: NeckLabelState) {
    const scanItem = s.scanItem!;

    scanItem.isAcceptedPatch = true;

    if (scanItem.isAcceptedNeckLabel || !scanItem.neckLabelBinId) {
      if (!scanItem.dtfNeckLabelStep || scanItem.dtfNeckLabelStep.isIgnoreScan) {
        s.scanMessage = { key: 'SERVER_SUCCESS_ACCEPTED_PATCH_TO_PRINT', color: 'green' };
        if (scanItem.isSmartBatching) {
          s.scanMessage = { key: 'SERVER_SUCCESS_ACCEPTED_PATCH', color: 'green' };
        }
      }
    } else {
      s.scanMessage = { key: 'SERVER_SUCCESS_ACCEPTED_PATCH', color: 'green' };
    }
  }

  readonly updateStateAfterReject = this.updater(
    (s, arg: { attrType: ENeckLabelType; rejectAttributeResult: NeckLabelScanAttributeApi.Response }) => {
      const scanItem = s.scanItem!;
      if (arg.attrType === ENeckLabelType.NeckLabel) {
        scanItem.isRejectedNeckLabel = true;

        if (scanItem.isSmartBatching) {
          if (arg.rejectAttributeResult.isAvailableCart) {
            s.scanMessage = {
              key: 'NECK_LABEL_REJECTED_GIVE_TO_PICK_LEAD_CART_X1_NO_ITEM_IN_CART_CART_IS_AVAILABLE',
              params: { x1: arg.rejectAttributeResult.pickingCartName! },
              color: 'red',
            };
          } else if (arg.rejectAttributeResult.isLabelledAllCart && arg.rejectAttributeResult.isPrioritySmartBatching) {
            s.scanMessage = {
              key: 'NECK_LABEL_REJECTED_GIVE_TO_PICK_LEAD_CART_X1_NO_ITEM_NEED_LABELLED_USE_TRANSFER_APP_TO_TRANSFER_THIS_CART_TO_PMPDS',
              params: { x1: arg.rejectAttributeResult.pickingCartName! },
              color: 'red',
            };
          } else if (arg.rejectAttributeResult.isLabelledAllCart) {
            if (arg.rejectAttributeResult.isQaPod) {
              s.scanMessage = {
                key: 'NECK_LABEL_REJECTED_GIVE_TO_PICK_LEAD_CART_X1_NO_ITEM_NEED_LABELLED_SEND_TO_POD',
                params: { 
                  x1: arg.rejectAttributeResult.pickingCartName!,
                  podName: arg.rejectAttributeResult.podName!,
                 },
                color: 'red',
              };
            } else {
              s.scanMessage = {
                key: 'NECK_LABEL_REJECTED_GIVE_TO_PICK_LEAD_CART_X1_NO_ITEM_NEED_LABELLED_SEND_TO_PRINT_STATION',
                params: { x1: arg.rejectAttributeResult.pickingCartName! },
                color: 'red',
              };
            }
          } else {
            s.scanMessage = { key: 'NECK_LABEL_REJECTED_GIVE_TO_PICK_LEAD', color: 'red' };
          }
        } else {
          s.scanMessage = { key: 'SERVER_SUCCESS_REJECTED_NECKLABEL', color: 'red' };
        }
      }

      scanItem.statusName = 'Neck Label Rejected';

      return { ...s };
    }
  );
}
