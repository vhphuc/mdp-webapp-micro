import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { TranslateModule } from '@ngx-translate/core';
import { NeckLabelStore } from '../../data-access/store/neck-label.store';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';

@Component({
  selector: 'app-neck-label-step-scan-dtl-nl-main-panel',
  standalone: true,
  imports: [CommonModule, ImageErrorUrlDirective, TranslateModule],
  template: `
    <div class="tw-flex tw-flex-col tw-h-full" *ngIf="$dtfStep() as dtfStep">
      <div class="tw-text-center tw-m-3">
        <span class="tw-font-semibold tw-inline-block">{{ 'NECK_LABEL.ITEM_STATUS' | translate }}: </span>
        <span> {{ $statusName() | uppercase }}</span>
      </div>
      <div class="tw-flex tw-gap-x-2 tw-justify-center tw-mb-3">
        <span
          class="tw-inline-block tw-font-semibold
                 tw-border tw-border-solid tw-py-2 tw-px-8 tw-text-gray-500 tw-border-gray-300"
          [class.tw-text-white]="$isRedLabel() || $isGreenLabel()"
          [ngClass]="{
            'tw-bg-red-500 tw-border-red-500': $isRedLabel(),
            'tw-bg-green-700 tw-border-green-700': $isGreenLabel(),
          }"
          >{{ 'NECK_LABEL.DTF_NECKLABEL' | translate }}</span
        >
      </div>
      <div class="tw-flex-1 tw-image-fill tw-border tw-border-solid tw-border-black">
        <div *ngIf="dtfStep.isNoDesign" class="tw-flex tw-items-center tw-justify-center tw-h-full">
          <span class="tw-text-2xl tw-font-bold">{{ 'ORDER.DTG_NO_DESIGN' | translate }}</span>
        </div>
        <img *ngIf="!dtfStep.isNoDesign" [src]="dtfStep.fileUrl" appImageErrorUrl />
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelStepScanDtlNlMainPanelComponent {
  nlStore = inject(NeckLabelStore);
  $dtfStep = this.nlStore.selectSignal(s => s.scanItem!.dtfNeckLabelStep!);
  $statusName = this.nlStore.selectSignal(s => s.scanItem!.statusName);
  $isGreenLabel = this.nlStore.selectSignal(s => s.scanItem!.status === ItemTransitionStatus.DtfLabelled);
  $isRedLabel = this.nlStore.selectSignal(s =>
    [
      ItemTransitionStatus.DtfLabelMissing,
      ItemTransitionStatus.DtfLabelDamaged,
      ItemTransitionStatus.DtfLabelWrong,
      ItemTransitionStatus.DtfLabelRejected,
    ].includes(s.scanItem!.status)
  );
  protected readonly ItemTransitionStatus = ItemTransitionStatus;
}
