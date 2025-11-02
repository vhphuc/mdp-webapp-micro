import { MugPickScanCode, MugPrintScanCode } from '../ui/scan-code';
import { MugStepGroup } from './enum/mug-step-group';

export namespace MugScanItemApi {
  export type Response = {
    groupType: MugStepGroup;
    // isScanned: boolean; not used yet
    scanningOrderDetailUnit: ScanningOrderDetailUnit;
  };

  export type ScanningOrderDetailUnit = {
    orderDetailUnitId: number;
    barcode: string;
    customPartnerId: string;
    xId: string;
    orderId: number;
    sku: string;
    slaDateOnUtc: Date | null;
    previewUrl: string | null; // not suppose to be null but might be null if bad data
    fileUrl: string | null; // not suppose to be null but might be null if bad data
    size: string | null; // not suppose to be null but might be null if bad data
    color: string | null; // not suppose to be null but might be null if bad data
    binId: number;
    binName: string;
    mugImageUrl: string;

    // UI
    printScannedCode?: MugPrintScanCode;
    pickScannedCode?: MugPickScanCode;
  };
}

export namespace MugConfirmPickApi {
  export type RequestBody = {
    binId: number;
    pickActionBarcode: MugPickScanCode;
  };
}

export namespace MugConfirmPrintApi {
  export type RequestBody = {
    actionBarcode: MugPrintScanCode;
  };
}
