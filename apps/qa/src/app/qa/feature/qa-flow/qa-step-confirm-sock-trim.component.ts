import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QaStore } from './data-access/qa.store';
import { QaScanItemApi } from './data-access/qa-api';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaRejectedMessageComponent } from './qa-rejected-message.component';
import { QaScanControlErrorComponent } from './ui/component/qa-scan-control-error.component';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { SvgBarcodeComponent } from '@shared/ui/component/svg-barcode.component';

@Component({
  selector: 'app-qa-step-confirm-sock-trim',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
    QaRejectedMessageComponent,
    QaScanControlErrorComponent,
    ScanBoardComponent,
    SvgBarcodeComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
      <div nz-row nzGutter="30">
        <div nz-col nzFlex="300px" class="tw-text-right">
          <label for="confirm-sock-trim-input" class="tw-font-semibold tw-text-xl"
            >{{ 'CONFIRM' | translate }} {{ '_TRIM' | translate }}</label
          >
        </div>
        <div nz-col nzFlex="auto">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="confirm-sock-trim-input"
            nzSize="large"
            appKeepFocus
            focusOnInitOnly
            placeholder="{{ 'CONFIRM' | translate }} {{ '_TRIM' | translate }}"
            [formControl]="scanControl"
            (keyup.enter)="scan()" />
        </div>
      </div>
      <app-qa-scan-control-error />
      <app-qa-rejected-message />
      <div class="tw-flex-1 tw-flex tw-flex-col">
        <app-scan-board color="green" [label]="stepConfirmSockTrim().scanningPackageInsert!.name" class="tw-flex-1">
          <div class="tw-flex tw-gap-x-2 tw-justify-center tw-mb-3">
            <div class="tw-border tw-border-solid tw-py-2 tw-px-8 tw-text-gray-500">
              <span class="tw-font-semibold">{{ '_TRIM' | uppercase | translate }}</span>
            </div>
            <div class="tw-border tw-border-solid tw-py-2 tw-px-8 tw-text-gray-500">
              <span class="tw-font-semibold">{{ stepConfirmSockTrim().scanningPackageInsert!.binName }}</span>
            </div>
          </div>
          <div class="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-gap-3">
            <app-svg-barcode [barcode]="stepConfirmSockTrim().scanningPackageInsert!.barcode"></app-svg-barcode>
            <div class="tw-image-fill tw-flex-1 tw-w-full">
              <img [src]="stepConfirmSockTrim().scanningPackageInsert!.imageUrl" appPreviewImage appImageErrorUrl />
            </div>
          </div>
        </app-scan-board>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStepConfirmSockTrimComponent {
  qaStore = inject(QaStore);
  stepConfirmSockTrim = this.qaStore.$currentScanStep as Signal<QaScanItemApi.QaScanStep>; // cast non null bcz not nullable in here

  scanControl = new FormControl('', { nonNullable: true });

  scan() {
    const scanValue = this.scanControl.value.toUpperCase().trim();
    this.scanControl.reset();

    const reviewBarcode = this.stepConfirmSockTrim().scanningConfirmTrim!.reviewBarcodes!.find(rb => rb.barcode.toUpperCase() === scanValue);
    if (reviewBarcode) {
      this.qaStore.scanConfirmSockTrim(scanValue);
    } else {
      this.qaStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanValue },
        },
      });
    }
  }
}
