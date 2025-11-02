import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaColor } from '../../data-access/model/common/enum/qa-color';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { QaStickerStore } from './data-access/qa-sticker.store';
import { QaStickerScanControlErrorComponent } from './ui/component/qa-sticker-scan-control-error.component';

@Component({
  selector: 'app-qa-sticker-scan-sheet',
  standalone: true,
  imports: [
    CommonModule,
    KeepFocusDirective,
    NzInputModule,
    NzTypographyModule,
    ReactiveFormsModule,
    TranslateModule,
    QaStickerScanControlErrorComponent,
  ],
  template: `
    <div class="tw-flex tw-gap-6">
      <div class="tw-w-1/6 tw-text-right">
        <label for="scan-sheet-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_SHEET' | translate | uppercase }}</label>
      </div>
      <div class="tw-w-1/3">
        <input
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
    <app-qa-sticker-scan-control-error />
    <div *ngIf="$apiStepMsg() as msg" class="tw-mt-4 tw-ml-[8%] tw-text-center">
      <span
        nz-typography
        [nzType]="msg.messageColor === QaColor.Red ? 'danger' : 'success'"
        class="tw-text-5xl tw-font-bold tw-leading-normal tw-whitespace-pre-line"
        >{{ msg.message | translate: msg.messageParams }}</span
      >
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerScanSheetComponent {
  qaStickerStore = inject(QaStickerStore);
  $apiStepMsg = this.qaStickerStore.selectSignal(s => s.apiStepMsg);
  scanControl = new FormControl('', { nonNullable: true });

  scan() {
    const scanValue = this.scanControl.value.trim();
    this.scanControl.reset();
    if (!scanValue) return;

    if (scanValue.split('-').length !== 2) {
      this.qaStickerStore.patchState({
        controlError: { errorKey: 'SERVER_ERROR_THIS_STATION_ONLY_QA_STICKER_ITEMS' },
      });
      return;
    }

    const barcode = scanValue;

    this.qaStickerStore.scanSheet({ barcode });
  }

  protected readonly QaColor = QaColor;
}
