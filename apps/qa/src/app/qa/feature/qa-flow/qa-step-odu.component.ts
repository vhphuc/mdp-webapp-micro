import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaStore } from './data-access/qa.store';
import { QaScanItemApi, QaScanVerifyLocationApi } from './data-access/qa-api';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { QaPrintBarcodeLocation } from '../../data-access/model/common/enum/qa-print-barcode-location';
import { QaPrintScanAction } from '../../data-access/model/common/enum/qa-print-scan-action';
import { getScanActionColor } from '@shared/util/helper/helper';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaColor } from '../../data-access/model/common/enum/qa-color';
import { EOrderDetailActualPrintType } from '../../data-access/model/common/enum/order-detail-actual-print-type';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { QaScanControlErrorComponent } from './ui/component/qa-scan-control-error.component';
import { QaRejectedMessageComponent } from './qa-rejected-message.component';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { FitRemainHeightDirective } from '@shared/ui/directive/fit-remaining-height.directive';
import { AppAqcComponent } from '@shared/ui/component/app-aqc.component';
import { ImageZoomDirective } from '@shared/ui/directive/image-zoom.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';

@Component({
  selector: 'app-qa-step-odu',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    FormsModule,
    NzInputModule,
    NzTypographyModule,
    TranslateModule,
    ReactiveFormsModule,
    KeepFocusDirective,
    QaScanControlErrorComponent,
    QaRejectedMessageComponent,
    ScanBoardComponent,
    FitRemainHeightDirective,
    AppAqcComponent,
    ImageZoomDirective,
    ImageErrorUrlDirective,
  ],

  template: `
    @if ($stepOdu()) {
      <div class="tw-flex tw-flex-col tw-h-full">
        <!-- Scan Input -->
        <div id="upper-body">
          <div nz-row [nzGutter]="30">
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
          <app-qa-scan-control-error />
          <app-qa-rejected-message />
          <div class="tw-mt-3"></div>
        </div>
        <!-- Location ActualPrintType Msg -->
        <div class="tw-flex tw-gap-2">
          <div class="tw-flex-1" *ngFor="let location of $currentScans()">
            <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="getActualPrintTypeMessage(location.actualPrintType, location.isNoDesign)">
              <span class="tw-text-xl tw-font-bold tw-text-white">{{ getActualPrintTypeMessage(location.actualPrintType, location.isNoDesign) | translate }}</span>
            </div>
          </div>
        </div>
        <!-- Location Board -->
        <div class="tw-flex tw-gap-2 tw-flex-1" [ngClass]="{ 'tw-flex-wrap': $hasAnyAqc() }">
          @for (location of $currentScans(); track location.locationCode) {
            <app-scan-board
              [color]="getScanActionColor(location.scanAction, location.isReadyForQa)"
              [label]="location.locationDescription"
              [noMargin]="true"
              [appFitRemainingHeight]="$hasAnyAqc()"
              [class]="$hasAnyAqc() ? 'tw-min-h-[600px] tw-w-[49%]' : 'tw-flex-1'">
              @if ($stepOdu().groupType === QaStepGroup.OrderDetailUnit) {
                <div class="tw-flex-1 tw-flex">
                  <div class="tw-basis-1/3 tw-text-xl">
                    <div>
                      <span class="tw-font-semibold">Style: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.styleDesc }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">Color: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.colorName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-red-500 tw-text-3xl">
                      <span>Size: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeCode }}</span>
                    </div>
                    <div>
                      <span class="tw-font-semibold">Type: </span>
                      <span>{{ $stepOdu().scanningOrderDetailUnit!.sizeClassName }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customNumber">
                      <span class="tw-text-red-500 tw-block">Custom Number: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customNumber }}</span>
                    </div>
                    <div class="tw-font-bold tw-text-3xl" *ngIf="$stepOdu().scanningOrderDetailUnit!.customName">
                      <span class="tw-text-red-500 tw-block">Custom Name: </span>
                      <span class="tw-text-blue-500">{{ $stepOdu().scanningOrderDetailUnit!.customName }}</span>
                    </div>
                  </div>
                  <div class="tw-basis-2/3 tw-image-fill">
                    <img [src]="location.previewUrl" class="tw-object-top" appImageZoom appImageErrorUrl />
                  </div>
                </div>
              } @else if ($stepOdu().groupType === QaStepGroup.DtfNeckLabelUnit) {
                <div class="tw-flex-1 tw-flex tw-flex-col">
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
            <div class="tw-min-h-[576px] tw-w-[49%]" *ngIf="$hasAnyAqc()">
              <app-aqc *ngIf="location.qualityResults?.length" [qualityResults]="location.qualityResults"></app-aqc>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStepOduComponent implements OnInit {
  qaStore = inject(QaStore);
  $stepOdu = this.qaStore.$currentScanStep as Signal<QaScanItemApi.QaScanStep>; // cast non null bcz not nullable in here
  $currStepType = computed(() => this.$stepOdu().groupType as QaStepGroup.OrderDetailUnit | QaStepGroup.DtfNeckLabelUnit);
  $hasAnyAqc = computed(() => {
    return this.$stepOdu().scanningOrderDetailUnit!.attributes.some(attr => {
      return attr.qualityResults?.length;
    });
  });
  $currentScans = this.qaStore.$currentOduStepScans;

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

  ngOnInit() {
    this.redirectScanItemIfNoCurrentScan();
  }

  redirectScanItemIfNoCurrentScan() {
    const currScans = this.$currentScans();
    if (currScans.length !== 0) return;

    const notReadyQaLocation = this.$stepOdu().scanningOrderDetailUnit!.attributes.find(
      attr => !attr.isReadyForQa && attr.scanAction === null
    );

    if (!notReadyQaLocation?.nextStationAlert) return;

    this.qaStore.patchState({
      apiStepMsg: {
        message: notReadyQaLocation.nextStationAlert,
        messageParams: notReadyQaLocation.nextStationAlertParams,
        messageColor: QaColor.Red,
      },
    });
  }

  scanLocation() {
    this.qaStore.patchState({ controlError: null });

    const scanBarcode = this.scanLocationControl.value.toUpperCase();
    this.scanLocationControl.reset();

    if (this.$stepOdu().scanningOrderDetailUnit!.isSockPrint) {
      const reviewBarcode = this.$currentScans()
        .flatMap(sc => sc.reviewBarcodes)
        .find(rb => rb.barcode === scanBarcode);
      if (reviewBarcode) {
        this.qaStore.scanVerifySockLocation(reviewBarcode);
      } else {
        this.qaStore.scanBarcodeNotFound(scanBarcode);
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
        this.qaStore.scanVerifyLocation({
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
        this.qaStore.scanBarcodeNotFound(scanBarcode);
      }
    }

    if (additionalAttributes.length && !scannedAllAdditionalAttributes) {
      const isBarcodeExist = this.$currentScans()
        .flatMap(sc => sc.reviewBarcodes)
        .some(rb => rb.barcode === scanBarcode);
      if (isBarcodeExist) {
        this.handleVerifyLocationWithAdditionalAttributes(scanBarcode);
      } else {
        this.qaStore.scanBarcodeNotFound(scanBarcode);
      }
    }
  }

  handleVerifyLocationWhenNoExtraAdditionalAttributes(scanBarcode: string) {
    this.$currentScans().forEach(sc => {
      const reviewBarcode = sc.reviewBarcodes.find(rb => rb.barcode === scanBarcode);
      if (reviewBarcode) {
        this.qaStore.updateStepOduScanAction({
          orderDetailAttributeId: sc.orderDetailAttributeId,
          type: reviewBarcode.type,
          stepType: this.$currStepType(),
        });
        this.qaStore.scanVerifyLocation({
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
        this.qaStore.updateStepOduScanAction({
          orderDetailAttributeId: sc.orderDetailAttributeId,
          type: reviewBarcode.type,
          stepType: this.$currStepType(),
        });

        if (
          this.$stepOdu().scanningOrderDetailUnit!.additionalAttributes.every(aAttr => aAttr.scanAction !== null) ||
          reviewBarcode.type === QaPrintScanAction.SendToWash
        ) {
          this.qaStore.scanVerifyLocation({
            verifyItems: this.$verifyItems(),
            stepType: this.$currStepType(),
          });
          this.$verifyItems.set([]);
        }
      }
    });
  }

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
  protected readonly QaStepGroup = QaStepGroup;
  protected readonly EOrderDetailActualPrintType = EOrderDetailActualPrintType;
}
