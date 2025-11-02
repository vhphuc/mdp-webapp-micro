import { QaPrintScanAction } from '../../../qa/data-access/model/common/enum/qa-print-scan-action';

export function getScanActionColor(scanAction: QaPrintScanAction | null, isQaReady: boolean): 'green' | 'red' | 'white' | 'yellow' {
  switch (scanAction) {
    case QaPrintScanAction.Accept:
      return 'green';
    case QaPrintScanAction.Reject:
    case QaPrintScanAction.SendToWash:
      return 'red';
    case null:
      return isQaReady ? 'yellow' : 'white';
  }
}
