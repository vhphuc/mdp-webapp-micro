import { NeckLabelBarcodeLocation } from './enum/neck-label-barcode-location';
import { NeckLabelScanAction } from './enum/neck-label-scan-action';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';

export enum ENeckLabelType {
  NeckLabel = 1,
  Patch = 2,
}

export namespace NeckLabelScanUnitApi {
  export interface Response {
    orderDetailId: number;
    sku: string;
    barcode: string;
    quantity: number;
    partnerId: number;
    partnerOrderId: number;
    orderId: number;
    style: string;
    color: string;
    size: string;
    type: string;

    neckLabelBinId: string;
    nlPreviewUrl: string;
    acceptNLCode: string;
    rejectNLCode: string;
    isAcceptedNeckLabel: boolean;
    isRejectedNeckLabel: boolean;

    patchBinId: string;
    patchPreviewUrl: string;
    acceptPatchCode: string;
    isAcceptedPatch: boolean;

    status: ItemTransitionStatus;
    statusName: string;

    isResized: string;
    isPriority: boolean;
    isJit: boolean;
    preQrCode: string | null;
    pickingCartName: string;
    isSmartBatching: boolean;

    printLocations: {
      attrId: number;
      code: string;
      location: string;
      imageUrl: string;
      isPrinted: boolean;
      isQaSuccess: boolean;
      orderBy: number;
      description: string;
    }[];

    dtfNeckLabelStep: {
      isIgnoreScan: boolean;
      isScanned: boolean;
      orderItemAttributeId: number;
      fileUrl: string;
      previewUrl: string;
      rejectLabelBarcodes: {
        location: NeckLabelBarcodeLocation;
        type: NeckLabelScanAction;
        barcode: string;
      }[];
      verifyLabelBarcodes: {
        location: NeckLabelBarcodeLocation;
        type: NeckLabelScanAction;
        barcode: string;
      }[];
      isNoDesign: boolean;
    } | null;
  }
}

export namespace NeckLabelScanAttributeApi {
  export interface Request {
    factoryId: number;
    stationId: number;
    barcode: string;
    type: ENeckLabelType;
  }

  export type Response = {
    isPrioritySmartBatching: boolean;
    isLabelledAllCart: boolean;
    pickingCartName: string | null;
    isAvailableCart: boolean;
    podName: string | null;
    machineName: string | null;
    machineType: string | null;
    isQaPod: boolean;
  };
}

export namespace NeckLabelVerifyDtfNeckLabelApi {
  export type RequestBody = {
    barcode: string;
    factoryId: number;
    stationId: number;
    reviewBarcode: string;
  };
}
