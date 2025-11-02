import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadRejectedMessageComponent } from './qa-lead-rejected-message.component';
import { QaLeadScanControlErrorComponent } from './ui/component/qa-lead-scan-control-error.component';

@Component({
  selector: 'app-qa-lead-step-coo',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
    QaLeadRejectedMessageComponent,
    QaLeadScanControlErrorComponent,
  ],
  template: `
    <div class="">
      <div nz-row nzGutter="30">
        <div nz-col nzFlex="300px" class="tw-text-right">
          <label for="scan-coo-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_COO' | translate }}</label>
        </div>
        <div nz-col nzFlex="auto">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="scan-coo-input"
            nzSize="large"
            appKeepFocus
            focusOnInitOnly
            [placeholder]="'QA.SCAN_COO' | translate"
            [formControl]="scanCooControl"
            (keyup.enter)="scanCoo()" />
        </div>
      </div>
      <app-qa-lead-scan-control-error />
      <app-qa-lead-rejected-message />
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStepCooComponent {
  qaLeadStore = inject(QaLeadStore);
  $coo = this.qaLeadStore.selectSignal(s => s.scanItemResp!.coos);

  scanCooControl = new FormControl('', { nonNullable: true });

  scanCoo() {
    const scanCoo = this.scanCooControl.value.toUpperCase();
    this.scanCooControl.reset();

    const coo = this.$coo().find(c => c.code === scanCoo);
    if (coo) {
      this.qaLeadStore.scanCoo({ coo });
    } else {
      this.qaLeadStore.patchState({
        controlError: {
          errorKey: 'QA.COO_INVALID',
          paramError: { coo: scanCoo },
        },
      });
    }
  }
}
