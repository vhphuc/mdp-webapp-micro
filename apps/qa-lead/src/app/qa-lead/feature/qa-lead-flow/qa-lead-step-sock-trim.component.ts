import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadRejectedMessageComponent } from "./qa-lead-rejected-message.component";
import { QaLeadScanControlErrorComponent } from "./ui/component/qa-lead-scan-control-error.component";
import { QaScanItemApi } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { SvgBarcodeComponent } from '@shared/ui/component/svg-barcode.component';

@Component({
  selector: 'app-qa-lead-step-sock-trim',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    KeepFocusDirective,
    ImgPreviewDirective,
    ImageErrorUrlDirective,
    QaLeadScanControlErrorComponent,
    QaLeadRejectedMessageComponent,
    ScanBoardComponent,
    SvgBarcodeComponent,
],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
      <div nz-row nzGutter="30">
        <div nz-col nzFlex="300px" class="tw-text-right">
          <label for="scan-package-insert-input" class="tw-font-semibold tw-text-xl"
            >{{ 'QA.SCAN' | translate }} {{ '_TRIM' | translate }}</label
          >
        </div>
        <div nz-col nzFlex="auto">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="scan-sock-trim-input"
            nzSize="large"
            appKeepFocus
            focusOnInitOnly
            placeholder="{{ 'QA.SCAN' | translate }} {{ '_TRIM' | translate }}"
            [formControl]="scanControl"
            (keyup.enter)="scan()" />
        </div>
      </div>
      <app-qa-lead-scan-control-error />
      <app-qa-lead-rejected-message />
      <div class="tw-flex-1 tw-flex tw-flex-col">
        <app-scan-board color="white" [label]="stepSockTrim().scanningPackageInsert!.name" class="tw-flex-1">
          <div class="tw-flex tw-gap-x-2 tw-justify-center tw-mb-3">
            <div class="tw-border tw-border-solid tw-py-2 tw-px-8 tw-text-gray-500">
              <span class="tw-font-semibold">{{ '_TRIM' | uppercase | translate }}</span>
            </div>
            <div class="tw-border tw-border-solid tw-py-2 tw-px-8 tw-text-gray-500">
              <span class="tw-font-semibold">{{ stepSockTrim().scanningPackageInsert!.binName }}</span>
            </div>
          </div>
          <div class="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-gap-3">
            <app-svg-barcode [barcode]="stepSockTrim().scanningPackageInsert!.barcode"></app-svg-barcode>
            <div class="tw-image-fill tw-flex-1 tw-w-full">
              <img [src]="stepSockTrim().scanningPackageInsert!.imageUrl" appPreviewImage appImageErrorUrl />
            </div>
          </div>
        </app-scan-board>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStepSockTrimComponent {
  qaLeadStore = inject(QaLeadStore);
  stepSockTrim = this.qaLeadStore.$currentScanStep as Signal<QaScanItemApi.QaScanStep>; // cast non null bcz not nullable in here

  scanControl = new FormControl('', { nonNullable: true });

  scan() {
    const scanValue = this.scanControl.value.toUpperCase().trim();
    this.scanControl.reset();

    const insert = this.stepSockTrim().scanningPackageInsert!;
    if (scanValue === insert.barcode.toUpperCase()) {
      this.qaLeadStore.scanSockTrim(insert.id);
    } else {
      this.qaLeadStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanValue },
        },
      });
    }
  }
}
