import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { QaLeadStickerScanControlErrorComponent } from './ui/component/qa-lead-sticker-scan-control-error.component';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadStickerStore } from './data-access/qa-lead-sticker.store';
import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { extractStickerStripQrCode } from '@shared/util/helper/extract-barcode';
import { QaStickerScanSheetApi } from './data-access/qa-sticker-api';

@Component({
  selector: 'app-qa-lead-sticker-step-sticker-strip-scan',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KeepFocusDirective,
    NzInputModule,
    QaLeadStickerScanControlErrorComponent,
    TranslateModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="tw-flex tw-gap-6">
      <div class="tw-w-[300px] tw-flex tw-items-center tw-justify-end">
        <label for="scan-sticker-group-input" class="tw-font-semibold tw-text-xl">{{
          'QA.SCAN_STICKER_STRIP' | translate | uppercase
        }}</label>
      </div>
      <div class="tw-flex-1">
        <input
          class="tw-w-3/5"
          type="text"
          nz-input
          id="scan-sticker-group-input"
          nzSize="large"
          appKeepFocus
          focusOnInitOnly
          [placeholder]="'QA.SCAN_STICKER_STRIP_PLACEHOLDER' | translate"
          [formControl]="scanControl"
          (keyup.enter)="scan()" />
      </div>
    </div>
    <app-qa-lead-sticker-scan-control-error />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStickerStepStickerStripScanComponent {
  qaLeadStickerStore = inject(QaLeadStickerStore);
  $stickerGroups = this.qaLeadStickerStore.selectSignal(s => {
    return (
      s.sheet?.steps.filter(
        (st): st is QaStickerScanSheetApi.QaStickerStepStickerGroup =>
          st.groupType === QaStepGroup.StickerGroup && !(st.isViewOnly || st.isIgnoreScan)
      ) ?? []
    );
  });
  scanControl = new FormControl('', { nonNullable: true });

  scan() {
    const scanValue = this.scanControl.value.toUpperCase().trim();
    this.scanControl.reset();

    if (!scanValue) return;
    this.qaLeadStickerStore.patchState({ controlError: null });

    const barcode = extractStickerStripQrCode(scanValue);

    const matchingStickerGroup = this.$stickerGroups().find(sg => sg.scanningStickerGroup.barcode === barcode);
    if (!matchingStickerGroup) {
      this.qaLeadStickerStore.patchState({
        controlError: {
          errorKey: 'SERVER_ERROR_INVALID_BARCODE',
          paramError: { barcode },
        },
      });
    } else if (matchingStickerGroup.isScanned) {
      this.qaLeadStickerStore.patchState({
        controlError: {
          errorKey: 'BARCODE_#_X1_IS_X2',
          paramError: { x1: barcode, x2: 'accepted' },
        },
      });
    } else {
      this.qaLeadStickerStore.$currStickerGroup.set(matchingStickerGroup);
    }
  }
}
