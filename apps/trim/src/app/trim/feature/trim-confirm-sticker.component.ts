import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TrimControlErrorComponent } from '../ui/component/trim-control-error.component';
import { TrimStore } from '../data-access/store/trim.store';
import { TrimType } from '../data-access/model/enum/trim-type';
import { TrimScanAction } from '../data-access/model/enum/trim-scan-action';

@Component({
  selector: 'app-trim-confirm-sticker',
  standalone: true,
  imports: [
    CommonModule,
    ImageErrorUrlDirective,
    ImgPreviewDirective,
    KeepFocusDirective,
    NzInputModule,
    ReactiveFormsModule,
    TranslateModule,
    TrimControlErrorComponent,
  ],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col">
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-font-semibold tw-text-xl tw-text-right tw-min-w-[300px]">
          <label for="confirm-sticker-input">{{ 'TRIM.CONFIRM_STICKER' | translate | uppercase }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            id="confirm-sticker-input"
            type="text"
            nz-input
            nzSize="large"
            [placeholder]="'TRIM.CONFIRM_HANGTAGS' | translate"
            [formControl]="scanConfirmStickerControl"
            (keyup.enter)="scanConfirmSticker()"
            appKeepFocus
            focusOnInitOnly />
        </div>
      </div>
      <app-trim-control-error />
      <div class="tw-flex-1 tw-image-fill">
        @if ($firstUnconfirmedStickers()) {
          <img [src]="$firstUnconfirmedStickers()!.previewUrl" appPreviewImage appImageErrorUrl />
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimConfirmStickerComponent {
  trimStore = inject(TrimStore);
  $firstUnconfirmedStickers = this.trimStore.selectSignal(s => {
    const trims = s.item!.trims;
    return trims.find(
      trim => trim.trimType === TrimType.Sticker && trim.verifiedBarcode!.action === TrimScanAction.Accept && trim.confirmedBarcode === null
    );
  });

  scanConfirmStickerControl = new FormControl('');

  scanConfirmSticker() {
    const scanCode = this.scanConfirmStickerControl.getRawValue()?.toUpperCase().trim();
    this.scanConfirmStickerControl.reset();
    if (!scanCode) return;
    this.trimStore.patchState({ controlError: null });

    const firstUnconfirmedSticker = this.$firstUnconfirmedStickers();
    if (!firstUnconfirmedSticker) return;

    const matchConfirmBarcode = firstUnconfirmedSticker.confirmBarcodes.find(cb => cb.barcode === scanCode);
    if (!matchConfirmBarcode) {
      this.trimStore.patchState({
        controlError: { errorKey: 'SCAN_CODE_XXX_INVALID', paramError: { xxx: scanCode } },
      });
      return;
    }

    if (matchConfirmBarcode.action === TrimScanAction.Reject) {
      this.trimStore.patchState({
        item: null,
        controlError: {
          errorKey: 'TRIM.STICKER_REJECTED',
        },
      });
      return;
    }

    this.trimStore.patchState(s => {
      const currSticker = s.item!.trims.find(
        trim =>
          trim.trimType === TrimType.Sticker && trim.verifiedBarcode!.action === TrimScanAction.Accept && trim.confirmedBarcode === null
      );
      currSticker!.confirmedBarcode = matchConfirmBarcode;
      return { ...s };
    });

    const isConfirmedAllStickers = this.trimStore.selectSignal(s =>
      s
        .item!.trims.filter(tr => tr.trimType === TrimType.Sticker && tr.verifiedBarcode?.action === TrimScanAction.Accept)
        .every(tr => tr.confirmedBarcode !== null)
    )();
    if (isConfirmedAllStickers) {
      this.trimStore.confirm();
    }
  }
}
