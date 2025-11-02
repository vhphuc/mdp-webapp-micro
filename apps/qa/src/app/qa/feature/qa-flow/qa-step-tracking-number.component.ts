import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaStore } from './data-access/qa.store';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaRejectedMessageComponent } from './qa-rejected-message.component';
import { QaScanControlErrorComponent } from './ui/component/qa-scan-control-error.component';

@Component({
  selector: 'app-qa-step-tracking-number',
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
    QaRejectedMessageComponent,
    QaScanControlErrorComponent,
  ],
  template: `
    <div>
      <div class="tw-bg-red-500 tw-text-center">
        <span class="tw-text-2xl tw-font-bold">{{ 'QA.SINGLE_PIECE_ORDER_OK_TO_SHIP' | translate }}</span>
      </div>
      <div class="tw-bg-red-500 tw-text-center tw-mt-2" *ngIf="this.qaStore.isNotRequiredCI">
        <span class="tw-text-2xl tw-font-bold tw-text-white">{{ 'QA.A_PRINTED_COMMERCIAL_INVOICE_IS_NOT_REQUIRED' | translate }}</span>
      </div>
      <div nz-row nzGutter="30" class="tw-mt-2">
        <div nz-col nzFlex="300px" class="tw-text-right">
          <label for="scan-tracking-number-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_TRACKING_#' | translate }}</label>
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
      <app-qa-scan-control-error />
      <app-qa-rejected-message />
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStepTrackingNumberComponent implements OnInit {
  qaStore = inject(QaStore);

  scanTrackingNumberControl = new FormControl('', { nonNullable: true });

  ngOnInit() {
    this.qaStore.printShipLabel();
  }

  scanTrackingNumber() {
    const scanTrackingNumber = this.scanTrackingNumberControl.value.toUpperCase();
    this.scanTrackingNumberControl.reset();

    this.qaStore.scanTrackingNumber({ trackingNumber: scanTrackingNumber });
  }
}
