import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';
import { QaColor } from '../../../data-access/model/common/enum/qa-color';
import { QaPrintBarcodeLocation } from '../../../data-access/model/common/enum/qa-print-barcode-location';
import { QaPrintScanAction } from '../../../data-access/model/common/enum/qa-print-scan-action';
import { QaLeadRejectReviewBarcode } from '../../../data-access/model/common/type/qa-lead-reject-review-barcode';
import { StepFinalCustomModel } from '../../qa-lead-flow/data-access/qa-api';

export namespace QaStickerScanSheetApi {
  export type Response = {
    orderId: number;
    // partnerId: number;
    customPartnerId: string;
    xid: string;
    slaDateOnUtc: Date;
    xqc: boolean;
    isPriority: boolean;
    shippingAlert: string | null;
    isVipOrder: boolean;
    sheetBarcode: string;
    stickerSheetId: number;
    qaLeadRejectReviewBarcodes: QaLeadRejectReviewBarcode[];
    coos: {
      id: number;
      name: string;
      code: string;
      cooImageUrl: string | null;
      transformName: string;
    }[];

    //region flow related
    coo: Response['coos'][number] | null;
    isAllowChangeCoo: boolean;
    status: ItemTransitionStatus;
    statusDescription: string;
    //endregion

    steps: (QaStickerStepStickerGroup | QaStickerStepCoo | QaStickerStepPackage | QaStickerStepTrackingNumber | QaStickerStepFinal)[];
    isJit: boolean;
  };

  export type BaseStep = {
    isIgnoreScan: boolean;
    isViewOnly: boolean;
    isScanned: boolean;
  };

  export type QaStickerStepStickerGroup = BaseStep & {
    groupType: QaStepGroup.StickerGroup;
    scanningStickerGroup: {
      barcode: string;
      // status: ItemTransitionStatus;
      // sku: string;
      styleDesc: string;
      colorName: string;
      sizeCode: string;
      sizeClassName: string;
      rejectedCount: number;
      isRejectWithoutConfirming: boolean; // qa lead
      // isQaSuccessAll: boolean;
      isAllowChangeCoo: boolean; // move this outside for easier usage
      customNumber: string | null;
      customName: string | null;
      attribute: {
        orderDetailAttributeId: number;
        // isNoDesign: boolean;
        isReadyForQa: boolean;
        locationCode: string;
        locationName: string;
        description: string | null;
        locationStatus: ItemTransitionStatus;
        fileUrl: string;
        scanAction: QaPrintScanAction | null;
        reviewBarcodes: {
          location: QaPrintBarcodeLocation;
          type: QaPrintScanAction;
          barcode: string;
        }[];
      };
    };
  };
  export type QaStickerStepCoo = BaseStep & {
    groupType: QaStepGroup.Coo;
  };
  export type QaStickerStepPackage = BaseStep & {
    groupType: QaStepGroup.Package;
    scanningPackages: {
      scannedPackage: QaStickerStepPackage['scanningPackages']['packages'][number] | null;
      packages: {
        id: number;
        name: string;
        barcode: string;
        imageUrl: string;
      }[];
    };
  };
  export type QaStickerStepTrackingNumber = BaseStep & {
    groupType: QaStepGroup.TrackingNumber;
    scanningTrackingNumber: {
      trackingNumber: string;
    };
  };
  export type QaStickerStepFinal = BaseStep & {
    groupType: QaStepGroup.Final;
    message: string;
    messageColor: QaColor;
    finalStepMessageParams: {
      [k: string]: string | number;
    };
    messages?: {
      message: string;
      messageColor: QaColor;
    }[];
  };
}

export type QaStickerStepResponse = {
  allowNextStep: boolean;
  message: string;
  messageParams: { [key: string]: number | string };
  messageColor: QaColor;
  additionalMessage: string | null;
  unitStatus: ItemTransitionStatus;
  statusDescription: string;
  isRejectWithoutConfirming: boolean;
  isQaSuccessAll: boolean;
  // newFinalStepPreviewUrl: string;
};

export namespace QaStickerVerifyStickerGroupApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    verifyBarcode: string;
  };
  export type Response = QaStickerStepResponse;
}

export namespace QaStickerScanCooApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    cooId: number;
  };
  export type Response = QaStickerStepResponse;
}

export namespace QaStickerScanPackageApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    labelPrinterId: number;
    packageId: number;
  };
  export type Response = QaStickerStepResponse & StepFinalCustomModel;
}

export namespace QaStickerResetStickerGroupApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    barcodeGroup: string;
    type: number;
  };
  export type Response = QaStickerStepResponse;
}

export namespace QaStickerConfirmRejectStickerGroupApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    barcodeGroup: string;
    confirmBarcode: string;
  };
  export type Response = QaStickerStepResponse;
}

export namespace QaStickerPrintShipLabelApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    labelPrinterId: number;
    laserPrinterId: number;
  };
  export type Response = QaStickerStepResponse;
}

export namespace QaStickerScanTrackingNumberApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    trackingNumber: string;
  };
  export type Response = QaStickerStepResponse;
}

export namespace QaStickerViewRejectsApi {
  export type ResponseItem = {
    rejectReason: string;
    printStationName: null;
    printedBy: null;
    printedOnUtc: null;
    qaStation: string;
    qaBy: string;
    qaOnUtc: Date;
  };

  export type Response = ResponseItem[];
}
