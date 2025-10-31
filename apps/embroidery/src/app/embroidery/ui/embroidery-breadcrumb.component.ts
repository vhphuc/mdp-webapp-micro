import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { EmbroideryStore } from '../embroidery.store';

@Component({
  selector: 'app-embroidery-breadcrumb',
  standalone: true,
  imports: [NzBreadCrumbModule, TranslateModule],
  template: `
    <nz-breadcrumb class="tw:mb-1 tw:text-white">
      <nz-breadcrumb-item class="tw:uppercase" (click)="reset()"
        ><span class="tw:underline tw:cursor-pointer tw:text-white tw:font-semibold">EMBROIDERY</span></nz-breadcrumb-item
      >
      @switch (step()) {
        @case ('scan-item') {
          <nz-breadcrumb-item class="tw:uppercase tw:text-white tw:font-semibold">{{
            'NECK_LABEL.BREAD_CRUMB.SCAN_ITEM' | translate
          }}</nz-breadcrumb-item>
        }
        @case ('confirm-item') {
          <nz-breadcrumb-item class="tw:uppercase tw:text-white tw:font-semibold">
            @if (item()!.preQrCode) {
              {{ item()!.preQrCode }}
            }
            @else {
              {{ item()!.barcode }}
            }
          </nz-breadcrumb-item>
          <nz-breadcrumb-item class="tw:uppercase tw:text-white tw:font-semibold">{{
            'NECK_LABEL.BREAD_CRUMB.CONFIRM_ITEM' | translate
          }}</nz-breadcrumb-item>
        }
      }
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
export class EmbroideryBreadcrumbComponent {
  store = inject(EmbroideryStore);
  item = this.store.item;
  step = this.store.step;

  reset() {
    this.store.step.set('scan-item');
    this.store.item.set(null);
    this.store.scanMsg.set(null);
  }
}
