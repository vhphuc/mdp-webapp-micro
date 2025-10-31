import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NZ_MODAL_DATA } from 'ng-zorro-antd/modal';

@Component({
  selector: 'app-print-ship-label-failed-modal',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="tw-text-2xl tw-flex tw-flex-col tw-gap-3">
      <span>{{ message | translate }}</span>
      <span>{{ 'Retry?' | translate }}</span>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrintShipLabelFailedModalComponent {
  message: string = inject(NZ_MODAL_DATA);
}
