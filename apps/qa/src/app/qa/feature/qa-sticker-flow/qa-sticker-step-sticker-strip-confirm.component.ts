import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ScanBoardComponent } from '@shared/ui/component/scan-board.component';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImageZoomDirective } from '@shared/ui/directive/image-zoom.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { getScanActionColor } from '@shared/util/helper/helper';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaStickerScanSheetApi } from './data-access/qa-sticker-api';
import { QaStickerStore } from './data-access/qa-sticker.store';
import { QaStickerRejectedMessageComponent } from './qa-sticker-rejected-message.component';
import { QaStickerScanControlErrorComponent } from './ui/component/qa-sticker-scan-control-error.component';

@Component({
  selector: 'app-qa-sticker-step-stickerstrip-confirm',
  standalone: true,
  imports: [
    CommonModule,
    ImageErrorUrlDirective,
    KeepFocusDirective,
    NzInputModule,
    ScanBoardComponent,
    TranslateModule,
    ReactiveFormsModule,
    QaStickerScanControlErrorComponent,
    QaStickerRejectedMessageComponent,
    ImageZoomDirective,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
      <div class="tw-flex tw-gap-6">
        <div class="tw-w-[300px] tw-text-right">
          <label for="confirm-sticker-group-input" class="tw-font-semibold tw-text-xl">{{
            'QA.CONFIRM_STICKER_STRIP' | translate | uppercase
          }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            class="tw-w-3/5"
            type="text"
            nz-input
            id="confirm-sticker-group-input"
            nzSize="large"
            appKeepFocus
            focusOnInitOnly
            [placeholder]="'ACCEPT_REJECT' | translate"
            [formControl]="scanControl"
            (keyup.enter)="scan()" />
        </div>
      </div>
      <app-qa-sticker-scan-control-error />
      <app-qa-sticker-rejected-message />
      <div class="tw-flex tw-gap-2 tw-flex-1">
        <app-scan-board
          *ngIf="$stickerGroup() as stickerGroup"
          [color]="getScanActionColor(stickerGroup.attribute.scanAction, stickerGroup.attribute.isReadyForQa)"
          [label]="stickerGroup.attribute.locationName"
          class="tw-flex-1">
          <div class="tw-flex-1 tw-flex">
            <div class="tw-w-1/3 tw-text-xl">
              <div>
                <span class="tw-font-semibold">{{ 'QA.STYLE' | translate }}: </span>
                <span>{{ stickerGroup.styleDesc }}</span>
              </div>
              <div>
                <span class="tw-font-semibold">{{ 'QA.COLOR' | translate }}: </span>
                <span>{{ stickerGroup.colorName }}</span>
              </div>
              <div class="tw-font-bold tw-text-red-500 tw-text-3xl">
                <span>{{ 'QA.SIZE' | translate }}: </span>
                <span>{{ stickerGroup.sizeCode }}</span>
              </div>
              <div>
                <span class="tw-font-semibold">{{ 'QA.TYPE' | translate }}: </span>
                <span>{{ stickerGroup.sizeClassName }}</span>
              </div>
              <div class="tw-font-bold tw-text-3xl" *ngIf="stickerGroup.customNumber">
                <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NUMBER' | translate }}: </span>
                <span class="tw-text-blue-500">{{ stickerGroup.customNumber }}</span>
              </div>
              <div class="tw-font-bold tw-text-3xl" *ngIf="stickerGroup.customName">
                <span class="tw-text-red-500 tw-block">{{ 'QA.CUSTOM_NAME' | translate }}: </span>
                <span class="tw-text-blue-500">{{ stickerGroup.customName }}</span>
              </div>
            </div>
            <div class="tw-flex-1 tw-image-fill">
              <img [src]="stickerGroup.attribute.fileUrl" appImageZoom appImageErrorUrl alt="preview-img" />
            </div>
          </div>
        </app-scan-board>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerStepStickerStripConfirmComponent {
  qaStickerStore = inject(QaStickerStore);
  $stickerGroup: Signal<QaStickerScanSheetApi.QaStickerStepStickerGroup['scanningStickerGroup']> = this.qaStickerStore.selectSignal(
    this.qaStickerStore.selectSignal(s => s),
    this.qaStickerStore.$currGroupBarcode,
    (state, currStickerGroupBarcode) => {
      return state.sheet!.steps.find(
        (st): st is QaStickerScanSheetApi.QaStickerStepStickerGroup =>
          st.groupType === QaStepGroup.StickerGroup && st.scanningStickerGroup.barcode === currStickerGroupBarcode
      )!.scanningStickerGroup;
    }
  );

  scanControl = new FormControl('', { nonNullable: true });

  scan() {
    const scanValue = this.scanControl.value.trim().toUpperCase();
    this.scanControl.reset();
    if (!scanValue) return;
    this.qaStickerStore.patchState({ controlError: null });

    const matchingVerifyBarcode = this.$stickerGroup().attribute.reviewBarcodes.find(rb => rb.barcode === scanValue);
    if (!matchingVerifyBarcode) {
      this.qaStickerStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode: scanValue },
        },
      });
      return;
    }

    this.qaStickerStore.verifyStickerGrp({ verifyBarcode: scanValue });
  }

  protected readonly getScanActionColor = getScanActionColor;
  protected readonly QaStepGroup = QaStepGroup;
}
