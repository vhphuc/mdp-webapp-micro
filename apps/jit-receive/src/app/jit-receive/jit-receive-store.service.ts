import { computed, Injectable, signal } from '@angular/core';
import { JitReceiveBarcodeType, JitReceiveScanAction, JitReceiveStep, ScanTrackingV2 } from './jit-receive.model';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { JitReceiveService } from './jit-receive.service';
import { ErrorResult, SuccessResult } from '@shared/data-access/model/api/response';
import { cloneDeep } from 'lodash-es';

@Injectable()
export class JitReceiveStoreService {
  step = signal<JitReceiveStep>(JitReceiveStep.SCAN_TRACKING);

  error = signal<ErrorResult | null>(null);
  confirmedMsg = signal<Omit<SuccessResult<never>, 'data'> | null>(null);

  tracking = signal<ScanTrackingV2.Response | null>(null);
  packageUnit = signal<ScanTrackingV2.PackageUnitPreQrCode | null>(null);
  latestConfirmedPackageUnit = signal<ScanTrackingV2.PackageUnitPreQrCode | null>(null);

  // for UI left panel
  rejectedPackageUnitGroups = computed(() => {
    const results: { styleColorSizeCoo: string; packageUnits: ScanTrackingV2.PackageUnitPreQrCode[] }[] = [];
    if (!this.tracking()) return results;
    let rejectedPackageUnits = this.tracking()!
      .packageUnitPreQrCodes
      .filter(odu => odu.isMissing || odu.isDamaged);
    rejectedPackageUnits = cloneDeep(rejectedPackageUnits);
    rejectedPackageUnits.sort((a, b) => {
      if (a.styleColorSizeCoo! > b.styleColorSizeCoo!) return 1;
      else if (a.styleColorSizeCoo! < b.styleColorSizeCoo!) return -1;
      else {
        return a.groupQtyIdx! > b.groupQtyIdx! ? 1 : -1;
      }
    });
    const groups = new Set(rejectedPackageUnits.map(item => item.styleColorSizeCoo));

    groups.forEach(g =>
      results.push({
        styleColorSizeCoo: g!,
        packageUnits: rejectedPackageUnits.filter(mi => mi.styleColorSizeCoo === g),
      })
    );
    results.forEach(r => {
      r.packageUnits.forEach((packageUnit, i) => {
        packageUnit.groupQtyRejectIdx = i + 1;
        packageUnit.groupQtyRejectTotal = r.packageUnits.length;
      });
    });
    return results;
  });

  // for UI left panel
  packageUnitGroups = computed(() => {
    const results: { styleColorSizeCoo: string; acceptedPackageUnits: ScanTrackingV2.PackageUnitPreQrCode[]; preview: string; totalQty: number }[] = [];
    if (!this.tracking()) return results;
    let packageUnits = this.tracking()!.packageUnitPreQrCodes;
    packageUnits = cloneDeep(packageUnits);
    packageUnits.sort((a, b) => {
      if (a.styleColorSizeCoo! > b.styleColorSizeCoo!) return 1;
      else if (a.styleColorSizeCoo! < b.styleColorSizeCoo!) return -1;
      else {
        return a.groupQtyIdx! > b.groupQtyIdx! ? 1 : -1;
      }
    });
    const groups = new Set(packageUnits.map(item => item.styleColorSizeCoo));

    groups.forEach(g => {
      const itemOfGrp = packageUnits.filter(x => x.styleColorSizeCoo === g);
      results.push({
        styleColorSizeCoo: g!,
        acceptedPackageUnits: itemOfGrp.filter(x => x.isReceived),
        preview: itemOfGrp[0].previewImage ?? '',
        totalQty: itemOfGrp.length,
      });
    });
    return results;
  });

  config = this._lsStore.selectSignal(s => s.jitReceivingConfig);

  constructor(
    private readonly _lsStore: LocalStorageStore,
    private readonly _apiSvc: JitReceiveService
  ) {}

  reset() {
    this.tracking.set(null);
    this.packageUnit.set(null);
    this.latestConfirmedPackageUnit.set(null);
    this.confirmedMsg.set(null);
    this.error.set(null);
    this.step.set(JitReceiveStep.SCAN_TRACKING);
  }

  scanTracking(tracking: string) {
    this.reset();
    this._apiSvc
      .scanTracking(tracking, {
        factoryId: this.config()!.factory.id,
        stationId: this.config()!.station.id,
        printerConfigurationId: this.config()!.regularReceivingPrinter.id,
      })
      .subscribe({
        next: resp => {
          if (!resp.data) return;

          const packageUnits = resp.data.packageUnitPreQrCodes;
          // group by styleColorSizeCoo to show in UI left panel
          packageUnits.forEach(packageUnit => {
            packageUnit.styleColorSizeCoo =
              packageUnit.vendorStyle + packageUnit.vendorColor + packageUnit.vendorSize + packageUnit.cooCode;
          });
          packageUnits.forEach(packageUnit => {
            packageUnit.groupQtyTotal = packageUnits.filter(x => x.styleColorSizeCoo === packageUnit.styleColorSizeCoo).length;
          });

          // get all distinct styleColorSizeCoo group
          const styleColorSizeCooGrp = [...new Set(packageUnits.map(odu => odu.styleColorSizeCoo))];
          styleColorSizeCooGrp.forEach(grp => {
            // assign qtyIdx for each processed packageUnit of the group
            const packageUnitsOfGrp = packageUnits.filter(x => x.styleColorSizeCoo === grp && (x.isReceived || x.isMissing || x.isDamaged));
            packageUnitsOfGrp.forEach((packageUnit, i) => (packageUnit.groupQtyIdx = i + 1));
          });

          this.tracking.set(resp.data);

          if (packageUnits.some(x => !x.isReceived && !x.isMissing && !x.isDamaged)) {
            this.step.set(JitReceiveStep.SCAN_ITEM);
          }
        },
        error: (err: ErrorResult) => {
          this.error.set(err);
        },
      });
  }

  scanItem(preQrCode: string) {
    this.error.set(null);
    this.confirmedMsg.set(null);
    this.latestConfirmedPackageUnit.set(null);

    let packageUnit = this.tracking()!.packageUnitPreQrCodes.find(p => p.preQrCode?.toUpperCase() === preQrCode);
    if (!packageUnit) {
      this.error.set({ errorKey: 'PREQRCODE_X1_IS_INVALID', paramError: { x1: preQrCode } });
      return;
    }
    if (packageUnit.isReceived) {
      this.error.set({ errorKey: 'ITEM_X1_WAS_ALREADY_RECEIVED_ON_THIS_PO', paramError: { x1: preQrCode } });
      return;
    }
    if (packageUnit.isMissing) {
      this.error.set({ errorKey: 'ITEM_X1_WAS_ALREADY_MISSING_ON_THIS_PO', paramError: { x1: preQrCode } });
      return;
    }
    if (packageUnit.isDamaged) {
      this.error.set({ errorKey: 'ITEM_X1_WAS_ALREADY_DAMAGED_ON_THIS_PO', paramError: { x1: preQrCode } });
      return;
    }

    // assign groupQtyIdx for the packageUnit (UI left panel)
    const sameGrpPackageUnits = this.tracking()!.packageUnitPreQrCodes.filter(p => p.styleColorSizeCoo === packageUnit.styleColorSizeCoo);
    const highestGrpQtyIdx = Math.max(...sameGrpPackageUnits.map(i => i.groupQtyIdx ?? 0));
    const currPackageUnitQtyIdx = highestGrpQtyIdx + 1;
    this.tracking.update(tr => {
      const packageUnit = tr!.packageUnitPreQrCodes.find(p => p.preQrCode?.toUpperCase() === preQrCode)!;
      if (!packageUnit.groupQtyIdx) {
        packageUnit.groupQtyIdx = currPackageUnitQtyIdx;
      }
      return { ...tr! };
    });

    this.packageUnit.set(cloneDeep(packageUnit));
    this.step.set(JitReceiveStep.CONFIRM_RECEIPT);
  }

  confirmReceipt(scanValue: string) {
    this.error.set(null);

    const actionBarcode = this.tracking()!.actionBarcodes.find(ab => ab.value === scanValue);
    if (!actionBarcode) {
      this.error.set({ errorKey: 'SCAN_CODE_XXX_INVALID', paramError: { xxx: scanValue } });
      return;
    }

    if (actionBarcode.actionType === JitReceiveScanAction.Accept) {
      this.acceptReceipt(actionBarcode.value);
    } else if (actionBarcode.type === JitReceiveBarcodeType.Missing) {
      this.step.set(JitReceiveStep.ITEM_MISSING);
    } else if (actionBarcode.type === JitReceiveBarcodeType.Damaged) {
      this.step.set(JitReceiveStep.ITEM_DAMAGED);
    }
  }

  acceptReceipt(actionBarcode: string) {
    const isLastUnit =
      this.tracking()!.packageUnitPreQrCodes.filter(
        packageUnit => !packageUnit.isReceived && !packageUnit.isMissing && !packageUnit.isDamaged
      ).length === 1;
    this._apiSvc
      .acceptReceipt(this.packageUnit()!.preQrCode!, {
        actionBarcode: actionBarcode,
        factoryId: this.config()!.factory.id,
        stationId: this.config()!.station.id,
        packageId: this.tracking()!.packageId,
        cooCode: this.packageUnit()!.cooCode,
      })
      .subscribe({
        next: resp => {
          if (resp.message) {
            this.confirmedMsg.set({ message: resp.message, paramSuccess: resp.paramSuccess });
          }
          this.tracking.update(tracking => {
            const packageUnit = tracking!.packageUnitPreQrCodes.find(p => p.preQrCode?.toUpperCase() === this.packageUnit()!.preQrCode)!;
            packageUnit.isReceived = true;
            this.latestConfirmedPackageUnit.set(packageUnit);
            tracking!.receivedQty += 1;
            return { ...tracking! };
          });
          
          this.packageUnit.set(null);
          this.step.set(isLastUnit ? JitReceiveStep.SCAN_TRACKING : JitReceiveStep.SCAN_ITEM);
        },
        error: (err: ErrorResult) => this.error.set(err),
      });
  }

  rejectReceipt(actionBarcode: ScanTrackingV2.Response['actionBarcodes'][number]) {
    const isLastUnit =
      this.tracking()!.packageUnitPreQrCodes.filter(
        packageUnit => !packageUnit.isReceived && !packageUnit.isMissing && !packageUnit.isDamaged
      ).length === 1;
    this._apiSvc
      .rejectReceipt(this.packageUnit()!.preQrCode!, {
        factoryId: this.config()!.factory.id,
        actionBarcode: actionBarcode.value,
        stationId: this.config()!.station.id,
        packageId: this.tracking()!.packageId,
        cooCode: this.packageUnit()!.cooCode,
      })
      .subscribe({
        next: resp => {
          if (resp.message) {
            this.confirmedMsg.set({ message: resp.message, paramSuccess: resp.paramSuccess });
          }
          this.tracking.update(tracking => {
            const packageUnit = tracking!.packageUnitPreQrCodes.find(p => p.preQrCode?.toUpperCase() === this.packageUnit()!.preQrCode)!;
            if (actionBarcode.type === JitReceiveBarcodeType.Missing) {
              packageUnit.isMissing = true;
              tracking!.missingQty += 1;
            } else if (actionBarcode.type === JitReceiveBarcodeType.Damaged) {
              packageUnit.isDamaged = true;
              tracking!.damagedQty += 1;
            }
            this.latestConfirmedPackageUnit.set(packageUnit);
            return { ...tracking! };
          });
          this.packageUnit.set(null);
          this.step.set(isLastUnit ? JitReceiveStep.SCAN_TRACKING : JitReceiveStep.SCAN_ITEM);
        },
        error: (err: ErrorResult) => this.error.set(err),
      });
  }
}
