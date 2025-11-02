import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { QaStore } from './data-access/qa.store';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaPreviewImage } from '../../data-access/model/ui/qa-preview-image';
import { QaScanItemApi } from './data-access/qa-api';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { QaPrintScanAction } from '../../data-access/model/common/enum/qa-print-scan-action';
import { ImageWidthPipe, ImageHeightPipe } from '../qa.pipe';
import { findLastIndex } from 'lodash-es';

@Component({
  selector: 'app-qa-left-image-panel',
  standalone: true,
  imports: [CommonModule, NzGridModule, ImgPreviewDirective, ScanBoardComponent, ImageErrorUrlDirective, ImageWidthPipe, ImageHeightPipe],
  template: `
    @if ($previewImages().length) {
      <div class="tw-flex tw-flex-wrap tw-gap-x-[4px] tw-slim-scrollbar tw-overflow-y-auto tw-max-h-[520px]">
        @for (image of $previewImages(); track image) {
          <div class="tw-basis-[calc(50%-4px)]">
            <app-scan-board [color]="image.color" [label]="image.label" class="tw-block">
              <div class="tw-h-[112px] tw-w-full tw-flex tw-flex-wrap tw-items-center tw-justify-center">
                @for (url of image.imageUrls; track url) {
                  <div
                    class="tw-flex tw-items-center tw-justify-center"
                    [ngStyle]="{
                      width: image.imageUrls.length | imageWidth,
                      height: image.imageUrls.length | imageHeight,
                    }">
                    <img [src]="url" class="tw-w-full tw-h-full tw-object-contain" appPreviewImage appImageErrorUrl />
                  </div>
                }
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
export class QaLeftImagePanelComponent {
  qaStore = inject(QaStore);
  $previewImages: Signal<QaPreviewImage[]> = this.qaStore.selectSignal(state => {
    const scanItemResp = state.scanItemResp;
    if (!scanItemResp) return [];

    const scanSteps = state.scanItemResp!.steps.filter(step => !step.isIgnoreScan);
    const isCurrentStepBeforeThisStep = (scanIndex: number): boolean => {
      // is not scanned all previous steps -> the scan index is not currently being scanned
      const hasApiStepMsg = !!state.apiStepMsg;
      const isShippingAlert = !!scanItemResp.shippingAlert;
      if (hasApiStepMsg || isShippingAlert) return true;

      if (scanIndex === 0) return false;
      const isAllPreviousStepsScanned = scanSteps.filter((_, index) => index < scanIndex).every(st => st.isScanned);

      return !isAllPreviousStepsScanned;
    };

    const isLastSockTrimStep = (scanIndex: number): boolean => {
      const lastSockTrimStepIndex = findLastIndex(scanSteps, (step: QaScanItemApi.QaScanStep) => step.groupType === QaStepGroup.SockTrim);
      return lastSockTrimStepIndex === scanIndex;
    };

    const isCurrentStepConfirmSockTrim = (): boolean => {
      return this.qaStore.$currentScanStep()?.groupType === QaStepGroup.ConfirmSockTrim;
    };

    const images: QaPreviewImage[] = [];
    for (let scanIndex = 0; scanIndex < scanSteps.length; scanIndex++) {
      const step = scanSteps[scanIndex];

      switch (step.groupType) {
        case QaStepGroup.Size:
          break;
        case QaStepGroup.DtfNeckLabelUnit:
        case QaStepGroup.OrderDetailUnit:
          this.handleStepOduImage(images, step, isCurrentStepBeforeThisStep(scanIndex));
          break;
        case QaStepGroup.Package:
          this.handleStepPackageImage(images, step, isCurrentStepBeforeThisStep(scanIndex));
          break;
        case QaStepGroup.PackagePrintInsert:
        case QaStepGroup.PackagePickInsert: {
          this.handleStepPackageInsertImage(images, step, isCurrentStepBeforeThisStep(scanIndex));
          break;
        }
        case QaStepGroup.SockTrim:
          this.handleStepSockTrimImage(
            images,
            step,
            isCurrentStepBeforeThisStep(scanIndex),
            isCurrentStepConfirmSockTrim(),
            isLastSockTrimStep(scanIndex)
          );
          break;
        case QaStepGroup.ConfirmSockTrim:
        case QaStepGroup.Coo:
        case QaStepGroup.TrackingNumber:
        case QaStepGroup.Final:
          break;
      }
    }

    return images;
  });

  handleStepOduImage(images: QaPreviewImage[], step: QaScanItemApi.QaScanStep, isCurrentStepBeforeThisStep: boolean) {
    const getScanActionColor = (attr: QaScanItemApi.ScanningOrderDetailUnitAttribute): 'green' | 'red' | 'white' | 'yellow' => {
      if (step.isViewOnly) return 'white';
      switch (attr.scanAction) {
        case QaPrintScanAction.Accept:
          return 'green';
        case QaPrintScanAction.Reject:
        case QaPrintScanAction.SendToWash:
          return 'red';
        case null:
          return attr.isReadyForQa ? 'yellow' : 'white';
      }
    };
    const mapPreviewImage = (attr: QaScanItemApi.ScanningOrderDetailUnitAttribute) => ({
      label: attr.locationDescription,
      color: getScanActionColor(attr),
      imageUrls: [attr.previewUrl],
    });

    if (step.isScanned || step.isViewOnly || isCurrentStepBeforeThisStep) {
      images.push(
        ...step.scanningOrderDetailUnit!.attributes.map(mapPreviewImage),
        ...step.scanningOrderDetailUnit!.additionalAttributes.map(mapPreviewImage)
      );
      return;
    }

    // handle if currently scanning

    const currScan = this.qaStore.$currentOduStepScans();
    const currScanAttrIds = currScan.map(x => x.orderDetailAttributeId);

    const attributes = step
      .scanningOrderDetailUnit!.attributes.filter(attr => !currScanAttrIds.includes(attr.orderDetailAttributeId))
      .map(mapPreviewImage);
    const additionalAttributes = step
      .scanningOrderDetailUnit!.additionalAttributes.filter(attr => !currScanAttrIds.includes(attr.orderDetailAttributeId))
      .map(mapPreviewImage);

    images.push(...attributes, ...additionalAttributes);
  }

  handleStepPackageImage(images: QaPreviewImage[], step: QaScanItemApi.QaScanStep, isCurrentStepBeforeThisStep: boolean) {
    // show white if not currently scanning
    // show green if scanned
    // don't show if currently scanning
    if (step.isScanned) {
      const scannedPackage = step.scanningPackages!.scannedPackage!;
      images.push({
        label: 'Package',
        color: 'green',
        imageUrls: [scannedPackage.imageUrl],
      });
    } else if (step.isViewOnly || isCurrentStepBeforeThisStep) {
      images.push({
        label: 'Packages',
        color: 'white',
        imageUrls: step.scanningPackages!.packages.map(p => p.imageUrl),
      });
    }
  }

  handleStepPackageInsertImage(images: QaPreviewImage[], step: QaScanItemApi.QaScanStep, isCurrentStepBeforeThisStep: boolean) {
    // only need to scan package insert if not required package barcode or required package barcode is accepted
    // show white if not currently scanning
    // don't show if currently scanning
    // show green if scanned
    if (isCurrentStepBeforeThisStep || step.isScanned || step.isViewOnly) {
      const insert = step.scanningPackageInsert!;
      images.push({
        label: insert.name,
        color: step.isScanned && !step.isViewOnly ? 'green' : 'white',
        imageUrls: [insert.imageUrl],
      });
    }
  }

  handleStepSockTrimImage(
    images: QaPreviewImage[],
    thisStep: QaScanItemApi.QaScanStep,
    isCurrentStepBeforeThisStep: boolean,
    isCurrentStepConfirmSockTrim: boolean,
    isThisStepLastSockTrimStep: boolean
  ) {
    if (isCurrentStepBeforeThisStep || thisStep.isViewOnly) {
      const insert = thisStep.scanningPackageInsert!;
      images.push({
        label: insert.name,
        color: 'white',
        imageUrls: [insert.imageUrl],
      });
    } else if (thisStep.isScanned) {
      if (isCurrentStepConfirmSockTrim) {
        // Step ConfirmSockTrim will show the last Sock Trim image in main panel
        // so dont show the last Sock Trim image on the left panel
        if (!isThisStepLastSockTrimStep) {
          const insert = thisStep.scanningPackageInsert!;
          images.push({
            label: insert.name,
            color: 'green',
            imageUrls: [insert.imageUrl],
          });
        }
      } else {
        const insert = thisStep.scanningPackageInsert!;
        images.push({
          label: insert.name,
          color: 'green',
          imageUrls: [insert.imageUrl],
        });
      }
    }
  }

  protected readonly Math = Math;
}
