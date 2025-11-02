import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaLeadRejectedMessageComponent } from './qa-lead-rejected-message.component';
import { extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { QaLeadScanControlErrorComponent } from './ui/component/qa-lead-scan-control-error.component';
import { QaLeadStore } from './data-access/qa-lead.store';

@Component({
  selector: 'app-qa-lead-step-mug-ticket',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
    QaLeadScanControlErrorComponent,
    QaLeadRejectedMessageComponent,
    QaLeadScanControlErrorComponent,
  ],
  template: `
    <div nz-row nzGutter="30">
      <div nz-col nzFlex="300px" class="tw-text-right">
        <label for="scan-mug-ticket-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_MUG_TICKET' | translate }}</label>
      </div>
      <div nz-col nzFlex="auto">
        <input
          class="tw-w-3/5"
          type="text"
          nz-input
          id="scan-mug-ticket-input"
          nzSize="large"
          appKeepFocus
          focusOnInitOnly
          [placeholder]="'QA.SCAN_MUG_TICKET' | translate"
          [formControl]="scanControl"
          (keyup.enter)="scan()" />
      </div>
    </div>
    <app-qa-lead-scan-control-error />
    <app-qa-lead-rejected-message />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStepMugTicketComponent {
  qaLeadStore = inject(QaLeadStore);
  $barcode = this.qaLeadStore.$currBarcode as Signal<string>;

  scanControl = new FormControl('', { nonNullable: true });

  scan() {
    const scanValue = this.scanControl.value.toUpperCase();
    this.scanControl.reset();

    if (scanValue.startsWith('MUG') || extractUnitBarcode(scanValue) !== this.$barcode().toUpperCase()) {
      this.qaLeadStore.patchState({
        controlError: {
          errorKey: 'QA.ITEM_X1_IS_INVALID',
          paramError: { x1: scanValue },
        },
      });
      return;
    }

    this.qaLeadStore.scanMugTicket();
  }
}
