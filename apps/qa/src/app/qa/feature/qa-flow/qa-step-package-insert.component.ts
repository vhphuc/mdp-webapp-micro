import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { TranslateModule } from '@ngx-translate/core';
import { QaStore } from './data-access/qa.store';
import { QaScanItemApi } from './data-access/qa-api';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaRejectedMessageComponent } from './qa-rejected-message.component';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { QaScanControlErrorComponent } from './ui/component/qa-scan-control-error.component';
import { SvgBarcodeComponent } from '@shared/ui/component/svg-barcode.component';

@Component({
  selector: 'app-qa-step-package-insert',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    ScanBoardComponent,
    TranslateModule,
    KeepFocusDirective,
    QaRejectedMessageComponent,
    ImgPreviewDirective,
    ImageErrorUrlDirective,
    QaScanControlErrorComponent,
    SvgBarcodeComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
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
      <app-qa-scan-control-error />
      <app-qa-rejected-message />
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
export class QaStepPackageInsertComponent {
  qaStore = inject(QaStore);
  $stepInsert = this.qaStore.$currentScanStep as Signal<QaScanItemApi.QaScanStep>; // cast non null bcz not nullable in here

  scanInsertControl = new FormControl('', { nonNullable: true });

  scanInsert() {
    const scanInsert = this.scanInsertControl.value.toUpperCase();
    this.scanInsertControl.reset();

    const insert = this.$stepInsert().scanningPackageInsert!;
    if (scanInsert === insert.barcode.toUpperCase()) {
      this.qaStore.scanPackageInsert({ packageInsertId: insert.id });
    } else {
      this.qaStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanInsert },
        },
      });
    }
  }
}
