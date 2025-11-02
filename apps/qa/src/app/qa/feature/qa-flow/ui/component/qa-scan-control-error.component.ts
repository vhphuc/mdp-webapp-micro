import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { QaStore } from '../../data-access/qa.store';

@Component({
  selector: 'app-qa-scan-control-error',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzTypographyModule, TranslateModule],
  template: `
    <div nz-row class="tw-h-20 tw-mt-4">
      <div nz-col nzSpan="16" nzOffset="4">
        <span nz-typography nzType="danger" class="tw-text-2xl tw-font-bold" *ngIf="$controlError()">{{
          $controlError()!.errorKey | translate : $controlError()?.paramError
        }}</span>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaScanControlErrorComponent {
  qaStore = inject(QaStore);
  $controlError = this.qaStore.$controlError;
}
