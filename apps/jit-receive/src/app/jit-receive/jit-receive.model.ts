import { DateString } from '@shared/data-access/model/ui/primitive';
import { Factory } from '@shared/data-access/model/api/enum/factory';

export enum JitReceiveStep {
  SCAN_TRACKING,
  SCAN_ITEM,
  CONFIRM_RECEIPT,
  ITEM_MISSING,
  ITEM_DAMAGED,
  // SCAN_COO
}

export enum JitReceiveScanAction {
  Accept = 0,
  Reject = 1,
}

export enum JitReceiveBarcodeType {
  Received = 0,
  Missing = 1,
  Damaged = 2,
}

export enum PurchaseOrderType {
  Blanks = 0,
  Miscellaneous = 1,
  NeckLabel = 2,
  Bag = 3,
}

export enum EJitPurchaseOrderAsnPackageDetailPreQrCodeStatus {
  Receiving = 0,
  Received = 1,
  Missing = 2,
  Damaged = 3,
}

export namespace ScanTrackingV2 {
  export type RequestParams = {
    factoryId: Factory;
    stationId: number;
    printerConfigurationId: number;
  };

  export type Response = {
    packageId: number;
    purchaseOrderId: number;
    poNumber: string;
    poType: PurchaseOrderType;
    vendor: string;
    invoiceNumber: string;
    packageBarcode: string;
    poCreatedDate: DateString;
    totalQuantity: number;
    receivedQty: number;
    missingQty: number;
    damagedQty: number;
    pickTicketsUrl: string | null;
    coos: {
      id: number;
      code: string;
      name: string;
    }[];
    packageUnitPreQrCodes: PackageUnitPreQrCode[];
    actionBarcodes: {
      actionType: JitReceiveScanAction;
      value: string;
      type: JitReceiveBarcodeType;
    }[];
  };

  export type PackageUnitPreQrCode = {
    jitPurchaseOrderAsnPackageDetailId: number;
    preQrCode: string | null;
    preQrCodeId: number | null;
    productVariantId: number;
    isJit: boolean | null;
    jitMergeBinName: string | null;
    cooCode: string | null;
    cooName: string | null;
    lineNumber: number;
    vendorSku: string;
    vendorBrand: string;
    vendorStyle: string;
    vendorDescription: string;
    vendorColor: string;
    vendorSize: string;
    gtin: string;
    sku: string;
    sizeClassName: string;
    previewImage: string | null;
    jitPurchaseOrderAsnPackageDetailPreQrCodeStatus: EJitPurchaseOrderAsnPackageDetailPreQrCodeStatus;
    isMissing: boolean;
    isReceived: boolean;
    isDamaged: boolean;

    // for UI
    styleColorSizeCoo?: string; // to combine 4 field
    groupQtyIdx?: number; // QTY: '1' of 2
    groupQtyTotal?: number; // QTY: 1 of '2'
    groupQtyRejectIdx?: number;
    groupQtyRejectTotal?: number;
  };
}

export namespace AcceptOrRejectReceipt {
  export type RequestBody = {
    factoryId: Factory;
    stationId: number;
    packageId: number;
    cooCode: string | null;
    actionBarcode: string;
  };
}
