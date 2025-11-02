import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { MugControlErrorComponent } from '../ui/component/mug-control-error.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { TranslateModule } from '@ngx-translate/core';
import { MugStore } from '../data-access/store/mug-store.store';

@Component({
  selector: 'app-mug-scan-mug-bin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ImageErrorUrlDirective,
    ImgPreviewDirective,
    KeepFocusDirective,
    MugControlErrorComponent,
    NzInputModule,
    TranslateModule,
    ReactiveFormsModule,
  ],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col" *ngIf="$item() as item">
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-font-semibold tw-text-xl tw-text-right tw-min-w-[300px]">
          <label for="scan-pick-bin-input">{{ 'MUG.SCAN_PICK_BIN' | translate : { bin: item.binName } | uppercase }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            id="scan-pick-bin-input"
            type="text"
            nz-input
            nzSize="large"
            [placeholder]="'MUG.SCAN_PICK_BIN' | translate : { bin: item.binName }"
            [formControl]="scanControl"
            (keyup.enter)="scan()"
            appKeepFocus
            focusOnInitOnly />
        </div>
      </div>
      <app-mug-control-error />
      <div class="tw-flex-1 tw-flex tw-flex-col">
        <div class="tw-flex tw-items-center tw-justify-center tw-gap-8">
          <div class="tw-border tw-border-solid tw-border-black tw-px-4 tw-py-3 tw-mb-3">{{ 'MUG.MUG' | translate }}</div>
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
export class MugScanMugBinComponent {
  mugStore = inject(MugStore);
  $item = this.mugStore.selectSignal(s => s.item!);

  scanControl = new FormControl('');

  scan() {
    const scanBin = this.scanControl.getRawValue()?.trim().toUpperCase();
    this.scanControl.reset();
    if (!scanBin) return;
    this.mugStore.patchState({ controlError: null });

    if (scanBin !== this.$item().binName.toUpperCase()) {
      this.mugStore.patchState({
        controlError: {
          errorKey: 'INVALID_BIN_#:_XXX',
          paramError: { scanBin },
        },
      });
      return;
    }

    this.mugStore.$currStep.set('confirm-pick');
  }
}
