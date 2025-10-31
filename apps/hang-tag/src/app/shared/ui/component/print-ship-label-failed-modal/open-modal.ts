import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PrintShipLabelFailedModalComponent } from './print-ship-label-failed-modal.component';

export function openPrintShipLabelFailedModal(
  nzModalSvc: NzModalService,
  message: string,
  onNo: () => void,
  onYes: () => void
): NzModalRef {
  return nzModalSvc.create({
    nzContent: PrintShipLabelFailedModalComponent,
    nzData: message,
    nzWidth: '500px',
    nzClosable: false,
    nzMaskClosable: false,
    nzFooter: [
      {
        label: 'No',
        type: 'default',
        onClick: onNo,
      },
      {
        label: 'Yes',
        type: 'primary',
        onClick: onYes,
      },
    ],
  });
}
