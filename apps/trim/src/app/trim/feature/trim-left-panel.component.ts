import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TrimStore } from '../data-access/store/trim.store';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { TrimType } from '../data-access/model/enum/trim-type';
import { TrimScanAction } from '../data-access/model/enum/trim-scan-action';

@Component({
  selector: 'app-trim-left-panel',
  standalone: true,
  imports: [CommonModule, TranslateModule, ImgPreviewDirective, ImageErrorUrlDirective],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col tw-gap-y-8" *ngIf="$item() as item">
      <!-- Item info -->
      <div class="tw-flex tw-gap-6">
        <div class="tw-flex-1">
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'TRIM.PARTNER_ID' | translate }}: </span>
            <span>{{ item.customPartnerId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'TRIM.ORDER_ID' | translate }}: </span>
            <span>{{ item.orderId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'TRIM.PARTNER_ORDER_ID' | translate }}: </span>
            <span>{{ item.xid }}</span>
          </div>
        </div>
        <div class="tw-flex-1">
          <div class="tw-text-xl">
            @if (item.orderDetailUnit.preQrCode) {
              <span class="tw-font-semibold">{{ 'TRIM.PREQRCODE' | translate }}: </span>
              <span>{{ item.orderDetailUnit.preQrCode }}</span>
            }
            @else {
              <span class="tw-font-semibold">{{ 'TRIM.BARCODE' | translate }}: </span>
              <span>{{ item.orderDetailUnit.barcode }}</span>
            }
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'TRIM.SKU' | translate }}: </span>
            <span>{{ item.sku }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'TRIM.COO' | translate }}: </span>
            <span>{{ item.orderDetailUnit.cooName }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'TRIM.QUANTITY' | translate }}: </span>
            <span>{{ item.orderDetailUnit.quantity }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'TRIM.SLA_DATE' | translate }}: </span>
            <span>{{ item.slaDateOnUtc | date : 'MMM d' }}</span>
          </div>
        </div>
      </div>
      <!-- Images -->
      <div class="tw-flex-1 tw-grid tw-grid-cols-2 tw-gap-6">
        <div *ngFor="let image of $images()">
          <div
            [class.tw-bg-yellow-300]="image.color === 'yellow'"
            [class.tw-bg-green-500]="image.color === 'green'"
            [class.tw-bg-red-500]="image.color === 'red'">
            <span class="tw-text-xl tw-font-semibold">{{ image.name | uppercase }}</span>
          </div>
          <div class="tw-h-3/5 tw-w-3/5 tw-image-fill">
            <img [src]="image.url" appPreviewImage appImageErrorUrl class="tw-object-top" />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimLeftPanelComponent {
  trimStore = inject(TrimStore);
  $item = this.trimStore.selectSignal(s => s.item!);

  $images = this.trimStore.selectSignal<{ name: string; color: 'green' | 'yellow' | 'red' | null; url: string }[]>(() => {
    const currStep = this.trimStore.$currStep();
    const trims = this.$item().trims;

    // Show index per Trim Type (Hangtag, Sticker)
    const genName = (trimType: TrimType, indexInGroup: number) => {
      return trimType === TrimType.Hangtag ? `Hangtag ${indexInGroup}` : `Sticker ${indexInGroup}`;
    };

    if (currStep === 'confirm-picked-trims') {
      return trims.map((trim) => {
        return {
          name: genName(trim.trimType, trim.trimTypeIndex),
          color: null,
          url: trim.fileUrl,
        };
      });
    }

    const images: { name: string; color: 'green' | 'yellow' | 'red' | null; url: string }[] = [];
    for (let i = 0; i < trims.length; i++) {
      if (trims[i].verifiedBarcode!.action !== TrimScanAction.Accept) continue;

      const trim = trims[i];
      let color: 'green' | 'yellow' | 'red' | null = null;
      if (currStep === 'confirm-hangtags') {
        if (trim.trimType === TrimType.Hangtag) {
          if (trim.confirmedBarcode === null) color = 'yellow';
          if (trim.confirmedBarcode?.action === TrimScanAction.Accept) color = 'green';
          if (trim.confirmedBarcode?.action === TrimScanAction.Reject) color = 'red';
        }
        if (trim.trimType === TrimType.Sticker) color = null;
      }
      if (currStep === 'confirm-sticker') {
        if (trim.trimType === TrimType.Hangtag) {
          if (trim.confirmedBarcode?.action === TrimScanAction.Accept) color = 'green';
          if (trim.confirmedBarcode?.action === TrimScanAction.Reject) color = 'red';
        }
        if (trim.trimType === TrimType.Sticker) {
          if (trim.confirmedBarcode === null) color = 'yellow';
          if (trim.confirmedBarcode?.action === TrimScanAction.Accept) color = 'green';
          if (trim.confirmedBarcode?.action === TrimScanAction.Reject) color = 'red';
        }
      }
      if (currStep === 'scan-next-item') {
        if (trim.confirmedBarcode?.action === TrimScanAction.Accept) color = 'green';
        if (trim.confirmedBarcode?.action === TrimScanAction.Reject) color = 'red';
      }

      images.push({
        name: genName(trim.trimType, trim.trimTypeIndex),
        color,
        url: trim.fileUrl,
      });
    }

    return images;
  });
}
