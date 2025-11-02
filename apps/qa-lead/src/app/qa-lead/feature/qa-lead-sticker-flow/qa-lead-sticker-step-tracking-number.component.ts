import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadStickerScanControlErrorComponent } from './ui/component/qa-lead-sticker-scan-control-error.component';
import { QaLeadStickerStore } from './data-access/qa-lead-sticker.store';

@Component({
  selector: 'app-qa-lead-sticker-step-tracking-number',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KeepFocusDirective,
    NzGridModule,
    NzInputModule,
    TranslateModule,
    QaLeadStickerScanControlErrorComponent,
    ReactiveFormsModule,
  ],
  template: `
    <div class="tw-bg-red-500 tw-text-center">
      <span class="tw-text-2xl tw-font-bold">{{ 'QA.SINGLE_PIECE_ORDER_OK_TO_SHIP' | translate }}</span>
    </div>

    <div class="tw-mt-2 tw-flex tw-gap-6">
      <div class="tw-w-[300px] tw-flex tw-items-center tw-justify-end">
        <label for="scan-tracking-number-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_TRACKING_#' | translate }}</label>
      </div>
      <div class="tw-flex-1">
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
    <app-qa-lead-sticker-scan-control-error />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStickerStepTrackingNumberComponent implements OnInit {
  qaLeadStickerStore = inject(QaLeadStickerStore);

  scanTrackingNumberControl = new FormControl('', { nonNullable: true });

  ngOnInit() {
    this.qaLeadStickerStore.printShipLabel();
  }

  scanTrackingNumber() {
    const scanTrackingNumber = this.scanTrackingNumberControl.value.toUpperCase().trim();
    this.scanTrackingNumberControl.reset();

    if (!scanTrackingNumber) return;

    this.qaLeadStickerStore.scanTrackingNumber({ trackingNumber: scanTrackingNumber });
  }
}
