import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { ImageZoomDirective } from '@shared/ui/directive/image-zoom.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { QaLeadScanControlErrorComponent } from './ui/component/qa-lead-scan-control-error.component';
import { QaLeadRejectedMessageComponent } from './qa-lead-rejected-message.component';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaScanItemApi, QaScanVerifyLocationApi } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { QaPrintBarcodeLocation } from 'src/app/qa-lead/data-access/model/common/enum/qa-print-barcode-location';
import { QaPrintScanAction } from 'src/app/qa-lead/data-access/model/common/enum/qa-print-scan-action';
import { getScanActionColor } from '../../util/helper';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { QaLeadResetLocationType } from 'src/app/qa-lead/data-access/model/common/enum/qa-lead-reset-location-type';
import { QaColor } from 'src/app/qa-lead/data-access/model/common/enum/qa-color';
import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { EOrderDetailActualPrintType } from 'src/app/qa-lead/data-access/model/common/enum/order-detail-actual-print-type';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import { AppAqcComponent } from '@shared/ui/component/app-aqc.component';
import { FitRemainHeightDirective } from '@shared/ui/directive/fit-remaining-height.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import ScanningOrderDetailUnitAttribute = QaScanItemApi.ScanningOrderDetailUnitAttribute;
import QaScanStep = QaScanItemApi.QaScanStep;

@Component({
  selector: 'app-qa-lead-step-odu',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    ScanBoardComponent,
    FormsModule,
    NzInputModule,
    NzTypographyModule,
    TranslateModule,
    ReactiveFormsModule,
    KeepFocusDirective,
    ImageZoomDirective,
    ImageErrorUrlDirective,
    QaLeadScanControlErrorComponent,
    QaLeadRejectedMessageComponent,
    NzButtonModule,
    NgOptimizedImage,
    AppAqcComponent,
    FitRemainHeightDirective,
    ImgPreviewDirective,
  ],
  template: `
    @if (!$stepOdu().scanningOrderDetailUnit!.isRejectWithoutConfirming) {
      <div class="tw-flex tw-flex-col tw-h-full">
        <!-- Scan Input -->
        <div id="upper-body">
          <div nz-row [nzGutter]="30" class="scan-input-wrapper">
            <div nz-col nzFlex="300px" class="tw-text-right">
              <label for="scan-odu-input" class="tw-font-semibold tw-text-xl">{{ $scanLocationLabel() | translate }}</label>
            </div>
            <div nz-col nzFlex="auto">
              <input
                class="tw-w-3/5"
                type="text"
                nz-input
                id="scan-odu-input"
                nzSize="large"
                appKeepFocus
                focusOnInitOnly
                [placeholder]="'ACCEPT_REJECT' | translate"
                [formControl]="scanLocationControl"
                (keyup.enter)="scanLocation()" />
            </div>
          </div>
          <app-qa-lead-scan-control-error id="control-error" />
          <div nz-row nzGutter="30" class="tw-my-2" *ngIf="$resetStatusApiStepMsg()" id="message-wrapper">
            <div nz-col nzSpan="16" nzOffset="4">
              <span
                nz-typography
                [nzType]="$resetStatusApiStepMsg()!.messageColor === QaColor.Red ? 'danger' : 'success'"
                class="tw-text-2xl tw-font-bold"
                >{{ $resetStatusApiStepMsg()!.message | translate: $resetStatusApiStepMsg()!.messageParams }}</span
              >
            </div>
          </div>
          <app-qa-lead-rejected-message />
          <div class="tw-mt-3"></div>
          <div class="tw-flex tw-gap-2">
            <div class="tw-flex-1" *ngFor="let location of $currentScans()">
              <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="getActualPrintTypeMessage(location.actualPrintType, location.isNoDesign)">
                <span class="tw-text-xl tw-font-bold tw-text-white">{{ getActualPrintTypeMessage(location.actualPrintType, location.isNoDesign) | translate }}</span>
              </div>
            </div>
          </div>
          <div class="tw-mt-3"></div>
        </div>
        <!-- Location Board -->
        <div class="tw-flex tw-gap-4 tw-flex-1" [ngClass]="{ 'tw-flex-wrap': $hasAnyAqc() }">
          @for (location of $currentScans(); track location.locationCode) {
            <app-scan-board
              [color]="getScanActionColor(location.scanAction, location.isReadyForQa)"
              [label]="location.locationDescription"
              [noMargin]="true"
              [appFitRemainingHeight]="$hasAnyAqc()"
              [class]="$hasAnyAqc() ? 'scan-board-preview tw-w-[49%]' : 'tw-flex-1'">
              @if ($stepOdu().groupType === QaStepGroup.OrderDetailUnit) {
                <div class="tw-flex-1 tw-flex">
                  <div class="tw-basis-1/3 tw-text-xl">
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.STYLE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.styleDesc }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.COLOR' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.colorName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-red-500 tw-text-3xl">
                      <span>{{ 'QA.SIZE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeCode }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.TYPE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeClassName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customNumber">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NUMBER' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customNumber }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customName">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NAME' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customName }}</span>
                    </div>
                  </div>
                  <div class="tw-basis-2/3 tw-image-fill">
                    <img [src]="location.previewUrl" appImageZoom class="tw-object-top" appImageErrorUrl />
                  </div>
                </div>
              } @else if ($stepOdu().groupType === QaStepGroup.DtfNeckLabelUnit) {
                <div class="tw-flex tw-flex-1 tw-gap-x-1 tw-flex-col">
                  <div class="tw-text-xl">
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.STYLE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.styleDesc }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.COLOR' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.colorName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-red-500 tw-text-3xl">
                      <span>{{ 'QA.SIZE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeCode }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.TYPE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeClassName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customNumber">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NUMBER' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customNumber }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customName">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NAME' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customName }}</span>
                    </div>
                  </div>
                  <div class="tw-flex-1 tw-flex tw-gap-1 tw-mt-2">
                    <div class="tw-flex-1 tw-image-fill">
                      <img [src]="location.previewUrl" class="tw-object-top" appImageZoom appImageErrorUrl />
                    </div>
                    <div class="tw-flex-1 tw-image-fill">
                      <div *ngIf="location.isNoDesign" class="tw-flex tw-items-center tw-justify-center tw-h-full">
                        <span class="tw-text-2xl tw-font-bold">{{ 'ORDER.DTG_NO_DESIGN' | translate }}</span>
                      </div>
                      <img *ngIf="!location.isNoDesign" [src]="location.fileUrl" class="tw-object-top" appImageZoom appImageErrorUrl />
                    </div>
                  </div>
                </div>
              }
            </app-scan-board>
            <div class="aqc-scan-board tw-w-[49%]" *ngIf="$hasAnyAqc()">
              <app-aqc *ngIf="location.qualityResults?.length" [qualityResults]="location.qualityResults"></app-aqc>
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- Else: Confirm Reject Screen -->
      <div class="tw-flex tw-flex-col tw-h-full">
        <!-- Scan Input -->
        <div id="upper-body">
          <div nz-row [nzGutter]="30">
            <div nz-col nzFlex="300px" class="tw-text-right">
              <label for="qty-input" class="tw-font-semibold tw-text-xl">{{ 'QA.QUANTITY' | translate }}</label>
            </div>
            <div nz-col nzFlex="auto">
              <div class="tw-w-3/5 tw-bg-gray-300 tw-font-bold tw-p-2">1</div>
            </div>
          </div>
          <div nz-row [nzGutter]="30" class="tw-mt-2">
            <div nz-col nzFlex="300px" class="tw-text-right">
              <label for="confirm-reject-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_CODE' | translate }}</label>
            </div>
            <div nz-col nzFlex="auto">
              <input
                class="tw-w-3/5"
                type="text"
                nz-input
                id="confirm-reject-input"
                nzSize="large"
                appKeepFocus
                focusOnInitOnly
                [placeholder]="'QA.REJECT_REASON_APPROVAL_NEEDED' | translate"
                [formControl]="scanConfirmRejectControl"
                (keyup.enter)="confirmReject()" />
            </div>
          </div>
          <app-qa-lead-scan-control-error />
          <div nz-row nzGutter="30" class="tw-my-2" *ngIf="$resetStatusApiStepMsg()">
            <div nz-col nzSpan="16" nzOffset="4">
              <span
                nz-typography
                [nzType]="$resetStatusApiStepMsg()!.messageColor === QaColor.Red ? 'danger' : 'success'"
                class="tw-text-2xl tw-font-bold"
                >{{ $resetStatusApiStepMsg()!.message | translate: $resetStatusApiStepMsg()!.messageParams }}</span
              >
            </div>
          </div>
          <app-qa-lead-rejected-message />
        </div>
        <!-- Location ActualPrintType Msg -->
        <div class="tw-flex tw-gap-4">
          <div class="tw-flex-1" *ngFor="let location of $stepOdu().scanningOrderDetailUnit!.attributes">
            <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="getActualPrintTypeMessage(location.actualPrintType, location.isNoDesign)">
              <span class="tw-text-xl tw-font-bold tw-text-white">{{ getActualPrintTypeMessage(location.actualPrintType, location.isNoDesign) | translate }}</span>
            </div>
          </div>
        </div>
        <!-- Location Board -->
        <div class="tw-flex tw-gap-4 tw-flex-1 tw-mt-3" [ngClass]="{ 'tw-flex-wrap': $hasAnyAqc() }">
          @for (location of $stepOdu().scanningOrderDetailUnit!.attributes; track location.locationCode) {
            <app-scan-board
              [color]="getScanActionColor(location.scanAction, location.isReadyForQa)"
              [label]="location.locationDescription"
              [noMargin]="true"
              [appFitRemainingHeight]="$hasAnyAqc()"
              [isResetStatus]="location.scanAction === QaPrintScanAction.Reject && $stationType() !== StationType.QaDtf"
              (resetStatus)="resetLocation(location)"
              [ngClass]="{ 'scan-board-preview tw-w-[49%]': $hasAnyAqc(), 'tw-flex-1': !$hasAnyAqc() }">
              @if ($stepOdu().groupType === QaStepGroup.OrderDetailUnit) {
                <div class="tw-flex-1 tw-flex" *ngIf="$stepOdu().groupType === QaStepGroup.OrderDetailUnit">
                  <div class="tw-basis-1/3 tw-text-xl">
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.STYLE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.styleDesc }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.COLOR' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.colorName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-red-500 tw-text-3xl">
                      <span>{{ 'QA.SIZE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeCode }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.TYPE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeClassName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customNumber">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NUMBER' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customNumber }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customName">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NAME' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customName }}</span>
                    </div>
                  </div>
                  <div class="tw-basis-2/3 tw-image-fill">
                    <img [src]="location.previewUrl" appImageZoom appImageErrorUrl class="tw-object-top" />
                  </div>
                </div>
              } @else if ($stepOdu().groupType === QaStepGroup.DtfNeckLabelUnit) {
                <div class="tw-flex tw-flex-1 tw-flex-col">
                  <div class="tw-text-xl">
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.STYLE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.styleDesc }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.COLOR' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.colorName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-red-500 tw-text-3xl">
                      <span>{{ 'QA.SIZE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeCode }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">{{ 'QA.TYPE' | translate }}: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeClassName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customNumber">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NUMBER' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customNumber }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customName">
                      <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NAME' | translate }}: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customName }}</span>
                    </div>
                  </div>
                  <div class="tw-flex-1 tw-flex tw-gap-1 tw-mt-2">
                    <div class="tw-flex-1 tw-image-fill">
                      <img [src]="location.previewUrl" class="tw-object-top" appImageZoom appImageErrorUrl />
                    </div>
                    <div class="tw-flex-1 tw-image-fill">
                      <div *ngIf="location.isNoDesign" class="tw-flex tw-items-center tw-justify-center tw-h-full">
                        <span class="tw-text-2xl tw-font-bold">{{ 'ORDER.DTG_NO_DESIGN' | translate }}</span>
                      </div>
                      <img *ngIf="!location.isNoDesign" [src]="location.fileUrl" class="tw-object-top" appImageZoom appImageErrorUrl />
                    </div>
                  </div>
                </div>
              }
            </app-scan-board>
            <div class="aqc-scan-board tw-w-[49%]" *ngIf="$hasAnyAqc()">
              <app-aqc *ngIf="location.qualityResults?.length" [qualityResults]="location.qualityResults"></app-aqc>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .scan-board-preview {
        min-height: 600px;
      }
      .aqc-scan-board {
        min-height: 576px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStepOduComponent implements OnInit {
  qaLeadStore = inject(QaLeadStore);
  $stepOdu = this.qaLeadStore.$currentScanStep as Signal<QaScanStep>; // cast non null bcz not nullable in here
  $currStepType = computed(() => this.$stepOdu().groupType as QaStepGroup.OrderDetailUnit | QaStepGroup.DtfNeckLabelUnit);
  $hasAnyAqc = computed(() => {
    return this.$stepOdu().scanningOrderDetailUnit!.attributes.some(attr => {
      return attr.qualityResults?.length;
    });
  });
  $stationType = computed(() => this.qaLeadStore.station()!.stationType);

  ngOnInit() {
    if (!this.$stepOdu().scanningOrderDetailUnit!.isRejectWithoutConfirming) {
      this.redirectScanItemIfNoCurrentScan();
    }
  }

  redirectScanItemIfNoCurrentScan() {
    const currScans = this.$currentScans();
    if (currScans.length !== 0) return;

    const notReadyQaLocation = this.$stepOdu().scanningOrderDetailUnit!.attributes.find(
      attr => !attr.isReadyForQa && attr.scanAction === null
    );

    if (!notReadyQaLocation?.nextStationAlert) return;

    this.qaLeadStore.patchState({
      apiStepMsg: {
        message: notReadyQaLocation.nextStationAlert,
        messageParams: notReadyQaLocation.nextStationAlertParams,
        messageColor: QaColor.Red,
      },
    });
  }

  //region Scan Odu Step
  $currentScans = this.qaLeadStore.$currentOduStepScans;

  scanLocationControl = new FormControl('', { nonNullable: true });
  $scanLocationLabel = computed<string>(() => {
    const currScans = this.$currentScans();
    if (!currScans.length) return 'QA.CONFIRM_PRINT_LOCATION';

    if (
      this.$stepOdu().scanningOrderDetailUnit!.isDtfAccessory ||
      currScans[0].reviewBarcodes[0].location === QaPrintBarcodeLocation.Sock1 ||
      currScans[0].reviewBarcodes[0].location === QaPrintBarcodeLocation.Sock2
    ) {
      return 'CONFIRM_ITEM';
    } else if (currScans[0].reviewBarcodes[0].location === QaPrintBarcodeLocation.Necklabel) {
      return 'QA.SCAN_NECK_LABEL';
    } else if (currScans[0].reviewBarcodes[0].location === QaPrintBarcodeLocation.Patch) {
      return 'QA.SCAN_PATCH';
    } else if (currScans[0].reviewBarcodes[0].location === QaPrintBarcodeLocation.DtfNeckLabel) {
      return 'QA.SCAN_DTF_NECK_LABEL';
    }

    return 'QA.CONFIRM_PRINT_LOCATION';
  });

  $verifyItems = signal<QaScanVerifyLocationApi.RequestBody__VerifyItem[]>([]);

  scanLocation() {
    const scanBarcode = this.scanLocationControl.value.toUpperCase();
    this.scanLocationControl.reset();

    if (this.$stepOdu().scanningOrderDetailUnit!.isSockPrint) {
      const reviewBarcode = this.$currentScans()
        .flatMap(sc => sc.reviewBarcodes)
        .find(rb => rb.barcode === scanBarcode);
      if (reviewBarcode) {
        this.qaLeadStore.scanVerifySockLocation(reviewBarcode);
      } else {
        this.qaLeadStore.scanBarcodeNotFound(scanBarcode);
      }
      
      return;
    }

    //region validate
    if (!this.$currentScans().length) {
      const invalidScan = this.$stepOdu().scanningOrderDetailUnit!.attributes.filter(
        attr => attr.scanAction === QaPrintScanAction.Accept || (!attr.isReadyForQa && attr.scanAction === null)
      );
      const matchInvalidScan = invalidScan.find(attr => attr.reviewBarcodes.map(rb => rb.barcode).includes(scanBarcode));
      if (matchInvalidScan) {
        this.qaLeadStore.scanVerifyLocation({
          verifyItems: [
            {
              orderItemAttributeId: matchInvalidScan.orderDetailAttributeId,
              reviewBarcode: matchInvalidScan.reviewBarcodes.find(rb => rb.barcode === scanBarcode)!.barcode,
            },
          ],
          stepType: this.$currStepType(),
        });
        return;
      }
    }
    //endregion

    const additionalAttributes = this.$stepOdu().scanningOrderDetailUnit!.additionalAttributes;
    const scannedAllAdditionalAttributes = additionalAttributes.every(aAttr => aAttr.scanAction !== null);
    if (!additionalAttributes.length || scannedAllAdditionalAttributes) {
      const isBarcodeExist = this.$currentScans()
        .flatMap(sc => sc.reviewBarcodes)
        .some(rb => rb.barcode === scanBarcode);
      if (isBarcodeExist) {
        this.handleVerifyLocationWhenNoExtraAdditionalAttributes(scanBarcode);
      } else {
        this.qaLeadStore.scanBarcodeNotFound(scanBarcode);
      }
    }

    if (additionalAttributes.length && !scannedAllAdditionalAttributes) {
      const isBarcodeExist = this.$currentScans()
        .flatMap(sc => sc.reviewBarcodes)
        .some(rb => rb.barcode === scanBarcode);
      if (isBarcodeExist) {
        this.qaLeadStore.patchState({ controlError: null });

        this.handleVerifyLocationWithAdditionalAttributes(scanBarcode);
      } else {
        this.qaLeadStore.scanBarcodeNotFound(scanBarcode);
      }
    }
  }

  handleVerifyLocationWhenNoExtraAdditionalAttributes(scanBarcode: string) {
    this.$currentScans().forEach(sc => {
      const reviewBarcode = sc.reviewBarcodes.find(rb => rb.barcode === scanBarcode);
      if (reviewBarcode) {
        this.qaLeadStore.updateStepOduScanAction({
          orderDetailAttributeId: sc.orderDetailAttributeId,
          type: reviewBarcode.type,
          stepType: this.$currStepType(),
        });
        this.qaLeadStore.scanVerifyLocation({
          verifyItems: [
            {
              orderItemAttributeId: sc.orderDetailAttributeId,
              reviewBarcode: reviewBarcode.barcode,
            },
          ],
          stepType: this.$currStepType(),
        });
      }
    });
  }

  handleVerifyLocationWithAdditionalAttributes(scanBarcode: string) {
    this.$currentScans().forEach(sc => {
      const reviewBarcode = sc.reviewBarcodes.find(rb => rb.barcode === scanBarcode);
      if (reviewBarcode) {
        this.$verifyItems.update(items => {
          items.push({
            orderItemAttributeId: sc.orderDetailAttributeId,
            reviewBarcode: reviewBarcode.barcode,
          });
          return [...items];
        });
        this.qaLeadStore.updateStepOduScanAction({
          orderDetailAttributeId: sc.orderDetailAttributeId,
          type: reviewBarcode.type,
          stepType: this.$currStepType(),
        });

        if (
          this.$stepOdu().scanningOrderDetailUnit!.additionalAttributes.every(aAttr => aAttr.scanAction !== null) ||
          reviewBarcode.type === QaPrintScanAction.SendToWash
        ) {
          this.qaLeadStore.scanVerifyLocation({ verifyItems: this.$verifyItems(), stepType: this.$currStepType() });
          this.$verifyItems.set([]);
        }
      }
    });
  }
  //endregion Scan Odu Step

  //region Confirm Reject
  $qaLeadRejectBarcodes = this.qaLeadStore.selectSignal(s => s.scanItemResp!.qaLeadRejectReviewBarcodes);
  scanConfirmRejectControl = new FormControl('', { nonNullable: true });
  $resetStatusApiStepMsg = this.qaLeadStore.selectSignal(s => s.resetStatusApiStepMsg);

  confirmReject() {
    const scanConfirmRejectBarcode = this.scanConfirmRejectControl.value.toUpperCase();
    this.scanConfirmRejectControl.reset();

    const rejectBarcode = this.$qaLeadRejectBarcodes().find(rb => rb.barcode === scanConfirmRejectBarcode);
    if (rejectBarcode) {
      this.qaLeadStore.confirmReject({ rejectBarcode });
    } else {
      this.qaLeadStore.patchState({
        controlError: {
          errorKey: 'SCAN_CODE_XXX_INVALID',
          paramError: { xxx: scanConfirmRejectBarcode },
        },
      });
    }
  }

  resetLocation(location: ScanningOrderDetailUnitAttribute) {
    if (this.$stepOdu().scanningOrderDetailUnit!.isSockPrint) {
      this.qaLeadStore.resetSockStatus({ resetType: QaLeadResetLocationType.ResetReject });
    } else {
      this.qaLeadStore.resetStatus({ resetType: QaLeadResetLocationType.ResetReject, locationName: location.locationName });
    }
  }
  //endregion Confirm Reject

  getActualPrintTypeMessage(actualPrintType: EOrderDetailActualPrintType | null, isNoDesign: boolean): string {
    switch (actualPrintType) {
      case EOrderDetailActualPrintType.Blank:
        return 'QA.CUSTOMER_REQUESTED_BLANK_GARMENT';
      case EOrderDetailActualPrintType.FinishedGood:
        return 'QA.CUSTOMER_REQUESTED_FINISHED_GOOD_GARMENT';
      case EOrderDetailActualPrintType.Preprinted:
        return 'QA.CUSTOMER_REQUESTED_PREPRINTED_GARMENT';
      default:
        // Check isNoDesign last as a fallback
        if (isNoDesign) {
          return 'QA.CUSTOMER_REQUESTED_BLANK_GARMENT_NO_DESIGN';
        }
        return '';
    }
  }

  protected readonly getScanActionColor = getScanActionColor;
  protected readonly QaPrintScanAction = QaPrintScanAction;
  protected readonly QaColor = QaColor;
  protected readonly StationType = StationType;
  protected readonly QaStepGroup = QaStepGroup;
  protected readonly EOrderDetailActualPrintType = EOrderDetailActualPrintType;
}
