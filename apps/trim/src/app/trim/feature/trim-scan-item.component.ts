import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { TrimStore } from '../data-access/store/trim.store';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-trim-scan-item',
  standalone: true,
  imports: [CommonModule, KeepFocusDirective, NzInputModule, ReactiveFormsModule, TranslateModule, NzTypographyModule],
  template: `
    <div class="tw-flex tw-items-center">
      <div class="tw-font-semibold tw-text-xl tw-text-right tw-w-1/3">
        <label for="scan-item-input" class="tw-mr-8">{{ 'TRIM.SCAN_ITEM' | translate | uppercase }}</label>
      </div>
      <div class="tw-w-1/3">
        <input
          id="scan-item-input"
          type="text"
          nz-input
          nzSize="large"
          [placeholder]="'TRIM.SCAN_ITEM' | translate"
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
export class TrimScanItemComponent {
  trimStore = inject(TrimStore);
  $controlError = this.trimStore.selectSignal(s => s.controlError);
  scanItemControl = new FormControl('', { nonNullable: true });

  scanItem() {
    const barcode = extractUnitBarcode(this.scanItemControl.value.trim());
    this.scanItemControl.reset();

    if (!barcode) return;

    this.trimStore.scanItem({ barcode });
  }
}
