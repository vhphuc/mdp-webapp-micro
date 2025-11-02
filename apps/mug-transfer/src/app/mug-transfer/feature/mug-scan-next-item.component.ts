import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { extractMugBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { MugControlErrorComponent } from '../ui/component/mug-control-error.component';
import { MugStore } from '../data-access/store/mug-store.store';
import { MugPickScanCode, MugPrintScanCode } from '../data-access/model/ui/scan-code';

@Component({
  selector: 'app-mug-scan-next-item',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KeepFocusDirective,
    NzInputModule,
    NzTypographyModule,
    TranslateModule,
    ReactiveFormsModule,
    MugControlErrorComponent,
  ],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col">
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-font-semibold tw-text-xl tw-text-right tw-min-w-[300px]">
          <label for="scan-next-item-input">{{ 'MUG.SCAN_ITEM' | translate | uppercase }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            id="scan-next-item-input"
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
      <app-mug-control-error />
      <div class="tw-text-center tw-mt-[15%]" *ngIf="$item().printScannedCode === MugPrintScanCode.Reject">
        <span nz-typography [nzType]="'danger'" class="tw-font-bold tw-text-5xl tw-leading-normal tw-whitespace-pre-line">{{
          'MUG.MUG_PRINT_REJECTED' | translate
        }}</span>
      </div>
      <div class="tw-text-center tw-mt-[15%]" *ngIf="$item().pickScannedCode === MugPickScanCode.Accept">
        <span nz-typography [nzType]="'success'" class="tw-font-bold tw-text-5xl tw-leading-normal tw-whitespace-pre-line">{{
          'MUG.MUG_COMPLETE' | translate
        }}</span>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MugScanNextItemComponent {
  mugStore = inject(MugStore);
  $item = this.mugStore.selectSignal(s => s.item!);
  scanItemControl = new FormControl('', { nonNullable: true });

  scanItem() {
    const scanValue = this.scanItemControl.value.trim().toUpperCase();
    this.scanItemControl.reset();
    if (!scanValue) return;
    this.mugStore.patchState({ controlError: null });

    const barcode = scanValue.startsWith('MUG') ? extractMugBarcode(scanValue) : extractUnitBarcode(scanValue);

    this.mugStore.scanItem({ barcode });
  }

  protected readonly MugPrintScanCode = MugPrintScanCode;
  protected readonly MugPickScanCode = MugPickScanCode;
}
