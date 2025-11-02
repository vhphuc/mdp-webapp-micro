import { QaStepGroup } from '../../../data-access/model/common/enum/qa-step-group';
import { QaPrintScanAction } from '../../../data-access/model/common/enum/qa-print-scan-action';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';
import { QaPrintBarcodeLocation } from '../../../data-access/model/common/enum/qa-print-barcode-location';
import { QaColor } from '../../../data-access/model/common/enum/qa-color';
import { ApiMessageParams } from '@shared/data-access/model/api/response';
import { QaLeadRejectScanAction } from '../../../data-access/model/common/enum/qa-lead-reject-scan-action';
import { QaLeadRejectBarcodeType } from '../../../data-access/model/common/enum/qa-lead-reject-barcode-type';
import { EOrderDetailActualPrintType } from '../../../data-access/model/common/enum/order-detail-actual-print-type';

export type QaReviewBarcode = {
  location: QaPrintBarcodeLocation;
  type: QaPrintScanAction;
  barcode: string;
};

export namespace QaScanItemApi {
  export type Response = {
    orderId: number;
    partnerId: number;
    customPartnerId: string;
    xid: string;
    slaDateOnUtc: Date;
    isPriority: boolean;
    isEmbroideredPrint: boolean;
    shippingAlert: string | null;
    isVipOrder: boolean;
    xqc: boolean;
    qaLeadRejectReviewBarcodes: QaLeadRejectReviewBarcode[];
    coos: QaCoo[];
    sizes: { id: number; name: string; description: string; seqNo: number }[];
    steps: QaScanStep[];
    isNotRequiredCI: boolean;
    isJit: boolean;
    isPrintCustomInsert: boolean;
  };

  export type QaScanStep = {
    groupType: QaStepGroup;
    isIgnoreScan: boolean;
    isScanned: boolean;
    isViewOnly: boolean;

    // QaStepGroup.OrderDetailUnit
    scanningOrderDetailUnit: QaScanStepScanningOrderDetailUnit;

    // QaStepGroup.Package
    scanningPackages: QaScanStepScanningPackages;

    // QaStepGroup.PackagePickInsert, QaStepGroup.PackagePrintInsert, QaStepGroup.SockTrim
    scanningPackageInsert: QaScanStepScanningPackageInsert;

    // QaStepGroup.TrackingNumber
    scanningTrackingNumber: QaScanStepScanningTrackingNumber;

    // QaStepGroup.ConfirmSockTrim
    scanningConfirmTrim: QaScanStepScanningConfirmSockTrim | null;

    // QsStepGroup.Final
    message?: string;
    messageColor?: QaColor;
    finalStepMessageParams?: {
      [k: string]: string | number;
    };
    messages?: {
      message: string;
      messageColor: QaColor;
    }[];
  };

  export type QaScanStepScanningConfirmSockTrim = {
    reviewBarcodes: QaReviewBarcode[];
  };

  export type QaScanStepScanningOrderDetailUnit = {
    orderDetailId: number;
    orderDetailUnitId: number;
    barcode: string;
    status: ItemTransitionStatus;
    statusDescription: string;
    sku: string;
    styleDesc: string;
    colorName: string;
    sizeCode: string;
    sizeClassName: string;
    isRejectWithoutConfirming: boolean; // haven't used in qa
    rejectedCount: number;
    isQaSuccessAll: boolean; // not use in qa
    coo: QaCoo | null;
    isAllowChangeCoo: boolean;
    isDtfAccessory: boolean;
    isSockPrint: boolean;
    attributes: ScanningOrderDetailUnitAttribute[];
    additionalAttributes: ScanningOrderDetailUnitAttribute[];
    customNumber: string;
    customName: string;
    preQrCode: string | null;
  } | null;

  export type QaScanStepScanningPackages = {
    scannedPackage: {
      id: number;
      name: string;
      barcode: string;
      systemSku: string;
      imageUrl: string;
    } | null;
    packages: {
      id: number;
      name: string;
      barcode: string;
      systemSku: string;
      imageUrl: string;
    }[];
  } | null;

  export type QaScanStepScanningPackageInsert = {
    id: number;
    requiredPackageBarcodes: string[] | null;
    name: string;
    barcode: string;
    imageUrl: string;
    binName: string | null;
  } | null;

  export type QaScanStepScanningTrackingNumber = {
    trackingNumber: string;
  } | null;

  export type ScanningOrderDetailUnitAttribute = {
    isNoDesign: boolean;
    isReadyForQa: boolean;
    actualPrintType: EOrderDetailActualPrintType | null;
    orderDetailAttributeId: number;
    locationCode: string;
    locationName: string;
    locationDescription: string;
    locationStatus: ItemTransitionStatus | null;
    previewUrl: string;
    fileUrl: string;
    scanAction: QaPrintScanAction | null;
    nextStationAlert: string | null;
    nextStationAlertParams: ApiMessageParams;
    reviewBarcodes: QaReviewBarcode[];
    qualityResults: Array<QaQualityResult> | null;
  };

  export type QaCoo = { id: number; name: string; code: string; cooImageUrl: string | null; transformName: string };

  export type QaLeadRejectReviewBarcode = {
    type: QaLeadRejectScanAction;
    barcode: string;
    description: string;
    barcodeType: QaLeadRejectBarcodeType;
  };

  export type QaQualityResult = {
    id: number;
    result: string;
    time: string;
    imageUrl: string | null;
    issues: Array<{
      typeDescription: string;
      expected: string;
      detected: string;
    }>;
  };
}

export type QaScanStepApiResponse = {
  allowNextStep: boolean;
  message: string;
  messageColor: QaColor;
  messageParams?: { [k: string]: string | number } | null;
  unitStatus: ItemTransitionStatus;
  statusDescription: string;
  isRejectWithoutConfirming: boolean;
  isQaSuccessAll: boolean;
};
export type StepFinalCustomModel = {
  finalStepCustomModel: {
    additionalParams: { [k: string]: string | number };
    customFinalMessages: {
      message: string;
      messageColor: QaColor;
    }[];
  } | null;
};

export namespace QaPrintPickTicketApi {
  export type Body = {
    stationId: number;
    factoryId: number;
    printerId: number;
  };
  export type Response = {
    isAllowNextStep: boolean;
    message: string;
    messageParams?: { [k: string]: string | number } | null;
    messageColor: QaColor;
    unitStatus: number;
    statusDescription: string;
    isRejectWithoutConfirming: boolean;
  };
}

export namespace QaScanSizeApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    sizeId: number;
  };

  export type Response = QaScanStepApiResponse;
}

export namespace QaScanVerifyLocationApi {
  /*
   * @verifyItems Front or Back, NeckLabel and Patch if any
   * */
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    verifyItems: RequestBody__VerifyItem[];
  };

  export type RequestBody__VerifyItem = {
    orderItemAttributeId: number;
    reviewBarcode: string;
  };

  export type Response = QaScanStepApiResponse & StepFinalCustomModel;
}

export namespace QaScanVerifySockBarcodeApi {
  export type Body = {
    stationId: number;
    factoryId: number;
    verifyBarcode: string;
  };

  export type Response = {
    isAllowNextStep: boolean;
    message: string;
    messageParams?: { [k: string]: string | number } | null;
    messageColor: QaColor;
    unitStatus: number;
    statusDescription: string;
    isRejectWithoutConfirming: boolean;
  };
}

export namespace QaScanSockTrimApi {
  export type Body = {
    stationId: number;
    factoryId: number;
    verifyBarcode: string;
  };

  export type Response = {
    isAllowNextStep: boolean;
    message: string;
    messageParams: { [k: string]: string | number };
    messageColor: QaColor;
    unitStatus: number;
    statusDescription: string;
    isRejectWithoutConfirming: boolean;
  };
}

export namespace QaScanCooApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
    cooId: number;
  };

  export type Response = QaScanStepApiResponse & StepFinalCustomModel;
}

export namespace QaScanPackageApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    id: number;
    labelPrinterId: number;
  };

  export type Response = QaScanStepApiResponse;
}

export namespace QaScanPackageInsertApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    id: number;
  };

  export type Response = QaScanStepApiResponse;
}

export namespace QaScanTrackingNumberApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    trackingNumber: string;
  };

  export type Response = QaScanStepApiResponse;
}

export namespace QaPrintShipLabelApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    labelPrinterId: number;
    laserPrinterId: number;
  };

  export type Response = QaScanStepApiResponse;
}

export namespace QaViewRejectsApi {
  export type ResponseItem = {
    rejectReason: string;
    printStationName: string;
    printedBy: string;
    printedOnUtc: Date;
    qaStation: string;
    qaBy: string;
    qaOnUtc: Date;
    qualityResultRejectHistoryModel: {
      imageUrl: string;
      resultCreatedOnUtc: string;
      qualityItemRejectHistoryModels: Array<{
        issueType: string;
        expectedValue: string;
        detectedValue: string;
      }>;
    } | null;
  };

  export type Response = ResponseItem[];
}

export namespace QaScanMugTicketApi {
  export type RequestBody = {
    stationId: number;
    factoryId: number;
  };
  export type Response = QaScanStepApiResponse;
}

export namespace QaPrintCustomInsertApi {
  export type RequestBody = {
    factoryId: number;
    stationId: number;
    labelPrinterId: number;
  };

  export type Response = QaScanStepApiResponse;
}
