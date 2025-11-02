import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { TrimControlErrorComponent } from '../ui/component/trim-control-error.component';
import { TrimStore } from '../data-access/store/trim.store';
import { extractUnitBarcode } from '@shared/util/helper/extract-barcode';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { TrimAppColor } from '../data-access/model/enum/trim-app-color';

@Component({
  selector: 'app-trim-scan-next-item',
  standalone: true,
  imports: [
    CommonModule,
    KeepFocusDirective,
    NzInputModule,
    ReactiveFormsModule,
    TranslateModule,
    ImageErrorUrlDirective,
    ImgPreviewDirective,
    TrimControlErrorComponent,
    NzTypographyModule,
  ],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col">
      <div class="tw-flex tw-items-center tw-gap-8">
        <div class="tw-font-semibold tw-text-xl tw-text-right tw-min-w-[300px]">
          <label for="confirm-sticker-input">{{ 'TRIM.SCAN_ITEM' | translate | uppercase }}</label>
        </div>
        <div class="tw-flex-1">
          <input
            id="confirm-sticker-input"
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
      <app-trim-control-error />
      <div class="tw-text-center tw-mt-[15%]" *ngIf="$confirmMsg() as msg">
        <span
          nz-typography
          [nzType]="msg.color === TrimAppColor.Green ? 'success' : 'danger'"
          class="tw-font-bold tw-text-5xl tw-leading-normal tw-whitespace-pre-line"
          >{{ msg.messageKey | translate : msg.messageParams }}</span
        >
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimScanNextItemComponent {
  trimStore = inject(TrimStore);
  $confirmMsg = this.trimStore.selectSignal(s => s.confirmApiMsg);
  scanItemControl = new FormControl('', { nonNullable: true });

  scanItem() {
    const barcode = extractUnitBarcode(this.scanItemControl.value.trim());
    this.scanItemControl.reset();

    if (!barcode) return;

    this.trimStore.scanItem({ barcode });
  }

  protected readonly TrimAppColor = TrimAppColor;
}
