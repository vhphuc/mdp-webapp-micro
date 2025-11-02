import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { MugStore } from '../../data-access/store/mug-store.store';

@Component({
  selector: 'app-mug-control-error',
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
export class MugControlErrorComponent {
  mugStore = inject(MugStore);
  $controlError = this.mugStore.selectSignal(s => s.controlError);
}
