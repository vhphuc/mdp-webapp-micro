import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { ImgPreviewDirective } from '@shared/lib/img-preview/img-preview.directive';
import { TranslateModule } from '@ngx-translate/core';
import { MugStore } from '../data-access/store/mug-store.store';
import { MugPickScanCode, MugPrintScanCode } from '../data-access/model/ui/scan-code';

@Component({
  selector: 'app-mug-left-panel',
  standalone: true,
  imports: [CommonModule, ImageErrorUrlDirective, ImgPreviewDirective, TranslateModule],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col tw-gap-y-8" *ngIf="$item() as item">
      <!-- Item info -->
      <div class="tw-flex tw-gap-6">
        <div class="tw-flex-1">
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'MUG.PARTNER_ID' | translate }}: </span>
            <span>{{ item.customPartnerId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'MUG.ORDER_ID' | translate }}: </span>
            <span>{{ item.orderId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'MUG.PARTNER_ORDER_ID' | translate }}: </span>
            <span>{{ item.xId }}</span>
          </div>
        </div>
        <div class="tw-flex-1">
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'MUG.BARCODE' | translate }}: </span>
            <span>{{ item.barcode }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'MUG.SKU' | translate }}: </span>
            <span>{{ item.sku }}</span>
          </div>
          <div class="tw-text-xl" *ngIf="$currStep() !== 'confirm-print' && $item().printScannedCode !== MugPrintScanCode.Reject">
            <span class="tw-font-semibold">{{ 'MUG.QUANTITY' | translate }}: </span>
            <span>1</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'MUG.SLA_DATE' | translate }}: </span>
            <span>{{ item.slaDateOnUtc | date : 'MMM d' }}</span>
          </div>
        </div>
      </div>
      <!-- Images -->
      <div class="tw-flex tw-gap-6">
        <div class="tw-flex-1">
          <div
            [class.tw-bg-yellow-300]="item.printScannedCode !== MugPrintScanCode.Accept"
            [class.tw-bg-green-500]="item.printScannedCode === MugPrintScanCode.Accept">
            <span class="tw-text-xl tw-font-semibold">{{ 'MUG.TRANSFER' | translate | uppercase }}</span>
          </div>
          <div class="tw-h-[300px] tw-w-full tw-image-fill tw-bg-white">
            <img [src]="item.previewUrl" [appPreviewImage]="[item.previewUrl!]" appImageErrorUrl class="tw-object-top" />
          </div>
        </div>
        <div class="tw-flex-1">
          <div
            [class.tw-bg-yellow-300]="item.pickScannedCode !== MugPickScanCode.Accept"
            [class.tw-bg-green-500]="item.pickScannedCode === MugPickScanCode.Accept">
            <span class="tw-text-xl tw-font-semibold">{{ 'MUG.MUG' | translate | uppercase }}</span>
          </div>
          <div class="tw-text-xl">
            <span>{{ 'MUG.BIN_#' | translate }}: </span>
            <span>{{ item.binName }}</span>
          </div>
          <div class="tw-text-xl">
            <span>{{ 'MUG.SIZE' | translate }}: </span>
            <span>{{ item.size }}</span>
          </div>
          <div class="tw-text-xl">
            <span>{{ 'MUG.COLOR' | translate }}: </span>
            <span>{{ item.color }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MugLeftPanelComponent {
  mugStore = inject(MugStore);
  $item = this.mugStore.selectSignal(s => s.item!);
  $currStep = this.mugStore.$currStep;

  protected readonly MugPrintScanCode = MugPrintScanCode;
  protected readonly MugPickScanCode = MugPickScanCode;
}
