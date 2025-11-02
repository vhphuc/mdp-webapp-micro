import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TrimStore } from '../data-access/store/trim.store';
import { TrimControlErrorComponent } from '../ui/component/trim-control-error.component';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { TrimType } from '../data-access/model/enum/trim-type';
import { TrimScanAction } from '../data-access/model/enum/trim-scan-action';

@Component({
  selector: 'app-trim-confirm-hangtags',
  standalone: true,
  imports: [
    CommonModule,
    KeepFocusDirective,
    NzInputModule,
    ReactiveFormsModule,
    TranslateModule,
    TrimControlErrorComponent,
    ImgPreviewDirective,
    ImageErrorUrlDirective,
  ],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col">
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-font-semibold tw-text-xl tw-text-right tw-min-w-[300px]">
          <label for="confirm-hangtags-input">{{ 'TRIM.CONFIRM_HANGTAGS' | translate | uppercase }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            id="confirm-hangtags-input"
            type="text"
            nz-input
            nzSize="large"
            [placeholder]="'TRIM.CONFIRM_HANGTAGS' | translate"
            [formControl]="scanConfirmHangtagControl"
            (keyup.enter)="scanConfirmHangtag()"
            appKeepFocus
            focusOnInitOnly />
        </div>
      </div>
      <app-trim-control-error />
      <div class="tw-flex-1 tw-image-fill" *ngIf="$firstUnconfirmedHangtags()">
        <img [src]="$firstUnconfirmedHangtags()!.previewUrl" appPreviewImage appImageErrorUrl />
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimConfirmHangtagsComponent {
  trimStore = inject(TrimStore);
  $firstUnconfirmedHangtags = this.trimStore.selectSignal(s => {
    const trims = s.item!.trims;
    return trims.find(
      trim => trim.trimType === TrimType.Hangtag && trim.verifiedBarcode!.action === TrimScanAction.Accept && trim.confirmedBarcode === null
    );
  });

  scanConfirmHangtagControl = new FormControl('', { nonNullable: true });

  scanConfirmHangtag() {
    const scanCode = this.scanConfirmHangtagControl.getRawValue().toUpperCase().trim();
    this.scanConfirmHangtagControl.reset();
    if (!scanCode) return;
    this.trimStore.patchState({ controlError: null });

    const firstUnconfirmedHangtag = this.$firstUnconfirmedHangtags();
    if (!firstUnconfirmedHangtag) return;

    const matchConfirmBarcode = firstUnconfirmedHangtag.confirmBarcodes.find(cb => cb.barcode === scanCode);
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
          errorKey: 'TRIM.HANGTAGS_REJECTED',
        },
      });
      return;
    }

    this.trimStore.patchState(s => {
      const currHangtag = s.item!.trims.find(
        trim =>
          trim.trimType === TrimType.Hangtag && trim.verifiedBarcode!.action === TrimScanAction.Accept && trim.confirmedBarcode === null
      );
      currHangtag!.confirmedBarcode = matchConfirmBarcode;
      return { ...s };
    });

    const isConfirmedAllHangtags = this.trimStore.selectSignal(s =>
      s
        .item!.trims.filter(tr => tr.trimType === TrimType.Hangtag && tr.verifiedBarcode?.action === TrimScanAction.Accept)
        .every(tr => tr.confirmedBarcode !== null)
    )();
    const hasAcceptedSticker = this.trimStore.selectSignal(s =>
      s.item!.trims.some(t => t.trimType === TrimType.Sticker && t.verifiedBarcode!.action === TrimScanAction.Accept)
    )();
    if (isConfirmedAllHangtags && !hasAcceptedSticker) {
      this.trimStore.confirm();
    }
  }
}
