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
  selector: 'app-qa-step-package',
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
          <label for="scan-package-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_PACKAGE' | translate }}</label>
        </div>
        <div nz-col nzFlex="auto">
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
      <app-qa-scan-control-error />
      <app-qa-rejected-message />
      <div class="tw-flex tw-gap-2 tw-flex-1">
        <app-scan-board color="white" [label]="'PACKAGE' | translate" class="tw-flex-1">
          <div class="tw-flex-1 tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-y-2">
            <div
              *ngFor="let onePackage of $stepPackage().scanningPackages!.packages"
              class="tw-flex tw-flex-col tw-items-center tw-gap-3"
              [ngClass]="{
                'tw-w-2/3': $stepPackage().scanningPackages!.packages.length === 1,
                'tw-w-1/2': $stepPackage().scanningPackages!.packages.length === 2,
                'tw-w-1/3': $stepPackage().scanningPackages!.packages.length > 2,
              }"
              [class]="$stepPackage().scanningPackages!.packages.length > 3 ? 'tw-h-1/2' : 'tw-h-full'">
              <app-svg-barcode [barcode]="onePackage.barcode"></app-svg-barcode>
              <img
                [src]="onePackage.imageUrl"
                alt="{{ onePackage.name }}"
                class="tw-w-full tw-max-h-80 tw-object-contain tw-object-top"
                appPreviewImage
                appImageErrorUrl />
            </div>
          </div>
        </app-scan-board>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStepPackageComponent {
  qaStore = inject(QaStore);
  $stepPackage = this.qaStore.$currentScanStep as Signal<QaScanItemApi.QaScanStep>; // cast non null bcz not nullable in here

  scanPackageControl = new FormControl('', { nonNullable: true });
  
  ngOnInit() {
    if(this.qaStore.$isPrintCustomInsert()){
      this.qaStore.printCustomInsert();
    }
  }

  scanPackage() {
    const scanPackage = this.scanPackageControl.value.toUpperCase();
    this.scanPackageControl.reset();

    const onePackage = this.$stepPackage().scanningPackages!.packages.find(p => p.barcode === scanPackage || p.systemSku === scanPackage);
    if (onePackage) {
      this.qaStore.scanPackage({ packageId: onePackage.id });
    } else {
      this.qaStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanPackage },
        },
      });
    }
  }
}
