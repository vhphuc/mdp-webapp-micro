import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { NzBreadCrumbComponent, NzBreadCrumbItemComponent } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { HangtagStore } from '../hangtag.store';

@Component({
  selector: 'app-hangtag-breadcrumb',
  standalone: true,
  imports: [NgIf, NzBreadCrumbComponent, NzBreadCrumbItemComponent, TranslateModule],
  template: `
    <nz-breadcrumb class="tw-mb-1 tw-text-white [&_.ant-breadcrumb-separator]:tw-text-white">
      <nz-breadcrumb-item class="tw-uppercase" (click)="reset()"
        ><span class="tw-underline tw-cursor-pointer tw-text-white tw-font-semibold">{{ 'HANGTAG' | translate }}</span></nz-breadcrumb-item
      >
      @if (barcode() === null) {
        <nz-breadcrumb-item class="tw-uppercase tw-text-white tw-font-semibold">{{
          'NECK_LABEL.BREAD_CRUMB.SCAN_ITEM' | translate
        }}</nz-breadcrumb-item>
      } @else {
        <nz-breadcrumb-item class="tw-uppercase tw-text-white tw-font-semibold">
          {{ barcode()!.preQrBarcode ?? barcode()!.barcode }}
        </nz-breadcrumb-item>
      }
    </nz-breadcrumb>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HangtagBreadcrumbComponent {
  store = inject(HangtagStore);
  barcode = this.store.barcode;

  reset() {
    this.barcode.set(null);
  }
}
