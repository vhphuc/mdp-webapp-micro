import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import { NeckLabelStore } from '../data-access/store/neck-label.store';
import { NeckLabelStepScanDtlNlMainPanelComponent } from '../ui/component/neck-label-step-scan-dtl-nl-main-panel.component';
import { extractUnitBarcode } from '@shared/util/helper/extract-barcode';

@Component({
  selector: 'app-neck-label-step-scan-dtf-nl',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageErrorUrlDirective,
    KeepFocusDirective,
    NzInputModule,
    NzTypographyModule,
    TranslateModule,
    ReactiveFormsModule,
    NeckLabelStepScanDtlNlMainPanelComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
      <div class="tw-flex tw-gap-6">
        <div class="tw-w-1/2">
          <div class="tw-flex tw-items-center tw-gap-8" *ngIf="!$isConfirmedBarcode()">
            <div class="tw-font-semibold tw-text-xl tw-text-right">
              <label for="confirm-item-input">{{ 'NECK_LABEL.SCAN_DTF_LABEL' | translate | uppercase }}</label>
            </div>
            <div class="tw-flex-1">
              <input
                id="scan-dtf-nl-input"
                type="text"
                nz-input
                [formControl]="scanDtfNl"
                nzSize="large"
                [placeholder]="'NECK_LABEL.SCAN_DTF_LABEL' | translate"
                appKeepFocus
                focusOnInitOnly
                (keyup.enter)="onScanDtfNl()" />
            </div>
          </div>
          <div class="tw-flex tw-items-center tw-gap-8" *ngIf="$isConfirmedBarcode()">
            <div class="tw-font-semibold tw-text-xl tw-text-right">
              <label for="confirm-item-input">{{ 'NECK_LABEL.CONFIRM_ITEM' | translate | uppercase }}</label>
            </div>
            <div class="tw-flex-1">
              <input
                id="confirm-dtf-nl-input"
                type="text"
                nz-input
                [formControl]="confirmDtfNl"
                nzSize="large"
                [placeholder]="'NECK_LABEL.CONFIRM_ITEM_PLACEHOLDER' | translate"
                appKeepFocus
                focusOnInitOnly
                (keyup.enter)="onConfirmDtfNl()" />
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
              >{{ msg.key | translate : msg.params }}</span
            >
          </div>
        </div>
      </div>
      <!-- Main Panel -->
      <app-neck-label-step-scan-dtl-nl-main-panel class="tw-flex-1" />
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelStepScanDtfNlComponent {
  nlStore = inject(NeckLabelStore);
  scanDtfNl = new FormControl('', { nonNullable: true });
  confirmDtfNl = new FormControl('', { nonNullable: true });
  $scanMsg = this.nlStore.selectSignal(s => s.scanMessage);

  $isConfirmedBarcode = signal(false);
  $itemBarcode = this.nlStore.selectSignal(s => s.scanItem!.barcode);
  $dtfStep = this.nlStore.selectSignal(s => s.scanItem!.dtfNeckLabelStep!);

  onScanDtfNl() {
    const scanValue = this.scanDtfNl.getRawValue().trim();
    this.scanDtfNl.reset();
    this.nlStore.patchState({ scanMessage: null });

    if (this.$dtfStep().rejectLabelBarcodes.some(lb => lb.barcode.toUpperCase() === scanValue.toUpperCase())) {
      this.nlStore.verifyDtfNeckLabel({ reviewBarcode: scanValue.toUpperCase() });
      return;
    }

    const extractedBarcode = scanValue.startsWith('DTF') ? scanValue.split('_')[2].slice(-7) : extractUnitBarcode(scanValue);

    if (extractedBarcode.toUpperCase() !== this.$itemBarcode().toUpperCase()) {
      this.nlStore.patchState({
        scanMessage: { key: `Barcode '${extractedBarcode}' is invalid`, color: 'red' },
      });
      return;
    }

    this.$isConfirmedBarcode.set(true);
  }

  onConfirmDtfNl() {
    const scanValue = this.confirmDtfNl.getRawValue().trim();
    this.confirmDtfNl.reset();

    const reviewBarcode = this.$dtfStep().verifyLabelBarcodes.find(lb => lb.barcode.toUpperCase() === scanValue.toUpperCase());
    if (!reviewBarcode) {
      this.nlStore.patchState({
        scanMessage: { key: `Barcode ${scanValue} is invalid`, color: 'red' },
      });
      return;
    }

    this.nlStore.verifyDtfNeckLabel({ reviewBarcode: scanValue.toUpperCase() });
  }
}
