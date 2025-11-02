import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { NeckLabelScanUnitApi } from '../../data-access/model/api/neck-label';

@Component({
  selector: 'app-neck-label-item-info',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="tw-mb-3 tw-text-xl">
      <div>
        @if (scanItem.preQrCode) {
          <span class="tw-font-semibold">{{ 'NECK_LABEL.PREQRCODE' | translate }}: </span>
          <span>{{ scanItem.preQrCode }}</span>
        }
        @else {
          <span class="tw-font-semibold">{{ 'NECK_LABEL.BARCODE' | translate }}: </span>
          <span>{{ scanItem.barcode }}</span>
        }
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.SKU' | translate }}: </span>
        <span>{{ scanItem.sku }}</span>
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.QUANTITY' | translate }}: </span>
        <span>{{ scanItem.quantity }}</span>
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.PARTNER_ID' | translate }}: </span>
        <span>{{ scanItem.partnerId }}</span>
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.ORDER' | translate }}: </span>
        <span>{{ scanItem.orderId }}</span>
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.PARTNER_ORDER' | translate }}: </span>
        <span>{{ scanItem.partnerOrderId }}</span>
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.STYLE' | translate }}: </span>
        <span>{{ scanItem.style }}</span>
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.COLOR' | translate }}: </span>
        <span>{{ scanItem.color }}</span>
      </div>
      <div class="tw-font-bold tw-text-red-500 tw-text-3xl">
        <span>{{ 'NECK_LABEL.SIZE' | translate }}: </span>
        <span>{{ scanItem.size }}</span>
      </div>
      <div>
        <span class="tw-font-semibold">{{ 'NECK_LABEL.TYPE' | translate }}: </span>
        <span>{{ scanItem.type }}</span>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelItemInfoComponent {
  @Input({ required: true }) scanItem!: NeckLabelScanUnitApi.Response;
}
