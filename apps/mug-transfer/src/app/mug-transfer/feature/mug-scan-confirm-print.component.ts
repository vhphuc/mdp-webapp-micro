import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TranslateModule } from '@ngx-translate/core';
import { MugStore } from '../data-access/store/mug-store.store';
import { MugControlErrorComponent } from '../ui/component/mug-control-error.component';
import { MugPrintScanCode } from '../data-access/model/ui/scan-code';

@Component({
  selector: 'app-mug-scan-confirm-print',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageErrorUrlDirective,
    ImgPreviewDirective,
    KeepFocusDirective,
    NzInputModule,
    TranslateModule,
    ReactiveFormsModule,
    MugControlErrorComponent,
  ],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col">
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-font-semibold tw-text-xl tw-text-right tw-min-w-[300px]">
          <label for="confirm-print-input">{{ 'MUG.CONFIRM_PRINT' | translate | uppercase }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            id="confirm-print-input"
            type="text"
            nz-input
            nzSize="large"
            [placeholder]="'ACCEPT_REJECT' | translate"
            [formControl]="scanConfirmPrintControl"
            (keyup.enter)="scanConfirmPrint()"
            appKeepFocus
            focusOnInitOnly />
        </div>
      </div>
      <app-mug-control-error />
      <div class="tw-flex-1 tw-image-fill">
        <img [src]="$item().fileUrl" [appPreviewImage]="[$item().fileUrl!]" appImageErrorUrl />
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MugScanConfirmPrintComponent {
  mugStore = inject(MugStore);
  $item = this.mugStore.selectSignal(s => s.item!);

  scanConfirmPrintControl = new FormControl('');

  scanConfirmPrint() {
    const scanCode = this.scanConfirmPrintControl.getRawValue()?.toUpperCase().trim();
    this.scanConfirmPrintControl.reset();
    if (!scanCode) return;
    this.mugStore.patchState({ controlError: null });

    if (scanCode !== MugPrintScanCode.Accept && scanCode !== MugPrintScanCode.Reject) {
      this.mugStore.patchState({
        controlError: { errorKey: 'BARCODE_#_XXX_IS_INVALID', paramError: { xxx: scanCode } },
      });
      return;
    }

    this.mugStore.scanMugPrint({ actionBarcode: scanCode });
  }
}
