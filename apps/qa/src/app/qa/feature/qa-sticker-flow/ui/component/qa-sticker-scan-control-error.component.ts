import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { QaStickerStore } from '../../data-access/qa-sticker.store';

@Component({
  selector: 'app-qa-sticker-scan-control-error',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzTypographyModule, TranslateModule],
  template: `
    <div class="tw-min-h-[80px] tw-mt-4 tw-flex tw-gap-6">
      <div class="tw-w-1/6"></div>
      <div class="tw-flex-1">
        <span nz-typography nzType="danger" class="tw-text-2xl tw-font-bold" *ngIf="$controlError() as err">{{
          err.errorKey | translate : err.paramError
        }}</span>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerScanControlErrorComponent {
  qaStickerStore = inject(QaStickerStore);
  $controlError = this.qaStickerStore.selectSignal(s => s.controlError);
}
