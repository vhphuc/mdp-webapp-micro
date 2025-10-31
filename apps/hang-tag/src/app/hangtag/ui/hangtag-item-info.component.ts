import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ScanBarcode } from '../hangtag.model';

@Component({
  selector: 'app-hangtag-item-info',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <div class="tw:mb-3 tw:text-xl">
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.BARCODE' | translate }}: </span>
        <span>{{ barcode.preQrBarcode ?? barcode.barcode }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.SKU' | translate }}: </span>
        <span>{{ barcode.orderDetail.sku }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.QUANTITY' | translate }}: </span>
        <span>{{ barcode.quantity }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.PARTNER_ID' | translate }}: </span>
        <span>{{ barcode.order.customPartnerId }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.ORDER' | translate }}: </span>
        <span>{{ barcode.order.orderId }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.PARTNER_ORDER' | translate }}: </span>
        <span>{{ barcode.order.xid }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.STYLE' | translate }}: </span>
        <span>{{ barcode.orderDetail.styleDesc }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.COLOR' | translate }}: </span>
        <span>{{ barcode.orderDetail.colorName }}</span>
      </div>
      <div class="tw:font-bold tw:text-red-500 tw:text-3xl">
        <span>{{ 'NECK_LABEL.SIZE' | translate }}: </span>
        <span>{{ barcode.orderDetail.sizeName }}</span>
      </div>
      <div>
        <span class="tw:font-semibold">{{ 'NECK_LABEL.TYPE' | translate }}: </span>
        <span>{{ barcode.orderDetail.sizeClassName }}</span>
      </div>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HangtagItemInfoComponent {
  @Input({ required: true }) barcode!: ScanBarcode.Response;
}
