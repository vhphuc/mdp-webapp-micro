import { TrimType } from './enum/trim-type';
import { TrimScanAction } from './enum/trim-scan-action';
import { TrimAppColor } from './enum/trim-app-color';

export namespace TrimScanItemApi {
  export type Response = {
    // partnerId: number;
    customPartnerId: string;
    orderId: number;
    xid: string; // partner order id
    sku: string;
    slaDateOnUtc: Date;
    orderDetailId: number;
    orderDetailUnit: {
      id: number;
      barcode: string;
      quantity: number;
      cooId: number;
      cooName: string;
      preQrCode: string | null;
    };
    trims: {
      orderItemAttributeId: number;
      trimType: TrimType;
      trimTypeIndex: number; // UI
      trimName: string;
      fileUrl: string;
      previewUrl: string;
      isRequired: boolean;
      binName: string;
      // status: ItemTransitionStatus;
      verifiedBarcode: TrimBarcode | null;
      confirmedBarcode: TrimBarcode | null;
      confirmBarcodes: TrimBarcode[];
      acceptBarcode: TrimBarcode;
      rejectBarcode: TrimBarcode;
      isScanned: boolean;
    }[];
    isTrimComplete: boolean;
    messageKey: string;
    messageParams: { [key: string]: string | number };
  };

  export type TrimBarcode = {
    barcode: string;
    action: TrimScanAction;
  };
}

export namespace TrimConfirmApi {
  export type RequestBody = Pick<TrimScanItemApi.Response, 'trims'>;
  export type Response = {
    isTrimComplete: boolean;
    messageKey: string;
    messageParams: { [key: string]: string | number };
    color: TrimAppColor;
  };
}
