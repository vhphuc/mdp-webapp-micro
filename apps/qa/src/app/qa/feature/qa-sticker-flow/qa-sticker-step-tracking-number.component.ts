import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TranslateModule } from '@ngx-translate/core';
import { QaStickerScanControlErrorComponent } from './ui/component/qa-sticker-scan-control-error.component';
import { QaStickerStore } from './data-access/qa-sticker.store';

@Component({
  selector: 'app-qa-sticker-step-tracking-number',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KeepFocusDirective,
    NzGridModule,
    NzInputModule,
    TranslateModule,
    QaStickerScanControlErrorComponent,
    ReactiveFormsModule,
  ],
  template: `
    <div class="tw-bg-red-500 tw-text-center">
      <span class="tw-text-2xl tw-font-bold">{{ 'QA.SINGLE_PIECE_ORDER_OK_TO_SHIP' | translate }}</span>
    </div>

    <div class="tw-mt-2 tw-flex tw-gap-6">
      <div class="tw-w-[300px] tw-text-right">
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
    <app-qa-sticker-scan-control-error />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerStepTrackingNumberComponent implements OnInit {
  qaStickerStore = inject(QaStickerStore);

  scanTrackingNumberControl = new FormControl('', { nonNullable: true });

  ngOnInit() {
    this.qaStickerStore.printShipLabel();
  }

  scanTrackingNumber() {
    const scanTrackingNumber = this.scanTrackingNumberControl.value.toUpperCase().trim();
    this.scanTrackingNumberControl.reset();

    if (!scanTrackingNumber) return;

    this.qaStickerStore.scanTrackingNumber({ trackingNumber: scanTrackingNumber });
  }
}
