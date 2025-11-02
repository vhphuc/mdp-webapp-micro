import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TranslateModule } from '@ngx-translate/core';
import { NeckLabelStore } from '../data-access/store/neck-label.store';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NeckLabelStepScanRegularAttributeMainPanelComponent } from '../ui/component/neck-label-step-scan-regular-attribute-main-panel.component';
import { ENeckLabelType } from '../data-access/model/api/neck-label';

@Component({
  selector: 'app-neck-label-step-scan-regular-attribute',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    KeepFocusDirective,
    NzInputModule,
    TranslateModule,
    ReactiveFormsModule,
    NzTypographyModule,
    ImageErrorUrlDirective,
    NeckLabelStepScanRegularAttributeMainPanelComponent,
  ],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
      <!-- Scan Control -->
      <div class="tw-flex tw-gap-6">
        <div class="tw-w-1/2">
          <div class="tw-flex tw-items-center tw-gap-8">
            <div class="tw-font-semibold tw-text-xl tw-text-right">
              <label for="confirm-item-input">{{ 'NECK_LABEL.CONFIRM_ITEM' | translate | uppercase }}</label>
            </div>
            <div class="tw-flex-1">
              <input
                id="confirm-item-input"
                type="text"
                nz-input
                [formControl]="scanAttributeControl"
                nzSize="large"
                [placeholder]="'NECK_LABEL.ACCEPT_OR_REJECT_ITEM' | translate"
                appKeepFocus
                focusOnInitOnly
                (keyup.enter)="onScanAttribute()" />
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
              [innerHTML]="msg.key | translate: msg.params"></span>
          </div>
        </div>
      </div>
      <!-- Main Panel -->
      <app-neck-label-step-scan-regular-attribute-main-panel class="tw-flex-1" />
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelStepScanRegularAttributeComponent {
  nlStore = inject(NeckLabelStore);
  scanAttributeControl = new FormControl('', { nonNullable: true });
  $scanMsg = this.nlStore.selectSignal(s => s.scanMessage);

  onScanAttribute() {
    const attributeBarcode = this.scanAttributeControl.value.trim();
    this.scanAttributeControl.reset();

    if (!attributeBarcode) return;

    const matchAcceptBarcode = this.nlStore.$acceptBarcodes().find(ab => ab.code.toUpperCase() === attributeBarcode.toUpperCase());
    if (matchAcceptBarcode) {
      this.nlStore.scanAcceptUnitAttribute(matchAcceptBarcode);
      return;
    }

    const rejectNLBarcode = this.nlStore.selectSignal(s => s.scanItem!)().rejectNLCode;
    if (attributeBarcode.toUpperCase() === rejectNLBarcode.toUpperCase()) {
      this.nlStore.scanRejectUnitAttribute(ENeckLabelType.NeckLabel);
      return;
    }

    this.nlStore.patchState({
      scanMessage: { key: 'NECK_LABEL.BARCODE_INVALID', params: { barcode: attributeBarcode }, color: 'red' },
    });
  }
}
