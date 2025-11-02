import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadStore } from '../../data-access/qa-lead.store';
import { NzButtonModule } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-qa-lead-scan-control-error',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzTypographyModule, TranslateModule, NzButtonModule],
  template: `
    <div nz-row nzGutter="30" class="tw-h-20 tw-my-2">
      <div nz-col nzSpan="16" nzOffset="4">
        <span nz-typography nzType="danger" class="tw-text-2xl tw-font-bold" *ngIf="$controlError()">{{
          $controlError()!.errorKey | translate: $controlError()?.paramError
        }}</span>
      </div>
      <div nz-col nzSpan="16" nzOffset="4">
        @if ($scanItemResp() && this.qaLeadStore.$showRemoveShipAlert()) {
          <button nz-button nzType="primary" nzSize="small" (click)="onRemoveShipAlert($scanItemResp()?.orderId?.toString())">
            {{ 'QA.REMOVE_SHIP_ALERT' | translate }}
          </button>
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadScanControlErrorComponent {
  qaLeadStore = inject(QaLeadStore);
  $controlError = this.qaLeadStore.$controlError;
  $scanItemResp = this.qaLeadStore.$scanItemResp;

  onRemoveShipAlert(orderId: string | undefined) {
    if (orderId !== undefined) {
      this.qaLeadStore.removeShipAlert({ orderId });
    }
  }
}
