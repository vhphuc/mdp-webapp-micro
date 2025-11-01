import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NgIf, UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ScanBarcode } from '../hangtag.model';

@Component({
  selector: 'app-hangtag-insert-attributes',
  standalone: true,
  imports: [ImageErrorUrlDirective, NgIf, TranslateModule, UpperCasePipe],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full">
      <div class="tw-text-center tw-m-3">
        <span class="tw-font-semibold tw-inline-block">{{ 'NECK_LABEL.ITEM_STATUS' | translate }}: </span>
        <span class="tw-uppercase"> {{ barcode.statusDescription | uppercase }}</span>
      </div>
      <div class="tw-flex-1 tw-flex tw-gap-4">
        @for (insertAttribute of barcode.insertAttributes; track insertAttribute.location) {
          <div class="tw-flex-1 tw-flex tw-flex-col">
            <div class="tw-flex-1 tw-image-fill tw-border tw-border-solid tw-border-black">
              <img [src]="insertAttribute.previewUrl" appImageErrorUrl />
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HangtagInsertAttributesComponent {
  @Input({ required: true }) barcode!: ScanBarcode.Response;
}
