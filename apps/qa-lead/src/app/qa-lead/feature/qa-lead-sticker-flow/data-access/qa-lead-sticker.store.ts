import { Injectable, signal, Signal } from '@angular/core';
import { ComponentStore, OnStoreInit, tapResponse } from '@ngrx/component-store';
import {
  QaStickerScanSheetApi,
  QaStickerStepResponse,
} from './qa-sticker-api';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { toSignal } from '@angular/core/rxjs-interop';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { NzModalService } from 'ng-zorro-antd/modal';
import { filter, pipe, switchMap, tap } from 'rxjs';
import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { openPrintingPopup } from '@shared/ui/component/printing-popup';
import { QaColor } from 'src/app/qa-lead/data-access/model/common/enum/qa-color';
import { QaLeadRejectReviewBarcode } from 'src/app/qa-lead/data-access/model/common/type/qa-lead-reject-review-barcode';
import { StepFinalCustomModel } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { TranslateStore } from '@shared/data-access/store/translate.store';
import { QaStickerApiService } from './qa-sticker-api.service';
import { findStep, findStkGrp } from 'src/app/qa-lead/util/util';
import QaStickerStepStickerGroup = QaStickerScanSheetApi.QaStickerStepStickerGroup;
import QaStickerStepPackage = QaStickerScanSheetApi.QaStickerStepPackage;
import QaStickerStepFinal = QaStickerScanSheetApi.QaStickerStepFinal;

export interface QaLeadStickerState {
  sheet: QaStickerScanSheetApi.Response | null;

  controlError: ErrorResult | null;
  apiStepMsg: Pick<QaStickerStepResponse, 'message' | 'messageParams' | 'messageColor'> | null;
}

const initialState: QaLeadStickerState = {
  sheet: null,

  controlError: null,
  apiStepMsg: null,
};

@Injectable()
export class QaLeadStickerStore extends ComponentStore<QaLeadStickerState> implements OnStoreInit {
  $currentScanStep: Signal<QaStickerScanSheetApi.Response['steps'][number] | null> = this.selectSignal(s => {
    if (!s.sheet) return null;
    if (s.apiStepMsg) return null;
    if (s.sheet.shippingAlert) return null;
    return s.sheet.steps.find(step => !step.isViewOnly && !step.isIgnoreScan && !step.isScanned) ?? null;
  });

  $currStickerGroup = signal<QaStickerStepStickerGroup | null>(null);

  $qaLeadConfig = toSignal(this._lsStore.qaLeadConfig$);
  constructor(
    private readonly _qaStickerApiSvc: QaStickerApiService,
    private readonly _lsStore: LocalStorageStore,
    private readonly _nzModalSvc: NzModalService,
    private readonly _i18n: TranslateStore
  ) {
    super(initialState);
  }

  ngrxOnStoreInit() {
    this.#cleanUpWhenReset();
  }

  readonly #cleanUpWhenReset = this.effect<never>(
    pipe(
      switchMap(() => this.select(s => s.sheet)),
      filter(sheet => !sheet),
      tap(() => {
        this.$currStickerGroup.set(null);
      })
    )
  );

  readonly scanSheet = this.effect<{ barcode: string }>(
    pipe(
      switchMap(({ barcode }) =>
        this._qaStickerApiSvc.scanSheet(barcode, this.$qaLeadConfig()!.factory.id, this.$qaLeadConfig()!.station.id).pipe(
          tapResponse({
            next: resp => {
              this.patchState({ controlError: null, apiStepMsg: null });
              if (resp.data) {
                // re-assign variable for easier usage
                resp.data.isAllowChangeCoo = resp.data.steps.find(
                  (st): st is QaStickerStepStickerGroup => st.groupType === QaStepGroup.StickerGroup
                )!.scanningStickerGroup.isAllowChangeCoo;
                resp.data.sheetBarcode = barcode.replace('\\', '');

                // auto jump to confirm reject
                const confirmRejectStickerGroup = resp.data.steps.find(
                  (st): st is QaStickerStepStickerGroup =>
                    st.groupType === QaStepGroup.StickerGroup && st.scanningStickerGroup.isRejectWithoutConfirming
                );
                if (confirmRejectStickerGroup) {
                  this.$currStickerGroup.set(confirmRejectStickerGroup);
                }

                const stepFinal = (resp.data.steps.find(
                  step => !step.isViewOnly && !step.isIgnoreScan && !step.isScanned && step.groupType === QaStepGroup.Final
                ) ?? null) as QaStickerStepFinal | null;
                this.customMessage(stepFinal);

                this.patchState({ sheet: resp.data });

                if (resp.data.shippingAlert) {
                  this.patchState({
                    controlError: {
                      errorKey: 'QA.SHIPPING_ALERT_{shippingAlert}',
                      paramError: { shippingAlert: resp.data.shippingAlert },
                    },
                  });
                }
              }
            },
            error: (err: ErrorResult) => {
              this.patchState({ sheet: null, apiStepMsg: null, controlError: err });
            },
          })
        )
      )
    )
  );

  readonly verifyStickerGrp = this.effect<{ verifyBarcode: string }>(
    pipe(
      tap(() => this.patchState({ controlError: null })),
      switchMap(({ verifyBarcode }) => {
        const sheetCode = this.selectSignal(s => s.sheet!.sheetBarcode)();
        const factoryId = this.$qaLeadConfig()!.factory.id;
        const stationId = this.$qaLeadConfig()!.station.id;
        const groupBarcode = this.$currStickerGroup()!.scanningStickerGroup.barcode;
        return this._qaStickerApiSvc.verifyStickerGroup(sheetCode, groupBarcode, { factoryId, stationId, verifyBarcode }).pipe(
          tapResponse({
            next: resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                this.patchState(s => {
                  const stickerGrp = s.sheet!.steps.find(findStkGrp(groupBarcode)) as QaStickerStepStickerGroup;
                  stickerGrp.scanningStickerGroup.attribute.scanAction = stickerGrp.scanningStickerGroup.attribute.reviewBarcodes.find(
                    rb => rb.barcode === verifyBarcode
                  )!.type;
                  if (resp.data!.isRejectWithoutConfirming) {
                    stickerGrp.scanningStickerGroup.isRejectWithoutConfirming = true;
                  } else {
                    stickerGrp.isScanned = true;
                    this.$currStickerGroup.set(null);
                  }
                  return { ...s };
                });

                if (!resp.data.allowNextStep && !resp.data.isRejectWithoutConfirming) {
                  this.setApiStepMsg(resp.data);
                }
              }
            },
            error: (err: ErrorResult) => {
              this.patchState({ controlError: err });
            },
          })
        );
      })
    )
  );

  readonly confirmReject = this.effect<{ confirmBarcode: QaLeadRejectReviewBarcode }>(
    pipe(
      tap(() => this.patchState({ controlError: null })),
      switchMap(({ confirmBarcode }) => {
        const factoryId = this.$qaLeadConfig()!.factory.id;
        const stationId = this.$qaLeadConfig()!.station.id;
        const sheetCode = this.selectSignal(s => s.sheet!.sheetBarcode)();
        const barcodeGroup = this.$currStickerGroup()!.scanningStickerGroup.barcode;
        return this._qaStickerApiSvc
          .confirmRejectStickerGroup(sheetCode, { factoryId, stationId, barcodeGroup, confirmBarcode: confirmBarcode.barcode })
          .pipe(
            tapResponse(
              resp => {
                if (resp.data) {
                  this.updateFlowModelFromStepResponse(resp.data);

                  if (!resp.data.allowNextStep) {
                    this.patchState(s => {
                      const stickerGrp = s.sheet!.steps.find(findStkGrp(barcodeGroup))! as QaStickerStepStickerGroup;
                      stickerGrp.isScanned = true;
                      return { ...s };
                    });
                    this.$currStickerGroup.set(null);
                  }

                  if (resp.data.message === 'SERVER_SUCCESS_CONFIRM_REJECT_SUCCESS') {
                    if (resp.data.additionalMessage) {
                      this.setApiStepMsg({
                        message: resp.data.additionalMessage,
                        messageColor: resp.data.messageColor,
                        messageParams: resp.data.messageParams,
                      });
                    } else {
                      this.setApiStepMsg({
                        message: 'QA.{rejectBarcodeDescription}_ACCEPTED',
                        messageColor: QaColor.Green,
                        messageParams: { rejectBarcodeDescription: confirmBarcode.description },
                      });
                    }
                  } else {
                    this.setApiStepMsg(resp.data);
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

  readonly scanCoo = this.effect<{ coo: QaStickerScanSheetApi.Response['coos'][number] }>(
    pipe(
      tap(() => this.patchState({ controlError: null })),
      switchMap(({ coo }) => {
        const factoryId = this.$qaLeadConfig()!.factory.id;
        const stationId = this.$qaLeadConfig()!.station.id;
        const sheetCode = this.selectSignal(s => s.sheet!.sheetBarcode)();
        return this._qaStickerApiSvc.scanCoo(sheetCode, { factoryId, stationId, cooId: coo.id }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    s.sheet!.steps.find(findStep(QaStepGroup.Coo))!.isScanned = true;
                    s.sheet!.coo = coo;
                    s.sheet!.isAllowChangeCoo = true;
                    return { ...s };
                  });
                } else {
                  this.setApiStepMsg(resp.data);
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

  readonly scanPackage = this.effect<{ scannedPackage: QaStickerStepPackage['scanningPackages']['packages'][number] }>(
    pipe(
      tap(() => this.patchState({ controlError: null })),
      switchMap(({ scannedPackage }) => {
        const factoryId = this.$qaLeadConfig()!.factory.id;
        const stationId = this.$qaLeadConfig()!.station.id;
        const labelPrinterId = this.$qaLeadConfig()!.labelPrinter.id;
        const sheetCode = this.selectSignal(s => s.sheet!.sheetBarcode)();
        return this._qaStickerApiSvc.scanPackage(sheetCode, { factoryId, stationId, labelPrinterId, packageId: scannedPackage.id }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);
                if (resp.data.finalStepCustomModel) {
                  this.updateFinalStepModel(resp.data.finalStepCustomModel);
                }

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    const stepPackage = s.sheet!.steps.find(findStep(QaStepGroup.Package))! as QaStickerStepPackage;
                    stepPackage.scanningPackages.scannedPackage = scannedPackage;
                    stepPackage.isScanned = true;
                    return { ...s };
                  });
                } else {
                  this.setApiStepMsg(resp.data);
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

  readonly printShipLabel = this.effect<never>(
    pipe(
      tap(() => this.patchState({ controlError: null })),
      switchMap(() => {
        const printingModalRef = openPrintingPopup(this._nzModalSvc, { key: 'QA.PRINTING_SHIP_LABEL' });
        const factoryId = this.$qaLeadConfig()!.factory.id;
        const stationId = this.$qaLeadConfig()!.station.id;
        const labelPrinterId = this.$qaLeadConfig()!.labelPrinter.id;
        const laserPrinterId = this.$qaLeadConfig()!.laserPrinter.id;
        const sheetCode = this.selectSignal(s => s.sheet!.sheetBarcode)();
        return this._qaStickerApiSvc.printShipLabel(sheetCode, { factoryId, stationId, labelPrinterId, laserPrinterId }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                if (!resp.data.allowNextStep) {
                  this.setApiStepMsg(resp.data);
                }
              }
              setTimeout(() => printingModalRef.destroy(), 2000);
            },
            (error: ErrorResult) => {
              this.setApiStepMsg({
                message: error.errorKey,
                messageColor: QaColor.Red,
                messageParams: error.paramError ?? {},
              });
              printingModalRef.destroy();
            }
          )
        );
      })
    )
  );

  readonly scanTrackingNumber = this.effect<{ trackingNumber: string }>(
    pipe(
      tap(() => this.patchState({ controlError: null })),
      switchMap(({ trackingNumber }) => {
        const factoryId = this.$qaLeadConfig()!.factory.id;
        const stationId = this.$qaLeadConfig()!.station.id;
        const sheetCode = this.selectSignal(s => s.sheet!.sheetBarcode)();
        return this._qaStickerApiSvc.scanTrackingNumber(sheetCode, { factoryId, stationId, trackingNumber }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    s.sheet!.isAllowChangeCoo = false;
                    s.sheet!.steps.find(findStep(QaStepGroup.TrackingNumber))!.isScanned = true;
                    return { ...s };
                  });
                } else {
                  this.setApiStepMsg(resp.data);
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

  readonly setApiStepMsg = this.updater(
    (s, apiStepMsg: Pick<QaStickerStepResponse, 'message' | 'messageColor' | 'messageParams'> | null) => {
      if (!apiStepMsg) {
        s.apiStepMsg = null;
      } else {
        const { message, messageParams, messageColor } = apiStepMsg;
        s.apiStepMsg = { message, messageColor, messageParams };
      }
      return { ...s };
    }
  );

  readonly updateFlowModelFromStepResponse = this.updater((s, stepResponse: QaStickerStepResponse) => {
    const { unitStatus, statusDescription } = stepResponse;
    const sheet = s.sheet!;
    sheet.status = unitStatus;
    sheet.statusDescription = statusDescription;
    return { ...s };
  });
  readonly updateFinalStepModel = this.updater((s, customModel: NonNullable<StepFinalCustomModel['finalStepCustomModel']>) => {
    const messages = customModel.customFinalMessages;
    const params = customModel.additionalParams;
    const stepFinal = s.sheet!.steps.find(st => st.groupType === QaStepGroup.Final)! as QaStickerStepFinal;
    if (messages?.length) stepFinal.messages = messages;
    if (params && Object.entries(params).length) {
      stepFinal.finalStepMessageParams = {};
      for (const [key, value] of Object.entries(params)) {
        stepFinal.finalStepMessageParams[key] = value;
      }
    }
    this.customMessage(stepFinal);
    return { ...s };
  });

  customMessage(data: QaStickerStepFinal | null) {
    if (!data) return;
    if (!data.messages) return;

    const SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH = data.messages.find(
      msg =>
        msg.message === 'SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH' ||
        msg.message === 'SERVER_ERROR_NO_AVAILABLE_PRIORITY_MERGE_BIN_LARGE_ENOUGH'
    );
    if (SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH) {
      const orderQty = Number(data.finalStepMessageParams['orderQty']);
      const qtyFleece = Number(data.finalStepMessageParams['qtyFleece']);
      const qtyMug = Number(data.finalStepMessageParams['qtyMug']);
      const qtyShirt = Number(data.finalStepMessageParams['qtyShirt']);
      const qtySticker = Number(data.finalStepMessageParams['qtySticker']);
      const qtyDtfAccessory = Number(data.finalStepMessageParams['qtyDtfAccessory']);
      const qtySock = Number(data.finalStepMessageParams['qtySock']);
      const qtyHeavyweightJacket = Number(data.finalStepMessageParams['qtyHeavyweightJacket']);
      const qtyPulloverJacket = Number(data.finalStepMessageParams['qtyPulloverJacket']);
      const qtySatinJacket = Number(data.finalStepMessageParams['qtySatinJacket']);
      let items = [
        { value: qtyShirt, key: 'SERVER_ERROR.SHIRT' },
        { value: qtyMug, key: 'SERVER_ERROR.MUGS' },
        { value: qtyFleece, key: 'SERVER_ERROR.FLEECE' },
        { value: qtySticker, key: 'SERVER_ERROR.STICKER' },
        { value: qtyDtfAccessory, key: qtyDtfAccessory<=1?'DTF_ACCESSORY':'DTF_ACCESSORIES' },
        { value: qtySock, key: 'SERVER_ERROR.SOCK' },
        { value: qtyHeavyweightJacket, key: 'SERVER_ERROR.HEAVYWEIGHT_JACKET' },
        { value: qtyPulloverJacket, key: 'SERVER_ERROR.PULLOVER_JACKET' },
        { value: qtySatinJacket, key: 'SERVER_ERROR.SATIN_JACKET' },
      ];
      items = items.filter(x => x.value > 0);
      let errorMsg = this._i18n.instant(SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH.message, data.finalStepMessageParams) + ' ';
      if (orderQty > 0) {
        items.forEach((x, idx) => {
          let itemTranslate = this._i18n.instant(x.key).toLowerCase();
          if (x.value > 1 && x.key !== 'DTF_ACCESSORY' && x.key !== 'DTF_ACCESSORIES') {
            itemTranslate += 's';
          }
          errorMsg += `${x.value} ${itemTranslate}`;
          if (idx < items.length - 1) {
            errorMsg += ', ';
          }
        });
        SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH.message = errorMsg;
      }
    }
  }
}
