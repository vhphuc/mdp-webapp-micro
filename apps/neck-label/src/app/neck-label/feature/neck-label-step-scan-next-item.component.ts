import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NeckLabelStore } from '../data-access/store/neck-label.store';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { extractJitItemBarcode, extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TranslateModule } from '@ngx-translate/core';
import {
  NeckLabelStepScanRegularAttributeMainPanelComponent,
} from '../ui/component/neck-label-step-scan-regular-attribute-main-panel.component';
import {
  NeckLabelStepScanDtlNlMainPanelComponent,
} from '../ui/component/neck-label-step-scan-dtl-nl-main-panel.component';

@Component({
  selector: 'app-neck-label-step-scan-next-item',
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
    NeckLabelStepScanRegularAttributeMainPanelComponent,
    NeckLabelStepScanDtlNlMainPanelComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
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
      <!-- Main Panel -->
      <app-neck-label-step-scan-regular-attribute-main-panel *ngIf="!$isDtf()" class="tw-flex-1" />
      <app-neck-label-step-scan-dtl-nl-main-panel *ngIf="$isDtf()" class="tw-flex-1" />
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelStepScanNextItemComponent {
  nlStore = inject(NeckLabelStore);
  scanItemControl = new FormControl('', { nonNullable: true });
  $scanMsg = this.nlStore.selectSignal(s => s.scanMessage);

  $isDtf = this.nlStore.selectSignal(s => s.scanItem!.dtfNeckLabelStep && !s.scanItem!.dtfNeckLabelStep.isIgnoreScan);

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
