import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { QaPreviewImage } from '../../data-access/model/ui/qa-preview-image';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaStickerStore } from './data-access/qa-sticker.store';
import { QaStickerScanSheetApi } from './data-access/qa-sticker-api';
import { QaPrintScanAction } from '../../data-access/model/common/enum/qa-print-scan-action';

@Component({
  selector: 'app-qa-sticker-left-image-panel',
  standalone: true,
  imports: [CommonModule, ImageErrorUrlDirective, ImgPreviewDirective, ScanBoardComponent],
  template: `
    @if ($previewImages().length) {
      <div class="tw-flex tw-flex-wrap tw-gap-x-[4px] tw-slim-scrollbar tw-overflow-y-auto tw-max-h-[520px]">
        @for (image of $previewImages(); track image) {
          <div class="tw-basis-[calc(50%-4px)]">
            <app-scan-board [color]="image.color" [label]="image.label" class="tw-block">
              <div class="tw-h-[112px] tw-w-full tw-flex tw-flex-wrap tw-items-center tw-justify-center">
                <div
                  *ngFor="let url of image.imageUrls"
                  class="tw-flex tw-items-center tw-justify-center"
                  [ngClass]="{
                    'tw-w-2/3': image.imageUrls.length === 1,
                    'tw-w-1/2': image.imageUrls.length === 2,
                    'tw-w-1/3': image.imageUrls.length > 2,
                    'tw-h-1/2': image.imageUrls.length > 3,
                    'tw-h-full': image.imageUrls.length <= 3
                  }">
                  <img [src]="url" class="tw-w-full tw-h-full tw-object-contain" appPreviewImage appImageErrorUrl />
                </div>
              </div>
            </app-scan-board>
          </div>
        }
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerLeftImagePanelComponent {
  qaStickerStore = inject(QaStickerStore);
  $previewImages: Signal<QaPreviewImage[]> = this.qaStickerStore.selectSignal(state => {
    const sheet = state.sheet;
    if (!sheet) return [];

    const scanSteps = sheet.steps.filter(step => !step.isIgnoreScan);
    const isCurrentStepBeforeThisStep = (scanIndex: number): boolean => {
      // is not scanned all previous steps -> the scan index is not currently being scanned
      const hasApiStepMsg = !!state.apiStepMsg;
      const isShippingAlert = !!sheet.shippingAlert;
      if (hasApiStepMsg || isShippingAlert) return true;

      if (scanIndex === 0) return false;
      const isAllPreviousStepsScanned = scanSteps.filter((_, index) => index < scanIndex).every(st => st.isScanned);

      return !isAllPreviousStepsScanned;
    };

    const images: QaPreviewImage[] = [];
    for (let scanIndex = 0; scanIndex < scanSteps.length; scanIndex++) {
      const step = scanSteps[scanIndex];

      switch (step.groupType) {
        case QaStepGroup.StickerGroup:
          this.handleStepGroupBarcodeImage(images, step);
          break;
        case QaStepGroup.Package:
          this.handleStepPackageImage(images, step, isCurrentStepBeforeThisStep(scanIndex));
          break;
      }
    }

    return images;
  });

  handleStepGroupBarcodeImage(images: QaPreviewImage[], step: QaStickerScanSheetApi.QaStickerStepStickerGroup) {
    if (this.qaStickerStore.$currGroupBarcode() === step.scanningStickerGroup.barcode) return;
    const attr = step.scanningStickerGroup.attribute;
    let color!: QaPreviewImage['color'];
    if (step.isViewOnly) color = 'white';
    if (attr.scanAction === QaPrintScanAction.Reject) color = 'red';
    if (attr.scanAction === QaPrintScanAction.Accept) color = 'green';
    if (attr.scanAction === null) color = attr.isReadyForQa ? 'yellow' : 'white';

    images.push({
      label: attr.locationName,
      color: color,
      imageUrls: [attr.fileUrl],
    });
  }

  handleStepPackageImage(images: QaPreviewImage[], step: QaStickerScanSheetApi.QaStickerStepPackage, isCurrentStepBeforeThisStep: boolean) {
    // show white if not currently scanning
    // show green if scanned
    // don't show if currently scanning
    if (step.isScanned) {
      const scannedPackage = step.scanningPackages.scannedPackage!;
      images.push({
        label: 'Package',
        color: 'green',
        imageUrls: [scannedPackage.imageUrl],
      });
    } else if (step.isViewOnly || isCurrentStepBeforeThisStep) {
      images.push({
        label: 'Packages',
        color: 'white',
        imageUrls: step.scanningPackages.packages.map(p => p.imageUrl),
      });
    }
  }
}
