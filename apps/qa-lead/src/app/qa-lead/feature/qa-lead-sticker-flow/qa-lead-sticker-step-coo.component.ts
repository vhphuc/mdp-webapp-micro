import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadStickerScanControlErrorComponent } from './ui/component/qa-lead-sticker-scan-control-error.component';
import { QaLeadStickerStore } from './data-access/qa-lead-sticker.store';

@Component({
  selector: 'app-qa-lead-sticker-step-coo',
  standalone: true,
  imports: [CommonModule, KeepFocusDirective, NzInputModule, TranslateModule, ReactiveFormsModule, QaLeadStickerScanControlErrorComponent],
  template: `
    <div class="tw-flex tw-gap-6">
      <div class="tw-w-[300px] tw-flex tw-items-center tw-justify-end">
        <label for="scan-coo-input" class="tw-font-semibold tw-text-xl">{{ 'QA.SCAN_COO' | translate }}</label>
      </div>
      <div class="tw-flex-1">
        <input
          class="tw-w-3/5"
          type="text"
          nz-input
          id="scan-coo-input"
          nzSize="large"
          appKeepFocus
          focusOnInitOnly
          [placeholder]="'QA.SCAN_COO' | translate"
          [formControl]="scanControl"
          (keyup.enter)="scan()" />
      </div>
    </div>
    <app-qa-lead-sticker-scan-control-error />
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStickerStepCooComponent {
  qaLeadStickerStore = inject(QaLeadStickerStore);
  $coo = this.qaLeadStickerStore.selectSignal(s => s.sheet!.coos);

  scanControl = new FormControl('', { nonNullable: true });

  scan() {
    const scanCoo = this.scanControl.value.toUpperCase().trim();
    this.scanControl.reset();

    const coo = this.$coo().find(c => c.code === scanCoo);
    if (coo) {
      this.qaLeadStickerStore.scanCoo({ coo });
    } else {
      this.qaLeadStickerStore.patchState({
        controlError: {
          errorKey: 'QA.COO_INVALID',
          paramError: { coo: scanCoo },
        },
      });
    }
  }
}
