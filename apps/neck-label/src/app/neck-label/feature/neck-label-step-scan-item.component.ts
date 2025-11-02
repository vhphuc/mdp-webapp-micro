import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TranslateModule } from '@ngx-translate/core';
import { NeckLabelStore } from '../data-access/store/neck-label.store';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { extractJitItemBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';

@Component({
  selector: 'app-neck-label-scan-item',
  standalone: true,
  imports: [CommonModule, TranslateModule, NzInputModule, ReactiveFormsModule, KeepFocusDirective, NzTypographyModule, FormsModule],
  template: `
    <div class="tw-flex tw-gap-6">
      <div class="tw-w-1/2">
        <div class="tw-flex tw-items-center tw-gap-8">
          <div class="tw-font-semibold tw-text-xl tw-text-right">
            <label for="scan-item-input">{{ 'NECK_LABEL.SCAN_ITEM' | translate | uppercase }}</label>
          </div>
          <div class="tw-flex-1">
            <input
              id="scan-item-input"
              type="text"
              nz-input
              [formControl]="scanItemControl"
              nzSize="large"
              [placeholder]="'NECK_LABEL.ITEM' | translate"
              appKeepFocus
              focusOnInitOnly
              (keyup.enter)="onScanItem()" />
          </div>
        </div>
      </div>
      <div class="tw-flex-1">
        <div>
          <span
            *ngIf="$scanMsg() as msg"
            nz-typography
            [nzType]="msg.color === 'red' ? 'danger' : 'success'"
            class="tw-text-2xl tw-font-bold tw-whitespace-pre-line"
            >{{ msg.key | translate: msg.params }}</span
          >
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelStepScanItemComponent {
  nlStore = inject(NeckLabelStore);
  scanItemControl = new FormControl('', { nonNullable: true });
  $scanMsg = this.nlStore.selectSignal(s => s.scanMessage);

  onScanItem() {
    const scanValue = this.scanItemControl.value.trim().toUpperCase();
    this.scanItemControl.reset();

    if (!scanValue) return;

    let barcode: string;
    if (scanValue.startsWith('JIT')) {
      barcode = extractJitItemBarcode(scanValue);
    } else {
      barcode = extractUnitBarcode(scanValue);
    }

    this.nlStore.scanItem(barcode);
  }
}
