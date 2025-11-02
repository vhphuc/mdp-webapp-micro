import { QaLeadRejectScanAction } from '../enum/qa-lead-reject-scan-action';
import { QaLeadRejectBarcodeType } from '../enum/qa-lead-reject-barcode-type';

export type QaLeadRejectReviewBarcode = {
  type: QaLeadRejectScanAction;
  barcode: string;
  description: string;
  barcodeType: QaLeadRejectBarcodeType;
};
