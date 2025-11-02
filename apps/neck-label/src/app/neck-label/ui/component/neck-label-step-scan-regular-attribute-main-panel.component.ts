import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { TranslateModule } from '@ngx-translate/core';
import { NeckLabelStore } from '../../data-access/store/neck-label.store';

@Component({
  selector: 'app-neck-label-step-scan-regular-attribute-main-panel',
  standalone: true,
  imports: [CommonModule, ImageErrorUrlDirective, TranslateModule],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full" *ngIf="$scanItem() as scanItem">
      <div class="tw-text-center tw-m-3">
        <span class="tw-font-semibold tw-inline-block">{{ 'NECK_LABEL.ITEM_STATUS' | translate }}: </span>
        <span class="tw-uppercase"> {{ scanItem.statusName | uppercase }}</span>
      </div>
      <div class="tw-flex-1 tw-flex tw-gap-4 tw-text-white">
        <div *ngIf="scanItem.neckLabelBinId" class="tw-flex-1 tw-flex tw-flex-col">
          <div class="tw-flex tw-gap-x-2 tw-justify-center tw-mb-3">
            <span
              class="tw-inline-block tw-font-semibold tw-text-gray-500
                           tw-border tw-border-solid tw-border-gray-300 tw-py-2 tw-px-8"
              >{{ 'NECK_LABEL.NECK_LABEL_BIN' | translate }}</span
            >
            <div
              class="tw-border tw-border-solid tw-border-gray-300 tw-py-2 tw-px-8"
              [ngClass]="{
                'tw-text-white tw-bg-green-700 tw-border-green-700': scanItem.isAcceptedNeckLabel,
                'tw-text-white tw-bg-red-500 tw-border-red-500': scanItem.isRejectedNeckLabel,
                'tw-text-gray-500': !scanItem.isAcceptedNeckLabel && !scanItem.isRejectedNeckLabel
              }">
              <span class="tw-font-semibold">{{ 'NECK_LABEL.BIN' | translate }} {{ scanItem.neckLabelBinId }}</span>
            </div>
          </div>
          <div class="tw-flex-1 tw-image-fill tw-border tw-border-solid tw-border-black">
            <img [src]="scanItem.nlPreviewUrl" appImageErrorUrl />
          </div>
        </div>
        <div *ngIf="scanItem.patchBinId" class="tw-flex-1 tw-flex tw-flex-col">
          <div class="tw-flex tw-gap-x-2 tw-justify-center tw-mb-3">
            <span
              class="tw-inline-block tw-font-semibold tw-text-gray-500
                           tw-border tw-border-solid tw-border-gray-300 tw-py-2 tw-px-8"
              >{{ 'NECK_LABEL.PATCH_BIN' | translate }}</span
            >
            <span
              class="tw-inline-block tw-font-semibold
                           tw-border tw-border-solid tw-py-2 tw-px-8 tw-text-gray-500 tw-border-gray-300"
              [ngClass]="{ 'tw-text-white tw-bg-green-700 tw-border-green-700': scanItem.isAcceptedPatch }"
              >{{ 'NECK_LABEL.BIN' | translate }} {{ scanItem.patchBinId }}</span
            >
            <div
              class="tw-border tw-border-solid tw-border-gray-300 tw-py-2 tw-px-8"
              [ngClass]="{
                'tw-text-white tw-bg-green-700 tw-border-green-700': scanItem.isAcceptedPatch,
                'tw-text-gray-500': !scanItem.isAcceptedPatch
              }">
              <span class="tw-font-semibold">{{ 'NECK_LABEL.BIN' | translate }} {{ scanItem.patchBinId }}</span>
            </div>
          </div>
          <div class="tw-flex-1 tw-image-fill tw-border tw-border-solid tw-border-black tw-p-2">
            <img [src]="scanItem.patchPreviewUrl" appImageErrorUrl />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelStepScanRegularAttributeMainPanelComponent {
  nlStore = inject(NeckLabelStore);
  $scanItem = this.nlStore.selectSignal(s => s.scanItem!);
}
