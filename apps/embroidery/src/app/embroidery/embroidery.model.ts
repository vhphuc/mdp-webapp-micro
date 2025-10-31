import { Factory } from '@shared/data-access/model/api/enum/factory';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';

export enum EmbroideryAppConfirmType {
  Accept = 1,
  Reject = 2,
}

export namespace ScanItem {
  export type RequestBody = {
    barcode: string;
    factoryId: Factory;
    stationId: number;
    stationName: string;
  };
  export type Response = {
    orderDetailId: number;
    sku: string;
    barcode: string;
    quantity: number;
    partnerId: string;
    orderId: number;
    partnerOrderId: string;
    style: string | null;
    color: string | null;
    size: string | null;
    type: string | null;
    embPreviewUrl: string | null;
    embFileUrl: string | null;
    status: ItemTransitionStatus;
    statusName: string;
    isPriority: boolean;
    locationName: string | null;
    preQrCode: string | null;
    listReviewBarcodeConfirm: {
      confirmType: EmbroideryAppConfirmType;
      barcode: string;
    }[];
  };
}

export namespace ConfirmItem {
  export type RequestBody = {
    barcode: string;
    factoryId: Factory;
    stationId: number;
    stationName: string;
    confirmBarcode: string;
  };
  export type Response = {
    // orderDetailId: number; BE return but not use
    status: ItemTransitionStatus;
    statusName: string;
  };
}