import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrimStore } from '../../data-access/store/trim.store';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-trim-control-error',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzTypographyModule, TranslateModule],
  template: `
    <div class="tw-min-h-[80px] tw-my-2 tw-ml-[332px]">
      <span nz-typography nzType="danger" class="tw-text-2xl tw-font-bold" *ngIf="$controlError() as error">{{
        error.errorKey | translate : error.paramError
      }}</span>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimControlErrorComponent {
  trimStore = inject(TrimStore);
  $controlError = this.trimStore.selectSignal(s => s.controlError);
}
