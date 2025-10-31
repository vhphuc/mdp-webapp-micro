import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';
import { PrintingPopupMsg } from '@shared/ui/component/printing-popup/open-popup';

@Component({
  selector: 'app-printing-popup',
  standalone: true,
  imports: [CommonModule, NzIconModule, TranslateModule],
  template: `
    <div class="tw:h-32 tw:p-5 tw:bg-primary tw:flex tw:items-center tw:text-white">
      <span nz-icon nzType="loading" nzTheme="outline" class="tw:text-2xl"></span>
      <span class="tw:font-bold tw:text-2xl tw:inline-block tw:ml-2">{{ message.key | translate : message.params }} ...</span>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .ant-modal-body {
        padding: 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintingPopupComponent {
  message: PrintingPopupMsg = inject(NZ_MODAL_DATA);
}
