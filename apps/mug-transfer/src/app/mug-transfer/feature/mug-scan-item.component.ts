import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { MugStore } from '../data-access/store/mug-store.store';
import { extractMugBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';

@Component({
  selector: 'app-mug-scan-item',
  standalone: true,
  imports: [CommonModule, FormsModule, KeepFocusDirective, NzInputModule, NzTypographyModule, TranslateModule, ReactiveFormsModule],
  template: `
    <div class="tw-flex tw-items-center">
      <div class="tw-font-semibold tw-text-xl tw-text-right tw-w-1/3">
        <label for="scan-item-input" class="tw-mr-8">{{ 'MUG.SCAN_ITEM' | translate | uppercase }}</label>
      </div>
      <div class="tw-w-1/3">
        <input
          id="scan-item-input"
          type="text"
          nz-input
          nzSize="large"
          [placeholder]="'MUG.SCAN_ITEM' | translate"
          [formControl]="scanItemControl"
          (keyup.enter)="scanItem()"
          appKeepFocus
          focusOnInitOnly />
      </div>
    </div>
    <div class="tw-flex tw-justify-center tw-mt-3" *ngIf="$controlError() as error">
      <span nz-typography nzType="danger" class="tw-text-3xl tw-text-center tw-font-bold tw-leading-normal tw-whitespace-pre-line">{{
        error.errorKey | translate : error.paramError
      }}</span>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MugScanItemComponent {
  mugStore = inject(MugStore);
  $controlError = this.mugStore.selectSignal(s => s.controlError);
  scanItemControl = new FormControl('', { nonNullable: true });

  scanItem() {
    const scanValue = this.scanItemControl.value.trim().toUpperCase();
    this.scanItemControl.reset();
    if (!scanValue) return;
    this.mugStore.patchState({ controlError: null });

    const barcode = scanValue.startsWith('MUG') ? extractMugBarcode(scanValue) : extractUnitBarcode(scanValue);

    this.mugStore.scanItem({ barcode });
  }
}
