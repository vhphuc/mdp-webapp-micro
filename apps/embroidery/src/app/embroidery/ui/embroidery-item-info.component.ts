import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ScanItem } from '../embroidery.model';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-embroidery-item-info',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="tw:h-full tw:flex tw:flex-col">
      <div class="tw:mb-3 tw:text-xl">
        <div>
            @if (item()!.preQrCode) {
              <span class="tw:font-semibold">{{ 'NECK_LABEL.PREQRCODE' | translate }}: </span>
              <span>{{ item().preQrCode }}</span>
            }
            @else {
              <span class="tw:font-semibold">{{ 'NECK_LABEL.BARCODE' | translate }}: </span>
              <span>{{ item().barcode }}</span>
            }
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.SKU' | translate }}: </span>
          <span>{{ item().sku }}</span>
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.QUANTITY' | translate }}: </span>
          <span>{{ item().quantity }}</span>
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.PARTNER_ID' | translate }}: </span>
          <span>{{ item().partnerId }}</span>
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.ORDER' | translate }}: </span>
          <span>{{ item().orderId }}</span>
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.PARTNER_ORDER' | translate }}: </span>
          <span>{{ item().partnerOrderId }}</span>
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.STYLE' | translate }}: </span>
          <span>{{ item().style }}</span>
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.COLOR' | translate }}: </span>
          <span>{{ item().color }}</span>
        </div>
        <div class="tw:font-bold tw:text-red-500 tw:text-3xl">
          <span>{{ 'NECK_LABEL.SIZE' | translate }}: </span>
          <span>{{ item().size }}</span>
        </div>
        <div>
          <span class="tw:font-semibold">{{ 'NECK_LABEL.TYPE' | translate }}: </span>
          <span>{{ item().type }}</span>
        </div>
      </div>
      <div class="tw:border tw:border-solid tw:flex-1 tw:flex tw:flex-col">
        <div class="tw:flex">
          <div
            class="tw:text-blue-500 tw:border-t-0 tw:border-l-0 tw:border-b tw:border-r tw:border-solid tw:border-black tw:text-xl tw:font-bold tw:px-2">
            {{ item().locationName }}
          </div>
        </div>
        <div class="tw:flex-1 tw:image-fill">
          <img [src]="item().embPreviewUrl" class="tw:object-top" appImageErrorUrl />
        </div>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmbroideryItemInfoComponent {
  item = input.required<ScanItem.Response>();
}
