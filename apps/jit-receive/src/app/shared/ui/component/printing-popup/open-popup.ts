import { NzModalRef, NzModalService } from 'ng-zorro-antd/modal';
import { PrintingPopupComponent } from '@shared/ui/component/printing-popup/printing-popup.component';

export type PrintingPopupMsg = { key: string; params?: { [key: string]: number | string } };

export function openPrintingPopup(nzModalSvc: NzModalService, message: PrintingPopupMsg): NzModalRef {
  return nzModalSvc.create({
    nzContent: PrintingPopupComponent,
    nzData: message,
    nzWidth: '800px',
    nzClosable: false,
    nzMaskClosable: false,
    nzFooter: null,
    nzBodyStyle: { padding: '0' },
  });
}
