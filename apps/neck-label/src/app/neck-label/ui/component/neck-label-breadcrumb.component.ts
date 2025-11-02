import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { NeckLabelStore } from '../../data-access/store/neck-label.store';
import { NeckLabelStep } from '../../data-access/model/ui/neck-label-step';

@Component({
  selector: 'app-neck-label-breadcrumb',
  standalone: true,
  imports: [CommonModule, NzBreadCrumbModule, TranslateModule],
  template: `
    <nz-breadcrumb class="tw-mb-1 tw-text-white">
      <nz-breadcrumb-item class="tw-uppercase" (click)="reset()"
        ><span class="tw-underline tw-cursor-pointer tw-text-white tw-font-semibold">{{
          'NECK_LABEL.BREAD_CRUMB.NECK_LABELING' | translate
        }}</span></nz-breadcrumb-item
      >
      <nz-breadcrumb-item
        class="tw-uppercase tw-text-white tw-font-semibold"
        *ngIf="$currStep() === null || $currStep() === NeckLabelStep.ScanNextItem"
        >{{ 'NECK_LABEL.BREAD_CRUMB.SCAN_ITEM' | translate }}</nz-breadcrumb-item
      >
      <nz-breadcrumb-item
        class="tw-uppercase tw-text-white tw-font-semibold"
        *ngIf="$currStep() !== null && $currStep() !== NeckLabelStep.ScanNextItem"
        >
          @if ($scanItem()!.preQrCode) {
            {{ $scanItem()!.preQrCode }}
          }
          @else {
            {{ $scanItem()!.barcode }}
          }
        </nz-breadcrumb-item
      >
      <nz-breadcrumb-item
        class="tw-uppercase tw-text-white tw-font-semibold"
        *ngIf="$currStep() !== null && $currStep() !== NeckLabelStep.ScanNextItem"
        >{{ 'NECK_LABEL.BREAD_CRUMB.CONFIRM_ITEM' | translate }}</nz-breadcrumb-item
      >
    </nz-breadcrumb>
  `,
  styles: [
    `
      :host ::ng-deep .ant-breadcrumb-separator {
        color: white;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelBreadcrumbComponent {
  nlStore = inject(NeckLabelStore);
  $scanItem = this.nlStore.selectSignal(s => s.scanItem);
  $currStep = this.nlStore.$currStep;

  reset() {
    this.nlStore.patchState({ scanItem: null, scanMessage: null });
  }

  protected readonly NeckLabelStep = NeckLabelStep;
}
