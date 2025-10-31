import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';
import { Factory } from '@shared/data-access/model/api/enum/factory';

export enum DtfHatStep {
  SCAN_TRANSFER,
  SCAN_ITEM,
  CONFIRM_ITEM,
  CONFIRM_COMPLETE,
}

export enum EDtfHatAppConfirmType {
  Accept = 1,
  Reject = 2,
}

export namespace ScanTransfer {
  export type RequestParams = {
    factoryId: number;
    stationId: number;
    printerConfigurationId: number;
  };
  export type Response = {
    orderDetailUnitId: number;
    barcode: string;
    sku: string;
    itemsQuantity: number;
    customPartnerId: string;
    orderId: number;
    xId: string;
    style: string | null;
    color: string | null;
    size: string | null;
    sizeClass: string | null;
    status: ItemTransitionStatus;
    statusDescription: string | null;
    location: string | null;
    previewUrl: string | null;
    fileUrl: string | null;
    isPriority: boolean;
    isJit: boolean;
    listReviewBarcodeConfirm: {
      confirmType: EDtfHatAppConfirmType;
      barcode: string;
    }[];
  };
}

export namespace ScanConfirm {
  export type RequestBody = {
    barcode: string;
    confirmBarcode: string;
    factoryId: Factory;
    stationId: number;
  };
}
