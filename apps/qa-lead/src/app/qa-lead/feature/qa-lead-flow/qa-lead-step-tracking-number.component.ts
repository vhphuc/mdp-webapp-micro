import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaLeadRejectedMessageComponent } from './qa-lead-rejected-message.component';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadScanControlErrorComponent } from './ui/component/qa-lead-scan-control-error.component';

@Component({
  selector: 'app-qa-lead-step-tracking-number',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    NzIconModule,
    NzGridModule,
    NzInputModule,
    ReactiveFormsModule,
    NzTypographyModule,
    TranslateModule,
    KeepFocusDirective,
    QaLeadRejectedMessageComponent,
    QaLeadScanControlErrorComponent,
  ],
  template: `
    <div>
      <div class="tw-bg-red-500 tw-text-center">
        <span class="tw-text-2xl tw-font-bold">{{ 'QA.SINGLE_PIECE_ORDER_OK_TO_SHIP' | translate }}</span>
      </div>
      <div class="tw-bg-red-500 tw-text-center tw-mt-2" *ngIf="this.qaLeadStore.isNotRequiredCI">
        <span class="tw-text-2xl tw-font-bold tw-text-white">{{ 'QA.A_PRINTED_COMMERCIAL_INVOICE_IS_NOT_REQUIRED' | translate }}</span>
      </div>

      <div nz-row nzGutter="30" class="tw-mt-2">
        <div nz-col nzFlex="300px" class="tw-text-right">
          <label for="scan-package-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_TRACKING_#' | translate }}</label>
        </div>
        <div nz-col nzFlex="auto">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="scan-tracking-number-input"
            nzSize="large"
            appKeepFocus
            focusOnInitOnly
            [placeholder]="'QA.SCAN_TRACKING_#' | translate"
            [formControl]="scanTrackingNumberControl"
            (keyup.enter)="scanTrackingNumber()" />
        </div>
      </div>

      <app-qa-lead-scan-control-error />
      <app-qa-lead-rejected-message />
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStepTrackingNumberComponent implements OnInit {
  qaLeadStore = inject(QaLeadStore);

  scanTrackingNumberControl = new FormControl('', { nonNullable: true });

  ngOnInit() {
    this.qaLeadStore.printShipLabel();
  }

  scanTrackingNumber() {
    const scanTrackingNumber = this.scanTrackingNumberControl.value.toUpperCase();
    this.scanTrackingNumberControl.reset();

    this.qaLeadStore.scanTrackingNumber({ trackingNumber: scanTrackingNumber });
  }
}
