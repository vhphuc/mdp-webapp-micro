export namespace ScanBarcode {
  export type Response = {
    orderDetailUnitId: number;
    barcode: string;
    preQrBarcode: string | null;
    statusDescription: string;
    quantity: number;
    order: {
      orderId: number;
      customPartnerId: string;
      xid: string;
    };
    orderDetail: {
      id: number;
      productVariantId: number;
      sku: string;
      styleDesc: string;
      colorName: string;
      sizeName: string;
      sizeClassName: string;
    };
    locationAttributes: {
      seqNo: number;
      orderItemAttributeId: number;
      location: string;
      previewUrl: string;
    }[];
    insertAttributes: {
      seqNo: number;
      orderItemAttributeId: number;
      location: string;
      previewUrl: string;
      type: string;
    }[];
  };
}
