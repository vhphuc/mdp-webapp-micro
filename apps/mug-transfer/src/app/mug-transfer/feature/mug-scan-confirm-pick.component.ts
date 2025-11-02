import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { MugControlErrorComponent } from '../ui/component/mug-control-error.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MugStore } from '../data-access/store/mug-store.store';
import { MugPickScanCode } from '../data-access/model/ui/scan-code';

@Component({
  selector: 'app-mug-scan-confirm-pick',
  standalone: true,
  imports: [
    CommonModule,
    ImageErrorUrlDirective,
    ImgPreviewDirective,
    KeepFocusDirective,
    MugControlErrorComponent,
    NzInputModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col" *ngIf="$item() as item">
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-font-semibold tw-text-xl tw-text-right tw-min-w-[300px]">
          <label for="scan-pick-bin-input">{{ 'MUG.CONFIRM_PICK' | translate | uppercase }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            id="scan-pick-bin-input"
            type="text"
            nz-input
            nzSize="large"
            [placeholder]="'ACCEPT_REJECT' | translate"
            [formControl]="scanControl"
            (keyup.enter)="scan()"
            appKeepFocus
            focusOnInitOnly />
        </div>
      </div>
      <app-mug-control-error />
      <div class="tw-flex-1 tw-flex tw-flex-col">
        <div class="tw-flex tw-items-center tw-justify-center tw-gap-8">
          <div class="tw-border tw-border-solid tw-border-black tw-px-4 tw-py-3 tw-mb-3">{{ 'MUG.MUG' | translate | uppercase }}</div>
          <div class="tw-border tw-border-solid tw-border-black tw-px-4 tw-py-3 tw-mb-3">{{ item.binName }}</div>
        </div>
        <div class="tw-flex-1 tw-image-fill">
          <img [src]="item.mugImageUrl" [appPreviewImage]="[item.mugImageUrl]" appImageErrorUrl class="tw-object-top" />
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MugScanConfirmPickComponent {
  mugStore = inject(MugStore);
  $item = this.mugStore.selectSignal(s => s.item!);

  scanControl = new FormControl('');

  scan() {
    const scanCode = this.scanControl.getRawValue()?.toUpperCase().trim();
    this.scanControl.reset();
    if (!scanCode) return;
    this.mugStore.patchState({ controlError: null });

    if (scanCode !== MugPickScanCode.Accept && scanCode !== MugPickScanCode.Reject) {
      this.mugStore.patchState({
        controlError: { errorKey: 'BARCODE_#_XXX_IS_INVALID', paramError: { xxx: scanCode } },
      });
      return;
    }

    this.mugStore.scanMugPick({ pickActionBarcode: scanCode });
  }
}
