import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { SvgBarcodeComponent } from '@shared/ui/component/svg-barcode.component';
import { TranslateModule } from '@ngx-translate/core';
import { QaStickerScanControlErrorComponent } from './ui/component/qa-sticker-scan-control-error.component';
import { QaStickerStore } from './data-access/qa-sticker.store';
import { QaStickerScanSheetApi } from './data-access/qa-sticker-api';

@Component({
  selector: 'app-qa-sticker-step-package',
  standalone: true,
  imports: [
    CommonModule,
    ImageErrorUrlDirective,
    ImgPreviewDirective,
    KeepFocusDirective,
    NzInputModule,
    ReactiveFormsModule,
    ScanBoardComponent,
    SvgBarcodeComponent,
    TranslateModule,
    QaStickerScanControlErrorComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
      <div class="tw-flex tw-gap-6">
        <div class="tw-w-[300px] tw-text-right">
          <label for="scan-package-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_PACKAGE' | translate }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="scan-package-input"
            nzSize="large"
            appKeepFocus
            focusOnInitOnly
            [placeholder]="'QA.PACKAGE' | translate"
            [formControl]="scanPackageControl"
            (keyup.enter)="scanPackage()" />
        </div>
      </div>
      <app-qa-sticker-scan-control-error />
      <div class="tw-flex tw-gap-2 tw-flex-1">
        <app-scan-board color="white" [label]="'PACKAGE' | translate" class="tw-flex-1">
          <div class="tw-flex-1 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-y-2">
            @for (onePackage of $stepPackage().scanningPackages.packages; track onePackage.barcode) {
              <div
                class="tw-flex tw-flex-col tw-items-center tw-gap-3"
                [ngClass]="{
                  'tw-w-2/3': $stepPackage().scanningPackages.packages.length === 1,
                  'tw-w-1/2': $stepPackage().scanningPackages.packages.length === 2,
                  'tw-w-1/3': $stepPackage().scanningPackages.packages.length > 2,
                  'tw-h-1/2': $stepPackage().scanningPackages.packages.length > 3,
                  'tw-h-full': $stepPackage().scanningPackages.packages.length <= 3
                }">
                <app-svg-barcode [barcode]="onePackage.barcode"></app-svg-barcode>
                <img
                  [src]="onePackage.imageUrl"
                  class="tw-w-full tw-max-h-80 tw-object-contain tw-object-top"
                  appPreviewImage
                  appImageErrorUrl />
              </div>
            }
          </div>
        </app-scan-board>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerStepPackageComponent {
  qaStickerStore = inject(QaStickerStore);
  $stepPackage = this.qaStickerStore.$currentScanStep as Signal<QaStickerScanSheetApi.QaStickerStepPackage>;

  scanPackageControl = new FormControl('', { nonNullable: true });

  scanPackage() {
    const scanPackage = this.scanPackageControl.value.toUpperCase();
    this.scanPackageControl.reset();

    const matchingPackage = this.$stepPackage().scanningPackages.packages.find(p => p.barcode === scanPackage);
    if (matchingPackage) {
      this.qaStickerStore.scanPackage({ scannedPackage: matchingPackage });
    } else {
      this.qaStickerStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanPackage },
        },
      });
    }
  }
}
