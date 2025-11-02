import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadRejectedMessageComponent } from './qa-lead-rejected-message.component';
import { QaLeadScanControlErrorComponent } from './ui/component/qa-lead-scan-control-error.component';
import { SvgBarcodeComponent } from '@shared/ui/component/svg-barcode.component';
import { QaScanItemApi } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import QaScanStep = QaScanItemApi.QaScanStep;

@Component({
  selector: 'app-qa-lead-step-package-insert',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    ScanBoardComponent,
    TranslateModule,
    KeepFocusDirective,
    ImgPreviewDirective,
    ImageErrorUrlDirective,
    QaLeadRejectedMessageComponent,
    QaLeadScanControlErrorComponent,
    SvgBarcodeComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full ">
      <div nz-row nzGutter="30">
        <div nz-col nzFlex="300px" class="tw-text-right">
          <label for="scan-package-insert-input" class="tw-font-semibold tw-text-xl"
            >{{ 'QA.SCAN' | translate }} {{ $stepInsert().scanningPackageInsert!.name }}</label
          >
        </div>
        <div nz-col nzFlex="auto">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="scan-package-insert-input"
            nzSize="large"
            appKeepFocus
            focusOnInitOnly
            [placeholder]="'QA.PACKAGE_INSERT' | translate"
            [formControl]="scanInsertControl"
            (keyup.enter)="scanInsert()" />
        </div>
      </div>

      <app-qa-lead-scan-control-error />
      <app-qa-lead-rejected-message />

      <div class="tw-flex-1 tw-flex tw-flex-col">
        <app-scan-board color="white" [label]="$stepInsert().scanningPackageInsert!.name" class="tw-flex-1">
          <div class="tw-flex-1 tw-flex tw-flex-col tw-items-center tw-gap-3">
            <app-svg-barcode [barcode]="$stepInsert().scanningPackageInsert!.barcode"></app-svg-barcode>
            <div class="tw-image-fill tw-flex-1 tw-w-full">
              <img [src]="$stepInsert().scanningPackageInsert!.imageUrl" appPreviewImage appImageErrorUrl />
            </div>
          </div>
        </app-scan-board>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStepPackageInsertComponent {
  qaLeadStore = inject(QaLeadStore);
  $stepInsert = this.qaLeadStore.$currentScanStep as Signal<QaScanStep>; // cast non null bcz not nullable in here
  $controlError = this.qaLeadStore.$controlError;

  scanInsertControl = new FormControl('', { nonNullable: true });

  scanInsert() {
    const scanInsert = this.scanInsertControl.value.toUpperCase();
    this.scanInsertControl.reset();

    const insert = this.$stepInsert().scanningPackageInsert!;
    if (scanInsert === insert.barcode.toUpperCase()) {
      this.qaLeadStore.scanPackageInsert({ packageInsertId: insert.id });
    } else {
      this.qaLeadStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanInsert },
        },
      });
    }
  }
}
