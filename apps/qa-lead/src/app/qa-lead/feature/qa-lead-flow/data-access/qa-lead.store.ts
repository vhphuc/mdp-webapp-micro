import { Injectable, signal, Signal } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { pipe, switchMap, tap } from 'rxjs';
import { ErrorResult } from '@shared/data-access/model/api/response';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { QaLeadApiService } from './qa-lead-api.service';
import {
  QaReviewBarcode,
  QaScanItemApi,
  QaScanStepApiResponse,
  QaScanVerifyLocationApi,
  StepFinalCustomModel,
} from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { QaColor } from 'src/app/qa-lead/data-access/model/common/enum/qa-color';
import { QaPrintScanAction } from 'src/app/qa-lead/data-access/model/common/enum/qa-print-scan-action';
import { QaLeadResetLocationType } from 'src/app/qa-lead/data-access/model/common/enum/qa-lead-reset-location-type';
import { openPrintingPopup } from '@shared/ui/component/printing-popup';
import { NzModalService } from 'ng-zorro-antd/modal';
import { QaLeadRejectReviewBarcode } from 'src/app/qa-lead/data-access/model/common/type/qa-lead-reject-review-barcode';
import { QaCoo } from 'src/app/qa-lead/data-access/model/common/type/qa-coo';
import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { QaApiService } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api.service';
import { TranslateStore } from '@shared/data-access/store/translate.store';
import QaScanStep = QaScanItemApi.QaScanStep;
import ScanningOrderDetailUnitAttribute = QaScanItemApi.ScanningOrderDetailUnitAttribute;

export type QaLeadApiStepMsg = Pick<QaScanStepApiResponse, 'message' | 'messageParams' | 'messageColor'>;

export interface QaLeadState {
  scanItemResp: QaScanItemApi.Response | null;

  controlError: ErrorResult | null;
  apiStepMsg: QaLeadApiStepMsg | null;
  resetStatusApiStepMsg: QaLeadApiStepMsg | null;
}

const initialState: QaLeadState = {
  scanItemResp: null,

  controlError: null,
  apiStepMsg: null,
  resetStatusApiStepMsg: null,
};

@Injectable()
export class QaLeadStore extends ComponentStore<QaLeadState> {
  $currentScanStep: Signal<QaScanStep | null> = this.selectSignal(s => {
    if (!s.scanItemResp) return null;
    if (s.apiStepMsg) return null;
    if (s.scanItemResp.shippingAlert) return null;
    return s.scanItemResp.steps.find(step => !step.isViewOnly && !step.isIgnoreScan && !step.isScanned) ?? null;
  });

  $controlError = this.selectSignal(s => s.controlError);
  $apiStepMsg = this.selectSignal(s => s.apiStepMsg);

  factory = this._lsStore.selectSignal(s => s.qaLeadConfig?.factory);
  station = this._lsStore.selectSignal(s => s.qaLeadConfig?.station);
  labelPrinter = this._lsStore.selectSignal(s => s.qaLeadConfig?.labelPrinter);
  ticketLabelPrinter = this._lsStore.selectSignal(s => s.qaLeadConfig?.ticketLabelPrinter);
  laserPrinter = this._lsStore.selectSignal(s => s.qaLeadConfig?.laserPrinter);
  $scanItemResp = this.selectSignal(s => s.scanItemResp);

  $showRemoveShipAlert = signal(false);
  isNotRequiredCI = false;
  $currBarcode = this.selectSignal(
    s => s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit)?.scanningOrderDetailUnit!.barcode
  );

  $isPrintCustomInsert = this.selectSignal(s => s.scanItemResp?.isPrintCustomInsert ?? false);

  $currentOduStepScans: Signal<ScanningOrderDetailUnitAttribute[]> = this.selectSignal(s => {
    const currStep = this.$currentScanStep();
    if (currStep?.groupType !== QaStepGroup.OrderDetailUnit && currStep?.groupType !== QaStepGroup.DtfNeckLabelUnit) {
      return [];
    }

    const attributes = currStep.scanningOrderDetailUnit!.attributes.filter(attr => !(!attr.isReadyForQa && attr.scanAction === null));
    const additionalAttributes = currStep.scanningOrderDetailUnit!.additionalAttributes.filter(
      aAttr => !(!aAttr.isReadyForQa && aAttr.scanAction === null)
    );

    if (attributes.some(attr => attr.isReadyForQa && attr.scanAction === null)) {
      // only 1 attribute will be isReadyForQa = true at a time
      return attributes.filter(attr => attr.isReadyForQa && attr.scanAction === null);
    }

    // is there attribute scanned locally, not send api yet
    const isAttributeScannedLocally = attributes.some(attr => attr.scanAction !== null && attr.isReadyForQa);
    // reset no design location. -> the location remains QA'ed -> only reset add'l hits
    const isNoMoreAttributeToScan = attributes.every(attr => !attr.isReadyForQa);
    if ((isAttributeScannedLocally || isNoMoreAttributeToScan) && additionalAttributes.some(aAttr => aAttr.scanAction === null)) {
      return [additionalAttributes.find(aAttr => aAttr.scanAction === null)!];
    }

    return [];
  });

  constructor(
    private readonly _qaApiSvc: QaApiService,
    private readonly _qaLeadApiSvc: QaLeadApiService,
    private readonly _lsStore: LocalStorageStore,
    private readonly _nzModalSvc: NzModalService,
    private readonly _i18n: TranslateStore
  ) {
    super(initialState);
  }

  readonly scanItem = this.effect<{ barcode: string }>(
    pipe(
      tap(() => {
        this.patchState({ controlError: null, apiStepMsg: null, scanItemResp: null });
        this.$showRemoveShipAlert.set(false);
      }),
      switchMap(({ barcode }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        return this._qaLeadApiSvc.scanItem(barcode, factoryId, stationId).pipe(
          tapResponse(
            resp => {
              this.isNotRequiredCI = false;
              if (resp.data) {
                this.isNotRequiredCI = resp.data?.isNotRequiredCI;
                const stepFinal =
                  resp.data.steps.find(
                    step => !step.isViewOnly && !step.isIgnoreScan && !step.isScanned && step.groupType === QaStepGroup.Final
                  ) ?? null;
                if (stepFinal) {
                  this.updateFinalStepCustomMessage(stepFinal);
                }
                this.patchState({ scanItemResp: resp.data });

                if (resp.data.shippingAlert) {
                  this.patchState({
                    controlError: {
                      errorKey: 'QA.SHIPPING_ALERT_{shippingAlert}',
                      paramError: { shippingAlert: resp.data.shippingAlert },
                    },
                  });
                  this.$showRemoveShipAlert.set(true);
                }
              }
            },
            (error: ErrorResult) => {
              this.patchState({ scanItemResp: null, controlError: error });
            }
          )
        );
      })
    )
  );

  printPickTicket() {
    const factoryId = this.factory()!.id;
    const stationId = this.station()!.id;
    // Use ticket label printer for Sock stations, otherwise use regular label printer
    const printerId = this.ticketLabelPrinter()!.id 
    const barcode = this.$currBarcode()!;
    const printingModalRef = openPrintingPopup(this._nzModalSvc, { key: '_PRINTING_PICK_TICKET' });
    this._qaApiSvc.printPickTicket(barcode, { factoryId, stationId, printerId }).subscribe({
      next: resp => {
        if (!resp.data) return;

        this.updateFlowModelFromStepSockTrimResponse(resp.data);

        if (!resp.data.isAllowNextStep) {
          this.setApiStepMsg(resp.data);
        }
        setTimeout(() => printingModalRef.destroy(), 2000);
      },
      error: (error: ErrorResult) => {
        this.patchState({ controlError: error });
        printingModalRef.destroy();
      },
    });
  }

  readonly scanVerifyLocation = this.effect<{
    verifyItems: QaScanVerifyLocationApi.RequestBody__VerifyItem[];
    stepType: QaStepGroup.OrderDetailUnit | QaStepGroup.DtfNeckLabelUnit;
  }>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(({ verifyItems, stepType }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaApiSvc.scanVerifyLocation(barcode, { factoryId, stationId, verifyItems }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                if (resp.data.finalStepCustomModel) {
                  this.updateFinalStepModel(resp.data.finalStepCustomModel);
                }
                if (stepType === QaStepGroup.OrderDetailUnit) {
                  this.updateFlowModelFromStepResponse(resp.data);
                } else if (stepType === QaStepGroup.DtfNeckLabelUnit) {
                  this.patchState(s => {
                    const { unitStatus, statusDescription, isRejectWithoutConfirming } = resp.data!;
                    const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit);
                    if (stepOdu) {
                      stepOdu.scanningOrderDetailUnit!.status = unitStatus;
                      stepOdu.scanningOrderDetailUnit!.statusDescription = statusDescription;
                    }
                    const stepDtf = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.DtfNeckLabelUnit && !st.isScanned);
                    if (stepDtf) {
                      stepDtf.scanningOrderDetailUnit!.isRejectWithoutConfirming = isRejectWithoutConfirming;
                    }
                    return { ...s };
                  });
                }

                if (resp.data.allowNextStep) {
                  this.handleAllowNextStepVerifyLocation(stepType);
                } else if (!resp.data.isRejectWithoutConfirming) {
                  this.setApiStepMsg(resp.data);
                }
              }
            },
            (error: ErrorResult) => {
              this.patchState({ controlError: error });
              // reset location scan action back to null if verify failed
              this.patchState(s => {
                const verifyItemIds = verifyItems.map(i => i.orderItemAttributeId);
                const stepOdu = s.scanItemResp!.steps.find(st => st.groupType === stepType && !st.isScanned)!;
                const matchAttr = stepOdu.scanningOrderDetailUnit!.attributes.find(attr =>
                  verifyItemIds.includes(attr.orderDetailAttributeId)
                );
                if (matchAttr) {
                  matchAttr.scanAction = null;
                }
                const matchAdditionalAttrs = stepOdu.scanningOrderDetailUnit!.additionalAttributes.filter(aAttr =>
                  verifyItemIds.includes(aAttr.orderDetailAttributeId)
                );
                matchAdditionalAttrs.forEach(aAttr => (aAttr.scanAction = null));
                return { ...s };
              });
            }
          )
        );
      })
    )
  );

  readonly resetStatus = this.effect<{ resetType: QaLeadResetLocationType; locationName: string }>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(({ resetType, locationName }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaLeadApiSvc.resetStatus(barcode, { factoryId, stationId, type: resetType, locationName }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);
                this.setConfirmRejectResetMsg(resp.data);

                if (resp.data.allowNextStep) {
                  this.scanItem({ barcode });
                } else {
                  // reset location status back to null for reset-ed item
                  this.patchState(s => {
                    const stepOdu = s.scanItemResp!.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit)!;
                    const matchAttr = stepOdu.scanningOrderDetailUnit!.attributes.find(attr => attr.locationName === locationName);
                    if (matchAttr) {
                      matchAttr.scanAction = null;
                    }
                    const matchAdditionalAttr = stepOdu.scanningOrderDetailUnit!.additionalAttributes.find(
                      aAttr => aAttr.locationName === locationName
                    );
                    if (matchAdditionalAttr) {
                      matchAdditionalAttr.scanAction = null;
                    }
                    return { ...s };
                  });
                }
              }
            },
            (error: ErrorResult) => {
              this.patchState({ controlError: error });
              if (this.$currentScanStep()!.groupType === QaStepGroup.Final) {
                this.patchState({ scanItemResp: null });
              }
            }
          )
        );
      })
    )
  );

  resetSockStatus({ resetType }: { resetType: QaLeadResetLocationType }) {
    this.resetMsg();

    const factoryId = this.factory()!.id;
    const stationId = this.station()!.id;
    const barcode = this.$currBarcode()!;
    this._qaLeadApiSvc.resetSockStatus(barcode, { factoryId, stationId, type: resetType }).subscribe({
      next: resp => {
        if (!resp.data) return;

        this.updateFlowModelFromStepResponse(resp.data);
        this.setConfirmRejectResetMsg(resp.data);

        if (resp.data.allowNextStep) {
          this.scanItem({ barcode });
        } else {
          // reset location status back to null for reset-ed item
          this.patchState(s => {
            const stepOdu = s.scanItemResp!.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit)!;
            const sockAttributes = stepOdu.scanningOrderDetailUnit!.attributes;
            sockAttributes.forEach(attr => {
              attr.scanAction = null;
            });
            return { ...s };
          });
        }
      },
      error: (error: ErrorResult) => {
        this.patchState({ controlError: error });
        if (this.$currentScanStep()!.groupType === QaStepGroup.Final) {
          this.patchState({ scanItemResp: null });
        }
      },
    });
  }

  readonly confirmReject = this.effect<{ rejectBarcode: QaLeadRejectReviewBarcode }>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(({ rejectBarcode }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaLeadApiSvc.confirmReject(barcode, { factoryId, stationId, barcode: rejectBarcode.barcode }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                if (resp.data.message === 'SERVER_SUCCESS_CONFIRM_REJECT_SUCCESS') {
                  this.setApiStepMsg({
                    message: 'QA.{rejectBarcodeDescription}_ACCEPTED',
                    messageColor: QaColor.Green,
                    messageParams: { rejectBarcodeDescription: rejectBarcode.description },
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

  scanVerifySockLocation(reviewBarcode: QaReviewBarcode) {
    this.resetMsg();

    const factoryId = this.factory()!.id;
    const stationId = this.station()!.id;
    const barcode = this.$currBarcode()!;
    this._qaApiSvc.scanVerifySockBarcode(barcode, { factoryId, stationId, verifyBarcode: reviewBarcode.barcode }).subscribe({
      next: resp => {
        if (!resp.data) return;

        this.updateFlowModelFromStepSockTrimResponse(resp.data);

        this.patchState(s => {
          const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit);
          if (stepOdu) {
            stepOdu.scanningOrderDetailUnit!.attributes.forEach(attr => {
              attr.scanAction = reviewBarcode.type;
            });
          }
          return { ...s };
        });

        if (resp.data.isAllowNextStep) {
          this.patchState(s => {
            const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit);
            if (stepOdu) {
              stepOdu.isScanned = true;
            }
            return { ...s };
          });
        } else if (!resp.data.isRejectWithoutConfirming) {
          this.setApiStepMsg(resp.data);
        }
      },
      error: (error: ErrorResult) => {
        this.patchState({ controlError: error });
      },
    });
  }
  scanConfirmSockTrim(verifyBarcode: string) {
    this.resetMsg();

    const factoryId = this.factory()!.id;
    const stationId = this.station()!.id;
    const barcode = this.$currBarcode()!;
    this._qaApiSvc.scanConfirmSockTrim(barcode, { factoryId, stationId, verifyBarcode }).subscribe({
      next: resp => {
        if (!resp.data) return;

        this.updateFlowModelFromStepSockTrimResponse(resp.data);

        if (resp.data.isAllowNextStep) {
          this.patchState(s => {
            const stepConfirmSockTrim = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.ConfirmSockTrim);
            if (stepConfirmSockTrim) {
              stepConfirmSockTrim.isScanned = true;
            }
            return { ...s };
          });
        } else {
          this.setApiStepMsg(resp.data);
        }
      },
      error: (error: ErrorResult) => {
        this.patchState({ controlError: error });
      },
    });
  }

  readonly scanCoo = this.effect<{ coo: QaCoo }>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(({ coo }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaApiSvc.scanCoo(barcode, { factoryId, stationId, cooId: coo.id }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);
                if (resp.data.finalStepCustomModel) {
                  this.updateFinalStepModel(resp.data.finalStepCustomModel);
                }

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    const stepCoo = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.Coo);
                    if (stepCoo) {
                      stepCoo.isScanned = true;
                    }

                    const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit);
                    if (stepOdu) {
                      stepOdu.scanningOrderDetailUnit!.coo = coo;
                      stepOdu.scanningOrderDetailUnit!.status = resp.data!.unitStatus;
                      stepOdu.scanningOrderDetailUnit!.isAllowChangeCoo = true;
                    }
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

  readonly scanPackage = this.effect<{ packageId: number }>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(({ packageId }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const labelPrinterId = this.labelPrinter()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaApiSvc.scanPackage(barcode, { factoryId, stationId, id: packageId, labelPrinterId: labelPrinterId }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    const stepPackage = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.Package);
                    if (stepPackage) {
                      stepPackage.scanningPackages!.scannedPackage = stepPackage.scanningPackages!.packages.find(p => p.id === packageId)!;
                      stepPackage.isScanned = true;

                      // insert that require package initially isIgnoreScan = true.
                      const relatedPackageInsert = s.scanItemResp?.steps.filter(
                        st =>
                          (st.groupType === QaStepGroup.PackagePickInsert || st.groupType === QaStepGroup.PackagePrintInsert) &&
                          st.isIgnoreScan &&
                          st.scanningPackageInsert!.requiredPackageBarcodes?.includes(stepPackage.scanningPackages!.scannedPackage!.barcode)
                      );
                      if (relatedPackageInsert) {
                        relatedPackageInsert.forEach(pi => (pi.isIgnoreScan = false));
                      }
                    }

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

  readonly scanPackageInsert = this.effect<{ packageInsertId: number }>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(({ packageInsertId }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaApiSvc.scanPackageInsert(barcode, { factoryId, stationId, id: packageInsertId }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    const stepInsert = s.scanItemResp?.steps.find(
                      st =>
                        (st.groupType === QaStepGroup.PackagePickInsert || st.groupType === QaStepGroup.PackagePrintInsert) &&
                        st.scanningPackageInsert!.id === packageInsertId
                    );
                    if (stepInsert) {
                      stepInsert.isScanned = true;
                    }
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

  scanSockTrim(packageInsertId: number) {
    this.resetMsg();

    const factoryId = this.factory()!.id;
    const stationId = this.station()!.id;
    const barcode = this.$currBarcode()!;
    this._qaApiSvc.scanPackageInsert(barcode, { factoryId, stationId, id: packageInsertId }).subscribe({
      next: resp => {
        if (!resp.data) return;

        this.updateFlowModelFromStepResponse(resp.data);

        if (resp.data.allowNextStep) {
          this.patchState(s => {
            const stepSockTrim = s.scanItemResp?.steps.find(
              st => st.groupType === QaStepGroup.SockTrim && st.scanningPackageInsert!.id === packageInsertId
            );
            if (stepSockTrim) {
              stepSockTrim.isScanned = true;
            }
            return { ...s };
          });
        } else {
          this.setApiStepMsg(resp.data);
        }
      },
      error: (error: ErrorResult) => {
        this.patchState({ controlError: error });
      },
    });
  }

  readonly printShipLabel = this.effect<never>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(() => {
        const printingModalRef = openPrintingPopup(this._nzModalSvc, { key: 'QA.PRINTING_SHIP_LABEL' });
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const labelPrinterId = this.labelPrinter()!.id;
        const laserPrinterId = this.laserPrinter()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaApiSvc.printShipLabel(barcode, { factoryId, stationId, labelPrinterId, laserPrinterId }).pipe(
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
                messageParams: error.paramError,
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
      tap(() => this.resetMsg()),
      switchMap(({ trackingNumber }) => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaApiSvc.scanTrackingNumber(barcode, { factoryId, stationId, trackingNumber }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit);
                    if (stepOdu) {
                      stepOdu.scanningOrderDetailUnit!.isAllowChangeCoo = false;
                    }
                    const stepTrackingNumber = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.TrackingNumber);
                    if (stepTrackingNumber) {
                      stepTrackingNumber.isScanned = true;
                    }
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

  readonly scanMugTicket = this.effect<never>(
    pipe(
      tap(() => this.resetMsg()),
      switchMap(() => {
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const barcode = this.$currBarcode()!;
        return this._qaApiSvc.scanMugTicket(barcode, { factoryId, stationId }).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.updateFlowModelFromStepResponse(resp.data);

                if (resp.data.allowNextStep) {
                  this.patchState(s => {
                    const stepMugTicket = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.ScanMugTicket);
                    if (stepMugTicket) {
                      stepMugTicket.isScanned = true;
                    }
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

  readonly removeShipAlert = this.effect<{ orderId: string }>(
    pipe(
      tap(() => this.patchState({ apiStepMsg: null })),
      switchMap(({ orderId }) => {
        return this._qaLeadApiSvc.removeShipAlertPut(orderId).pipe(
          tapResponse(
            resp => {
              if (resp.data) {
                this.$showRemoveShipAlert.set(false);
                this.patchState({ controlError: null });
                this.setApiStepMsg({
                  message: resp.message,
                  messageColor: QaColor.Green,
                });
              }
            },
            (error: ErrorResult) => {
              this.setApiStepMsg({
                message: error.errorKey,
                messageColor: QaColor.Red,
              });
            }
          )
        );
      })
    )
  );

  readonly resetMsg = this.updater(s => ({
    ...s,
    apiStepMsg: null,
    resetStatusApiStepMsg: null,
    controlError: null,
  }));

  readonly updateStepOduScanAction = this.updater(
    (
      s,
      args: {
        orderDetailAttributeId: number;
        type: QaPrintScanAction;
        stepType: QaStepGroup.OrderDetailUnit | QaStepGroup.DtfNeckLabelUnit;
      }
    ) => {
      const scanItemResp = s.scanItemResp!;
      const stepOdu = scanItemResp.steps.find(step => step.groupType === args.stepType && !step.isScanned)!;
      const attr = stepOdu.scanningOrderDetailUnit!.attributes.find(attr => attr.orderDetailAttributeId === args.orderDetailAttributeId);
      if (attr) attr.scanAction = args.type;
      const aAttr = stepOdu.scanningOrderDetailUnit!.additionalAttributes.find(
        aAttr => aAttr.orderDetailAttributeId === args.orderDetailAttributeId
      );
      if (aAttr) aAttr.scanAction = args.type;
      return { ...s };
    }
  );

  readonly handleAllowNextStepVerifyLocation = this.updater((s, stepType: QaStepGroup.OrderDetailUnit | QaStepGroup.DtfNeckLabelUnit) => {
    const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === stepType && !st.isScanned);
    if (!stepOdu) return { ...s };

    stepOdu.isScanned =
      stepOdu.scanningOrderDetailUnit!.attributes.every(attr => attr.scanAction === QaPrintScanAction.Accept) &&
      stepOdu.scanningOrderDetailUnit!.additionalAttributes.every(aAttr => aAttr.scanAction === QaPrintScanAction.Accept);
    return { ...s };
  });

  readonly setApiStepMsg = this.updater((s, apiStepMsg: QaLeadApiStepMsg | null) => {
    if (apiStepMsg && this.noAvailableMergeBinLargeEnoughMessages.includes(apiStepMsg.message)) {
      apiStepMsg.message = this.translateNoAvailableMergeBinLargeEnoughMessage(apiStepMsg.message, apiStepMsg.messageParams ?? {});
    }
    s.apiStepMsg = apiStepMsg;
    return { ...s };
  });

  readonly setConfirmRejectResetMsg = this.updater((s, apiStepMsg: QaLeadApiStepMsg | null) => {
    s.resetStatusApiStepMsg = apiStepMsg;
    return { ...s };
  });

  updateFlowModelFromStepSockTrimResponse(stepResponse: {
    unitStatus: number;
    statusDescription: string;
    isRejectWithoutConfirming: boolean;
  }) {
    const { unitStatus, statusDescription, isRejectWithoutConfirming } = stepResponse;
    this.patchState(s => {
      const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit);
      if (stepOdu) {
        stepOdu.scanningOrderDetailUnit!.status = unitStatus;
        stepOdu.scanningOrderDetailUnit!.statusDescription = statusDescription;
        stepOdu.scanningOrderDetailUnit!.isRejectWithoutConfirming = isRejectWithoutConfirming;
      }
      return { ...s };
    });
  }

  readonly updateFlowModelFromStepResponse = this.updater((s, stepResponse: QaScanStepApiResponse) => {
    const { unitStatus, statusDescription, isRejectWithoutConfirming, isQaSuccessAll } = stepResponse;
    const stepOdu = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit);
    if (stepOdu) {
      stepOdu.scanningOrderDetailUnit!.status = unitStatus;
      stepOdu.scanningOrderDetailUnit!.statusDescription = statusDescription;
      stepOdu.scanningOrderDetailUnit!.isRejectWithoutConfirming = isRejectWithoutConfirming;
      stepOdu.scanningOrderDetailUnit!.isQaSuccessAll = isQaSuccessAll;
    }
    return { ...s };
  });
  readonly updateFinalStepModel = this.updater((s, customModel: NonNullable<StepFinalCustomModel['finalStepCustomModel']>) => {
    const messages = customModel.customFinalMessages;
    const params = customModel.additionalParams;
    const stepFinal = s.scanItemResp!.steps.find(st => st.groupType === QaStepGroup.Final)!;
    if (messages?.length) stepFinal.messages = messages;
    if (params && Object.entries(params).length) {
      stepFinal.finalStepMessageParams = {};
      for (const [key, value] of Object.entries(params)) {
        stepFinal.finalStepMessageParams[key] = value;
      }
    }
    this.updateFinalStepCustomMessage(stepFinal);
    return { ...s };
  });

  readonly scanBarcodeNotFound = this.updater((s, barcode: string) => {
    s.controlError = {
      errorKey: 'SERVER_ERROR_INVALID_BARCODE',
      paramError: { barcode },
    };
    return { ...s };
  });

  noAvailableMergeBinLargeEnoughMessages = [
    'SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH',
    'SERVER_ERROR_NO_AVAILABLE_PRIORITY_MERGE_BIN_LARGE_ENOUGH',
    'SERVER_SUCCESS_BAG_ITEM_NO_MERGE_BIN_SEND_TO_MERGE_STATION',
    'SERVER_SUCCESS_BAG_ITEM_NO_PRIORITY_MERGE_BIN_SEND_TO_MERGE_STATION',
  ];
  translateNoAvailableMergeBinLargeEnoughMessage(message: string, messageParams: { [k: string]: string | number }): string {
    const SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH = this.noAvailableMergeBinLargeEnoughMessages.find(m => m === message);
    if (SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH) {
      const orderQty = Number(messageParams['orderQty']);
      const qtyFleece = Number(messageParams['qtyFleece']);
      const qtyMug = Number(messageParams['qtyMug']);
      const qtyShirt = Number(messageParams['qtyShirt']);
      const qtySticker = Number(messageParams['qtySticker']);
      const qtyDtfAccessory = Number(messageParams['qtyDtfAccessory']);
      const qtySock = Number(messageParams['qtySock']);
      const qtyHeavyweightJacket = Number(messageParams['qtyHeavyweightJacket']);
      const qtyPulloverJacket = Number(messageParams['qtyPulloverJacket']);
      const qtySatinJacket = Number(messageParams['qtySatinJacket']);
      let items = [
        { value: qtyShirt, key: 'SERVER_ERROR.SHIRT' },
        { value: qtyMug, key: 'SERVER_ERROR.MUGS' },
        { value: qtyFleece, key: 'SERVER_ERROR.FLEECE' },
        { value: qtySticker, key: 'SERVER_ERROR.STICKER' },
        { value: qtyDtfAccessory, key: qtyDtfAccessory <= 1 ? 'DTF_ACCESSORY' : 'DTF_ACCESSORIES' },
        { value: qtySock, key: 'SERVER_ERROR.SOCK' },
        { value: qtyHeavyweightJacket, key: 'SERVER_ERROR.HEAVYWEIGHT_JACKET' },
        { value: qtyPulloverJacket, key: 'SERVER_ERROR.PULLOVER_JACKET' },
        { value: qtySatinJacket, key: 'SERVER_ERROR.SATIN_JACKET' },
      ];
      items = items.filter(x => x.value > 0);
      let errorMsg = this._i18n.instant(SERVER_ERROR_NO_AVAILABLE_MERGE_BIN_LARGE_ENOUGH, messageParams) + ' ';
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
        return errorMsg;
      }
    }
    return '';
  }
  updateFinalStepCustomMessage(stepFinal: QaScanItemApi.QaScanStep) {
    if (stepFinal?.messages?.length) {
      const noAvailableMergeBinLargeEnoughMessage = stepFinal.messages.find(m =>
        this.noAvailableMergeBinLargeEnoughMessages.includes(m.message)
      );
      if (noAvailableMergeBinLargeEnoughMessage) {
        const message = this.translateNoAvailableMergeBinLargeEnoughMessage(
          noAvailableMergeBinLargeEnoughMessage.message,
          stepFinal.finalStepMessageParams ?? {}
        );
        noAvailableMergeBinLargeEnoughMessage.message = message;
      }
    }
  }

  readonly printCustomInsert = this.effect<never>(
    pipe(
      switchMap(() => {
        const printingModalRef = openPrintingPopup(this._nzModalSvc, { key: 'SHIPPING.PRINTING_CUSTOM_INSERT' });
        const barcode = this.$currBarcode()!;
        const factoryId = this.factory()!.id;
        const stationId = this.station()!.id;
        const labelPrinterId = this.labelPrinter()!.id;
        return this._qaApiSvc
          .printCustomInsert(barcode, {
            factoryId: factoryId,
            stationId: stationId,
            labelPrinterId: labelPrinterId,
          })
          .pipe(
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
                  messageParams: error.paramError,
                });
                printingModalRef.destroy();
              }
            )
          );
      })
    )
  );
}
