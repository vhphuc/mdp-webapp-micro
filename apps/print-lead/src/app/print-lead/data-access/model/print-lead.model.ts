import { FormControl, FormGroup } from '@angular/forms';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';

export namespace PrintLeadForm {
  export type FactoryFormGroup = {
    factoryId: FormControl<number>;
  };

  export type StationFormGroup = {
    stationId: FormControl<number | null>;
  };

  export type ScanItemFormGroup = {
    barcode: FormControl<string>;
  };
  export type ScanActionFormGroup = {
    barcode: FormControl<string>;
    stationId: FormControl<number>;
    actionBarcode: FormControl<string>;
    factoryId: FormControl<number>;
  };

  export type ScanActionBodyFormGroup = {
    reason: FormControl<string>;
    locationBarcode: FormControl<string>;
    stationName: FormControl<string>;
  };

  export function mapModelParam(frm: FormGroup<ScanActionFormGroup>): PrintLeadScanItem.RequestParam {
    const formValue = frm.getRawValue();
    return {
      barcode: formValue.barcode.trim(),
      stationId: formValue.stationId,
      actionBarcode: formValue.actionBarcode.trim(),
      factoryId: formValue.factoryId,
    };
  }

  export function mapModelBody(frm: FormGroup<ScanActionBodyFormGroup>): PrintLeadScanItem.RequestBody {
    const formValue = frm.getRawValue();
    return {
      reason: formValue.reason,
      locationBarcode: formValue.locationBarcode.trim(),
      stationName: formValue.stationName,
    };
  }
}

export namespace PrintLeadScanItem {
  export interface RequestParam {
    barcode: string;
    stationId: number;
    actionBarcode: string;
    factoryId: number;
  }
  export interface RequestBody {
    reason: string;
    locationBarcode: string;
    stationName: string;
  }

  export interface BarcodeConfiguration {
    barcodeValue: string;
    name: string;
    action: string;
    isActive: boolean;
    isManualInput: boolean;
  }

  export interface Response {
    batchId: string;
    sku: string;
    barcode: string;
    quantity: number;
    partnerId: number;
    partnerOrderId: string;
    orderId: number;
    style: string;
    color: string;
    size: string;
    type: string;
    status: number;
    statusName: string;
    isPriority: boolean;
    neckLabelImage: string;
    printItems: PrintItem[];
    customNumber: string;
    customName: string;
    isMugPrint: boolean;
    isStickerPrint: boolean;
    isJit: boolean;
    isDtfAccessory: boolean;
    isEmbroideredPrint: boolean;
    preQrCode: string | null;
    orderDetailUnitId: number;
    barcodeConfigurations: BarcodeConfiguration[];
  }

  export interface PrintItem {
    id: number;
    code: string; // CF, FNL,
    location: string; // Front, Back, FNL
    locationBarcode: string; // TRK001, TRK010, TRK019, etc...
    previewUrl: string;
    fileUrl: string;
    isPrinted: boolean;
    isProcessed: boolean;
    status: ItemTransitionStatus;
    isPrintQaSuccessStatus: boolean;
    isAllowScan: boolean;
    description: string;
  }
}

export namespace DetailImage {
  export interface Response {
    apolloInfo: PrintItemImageDetailApi.ImageDetailApollo;
    kornitInfo: PrintItemImageDetailApi.ImageDetailKornit;
    polarisInfo: PrintItemImageDetailApi.ImageDetailPolaris;
    mugInfo: PrintItemImageDetailApi.MugInfoModel;
    stickerInfo: PrintItemImageDetailApi.StickerInfoModel;
    hatInfo: PrintItemImageDetailApi.HatInfoModel;
    isFanaticOrder: boolean;
    isFocoOrder: boolean;
    message: string;
    paramSuccess: string;
  }
}

export namespace EmbroideredImageDetail {
  export type Response = {
    fileUrl: string;
    previewUrl: string;
    dstFileUrl: string;
    locationCode: string;
    item: ImageDetailItemEmbroidered;
    threadColors: Array<{
      code: string;
      brand: string;
    }>;
  };
}

export interface ImageDetailItemEmbroidered {
  orderDetailUnitId: number;
  embroideryJobId: string;
  embroideryJobApiRequest: string;
}

export namespace PrintItemImageDetailApi {
  export interface Response {
    kornitInfo: ImageDetailKornit;
    polarisInfo: ImageDetailPolaris;
    apolloInfo: ImageDetailApollo;
  }

  export type NullableString = string | null;
  export interface ImageDetailBase {
    customerWidthIn: number | string;
    customerWidthMm: number | string;
    customerHeightIn: number | string;
    customerHeightMm: number | string;

    canvasWidthMm: number;
    canvasWidthIn: number;
    canvasHeightMm: number;
    canvasHeightIn: number;

    printWidthMm: number;
    printWidthIn: number;
    printHeightMm: number;
    printHeightIn: number;

    finalPrintWidthMm: number;
    finalPrintWidthIn: number;
    finalPrintHeightMm: number;
    finalPrintHeightIn: number;

    xOffsetMm: number;
    xOffsetIn: number;
    yOffsetMm: number;
    yOffsetIn: number;

    locationCode: NullableString;
    fileUrl: NullableString;
    previewUrl: NullableString;
    isCenterArtfile: boolean;
    isRotation: boolean;
    sourceDpi: number;
    sourceDpiData: NullableString;
    isNoDesign: boolean;
    fileName: NullableString;
  }

  export interface ImageDetailKornit extends ImageDetailBase {
    imageProcessErrorReason: string | null;
    processingAttempt: string;
    leftTransparencyMm: number | null;
    leftTransparencyIn: number | null;
    rightTransparencyMm: number | null;
    rightTransparencyIn: number | null;
    designContentHashId: number | null;
    designCategoryName: string | null;
    designTag: string | null;
    attrId: number;
    noUnderbase: boolean;
    topOffSet: number | null;
    isNoDesign: boolean;
    isUsePolyPro: boolean;
    convertedTries: number;
    fileExtension: NullableString;
    fileUrlPdf: NullableString;
    fileUrlPdfPartner: NullableString;
  }

  export interface ImageDetailPolaris extends ImageDetailBase {
    leftTransparencyMm: number | null;
    leftTransparencyIn: number | null;
    rightTransparencyMm: number | null;
    rightTransparencyIn: number | null;
    recipe: string | null;
    designContentHashId: number | null;
    designCategoryName: string | null;
    designTag: string | null;
    isRotation: boolean;
    fileUrlPdf: string | null;
    fileUrlPdfPartner: string | null;
    isFanaticOrder: boolean;
    partnerFileUrl: string | null;
    isFocoOrder: boolean;
    fileExtension: NullableString;
  }

  export interface ImageDetailApollo extends ImageDetailBase {
    designContentHashId: number | null;
    designCategoryName: string | null;
    designTag: string | null;
    recipe: string | null;
    noUnderbase: boolean;
    topOffSet: string | null;
    isNoDesign: boolean;
    fileExtension: NullableString;
    fileUrlPdf: NullableString;
    fileUrlPdfPartner: NullableString;
  }
  export interface StickerInfoModel {
    attrId: number;
    locationCode: string | null;
    fileUrl: string | null;
    previewUrl: string | null;
    designContentHashId: number | null;
    designCategoryName: string | null;
    designTag: string | null;
  }
  export interface MugInfoModel extends ImageDetailBase {
    imageProcessErrorReason: string | null;
    processingAttempt: string;
    leftTransparencyMm: number | null;
    leftTransparencyIn: number | null;
    rightTransparencyMm: number | null;
    rightTransparencyIn: number | null;
    designContentHashId: number | null;
    designCategoryName: string | null;
    designTag: string | null;
    attrId: number;
    noUnderbase: boolean;
    topOffSet: number | null;
    isNoDesign: boolean;
    isUsePolyPro: boolean;
    convertedTries: number;
  }

  export interface HatInfoModel extends ImageDetailBase {
    imageProcessErrorReason: string | null;
    processingAttempt: string;
    leftTransparencyMm: number | null;
    leftTransparencyIn: number | null;
    rightTransparencyMm: number | null;
    rightTransparencyIn: number | null;
    designContentHashId: number | null;
    designCategoryName: string | null;
    designTag: string | null;
    attrId: number;
    noUnderbase: boolean;
    topOffSet: number | null;
    isNoDesign: boolean;
    isUsePolyPro: boolean;
    convertedTries: number;
  }
}

export namespace PrintLeadResetItem {
  export interface RequestBody {
    stationId: number;
    stationName: string;
  }
}