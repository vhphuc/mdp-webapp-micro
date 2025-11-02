import { QaStickerScanSheetApi } from '../feature/qa-sticker-flow/data-access/qa-sticker-api';
import { QaStepGroup } from '../data-access/model/common/enum/qa-step-group';

export function findStep(stepGrp: QaStepGroup) {
  return (st: QaStickerScanSheetApi.Response['steps'][number]) => {
    return st.groupType === stepGrp && !(st.isScanned || st.isIgnoreScan || st.isViewOnly);
  };
}

export function findStkGrp(groupBarcode: string) {
  return (st: QaStickerScanSheetApi.Response['steps'][number]) => {
    return st.groupType === QaStepGroup.StickerGroup && st.scanningStickerGroup.barcode === groupBarcode;
  };
}
