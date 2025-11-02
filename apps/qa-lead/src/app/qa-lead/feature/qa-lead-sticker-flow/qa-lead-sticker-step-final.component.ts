import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadStickerStore } from './data-access/qa-lead-sticker.store';
import { QaStickerScanSheetApi } from './data-access/qa-sticker-api';
import { QaColor } from 'src/app/qa-lead/data-access/model/common/enum/qa-color';

@Component({
  selector: 'app-qa-lead-sticker-step-final',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KeepFocusDirective,
    NzGridModule,
    NzInputModule,
    NzTypographyModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="tw-flex tw-gap-6">
      <div class="tw-w-[300px] tw-flex tw-items-center tw-justify-end">
        <label for="scan-sheet-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_SHEET' | translate | uppercase }}</label>
      </div>
      <div class="tw-flex-1">
        <input
          class="tw-w-3/5"
          type="text"
          nz-input
          id="scan-sheet-input"
          nzSize="large"
          [placeholder]="'QA.SCAN_SHEET_PLACEHOLDER' | translate"
          [formControl]="scanControl"
          (keyup.enter)="scan()"
          appKeepFocus
          focusOnInitOnly />
      </div>
    </div>
    <div class="tw-text-center tw-mt-[15%]">
      @if ($stepFinal().messages?.length) {
        @for (msg of $stepFinal().messages; track msg) {
          <div>
            <span
              nz-typography
              [nzType]="msg.messageColor === QaColor.Green ? 'success' : 'danger'"
              class="tw-font-bold tw-text-5xl tw-leading-normal tw-whitespace-pre-line"
              >{{ msg.message | translate: $stepFinal().finalStepMessageParams }}</span
            >
          </div>
        }
      } @else {
        <span
          nz-typography
          [nzType]="$stepFinal().messageColor === QaColor.Green ? 'success' : 'danger'"
          class="tw-font-bold tw-text-5xl tw-leading-normal tw-whitespace-pre-line"
          >{{ $stepFinal().message | translate: $stepFinal().finalStepMessageParams }}</span
        >
      }
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStickerStepFinalComponent {
  qaLeadStickerStore = inject(QaLeadStickerStore);
  scanControl = new FormControl('', { nonNullable: true });
  $stepFinal = this.qaLeadStickerStore.$currentScanStep as Signal<QaStickerScanSheetApi.QaStickerStepFinal>;

  scan() {
    const scanValue = this.scanControl.value.trim();
    this.scanControl.reset();
    if (!scanValue) return;

    if (scanValue.split('-').length !== 2) {
      this.qaLeadStickerStore.patchState({
        sheet: null,
        controlError: { errorKey: 'SERVER_ERROR_THIS_STATION_ONLY_QA_STICKER_ITEMS' },
      });
      return;
    }

    const barcode = scanValue;

    this.qaLeadStickerStore.scanSheet({ barcode });
  }

  protected readonly QaColor = QaColor;
}
