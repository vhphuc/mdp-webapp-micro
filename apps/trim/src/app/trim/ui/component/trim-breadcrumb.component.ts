import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { TrimStore } from '../../data-access/store/trim.store';

@Component({
  selector: 'app-trim-breadcrumb',
  standalone: true,
  imports: [CommonModule, NzBreadCrumbModule, TranslateModule],
  template: `
    <nz-breadcrumb class="tw-text-white tw-font-semibold">
      <nz-breadcrumb-item class="tw-text-white tw-uppercase">
        <span class="tw-underline tw-cursor-pointer" (click)="resetScanProcess()">TRIM</span>
      </nz-breadcrumb-item>
      <ng-container *ngIf="$item() as item">
        <nz-breadcrumb-item>
          @if (item.orderDetailUnit.preQrCode) {
            <span>{{ item.orderDetailUnit.preQrCode }}</span>
          }
          @else {
            <span>{{ item.orderDetailUnit.barcode }}</span>
          }
        </nz-breadcrumb-item>
        <nz-breadcrumb-item class="tw-text-white">
          <ng-container [ngSwitch]="$currStep()">
            <span *ngSwitchCase="'confirm-picked-trims'">{{ 'TRIM.CONFIRM_TRIMS' | translate | uppercase }}</span>
            <span *ngSwitchCase="'confirm-hangtags'">{{ 'TRIM.CONFIRM_HANGTAGS' | translate | uppercase }}</span>
            <span *ngSwitchCase="'confirm-sticker'">{{ 'TRIM.CONFIRM_STICKER' | translate | uppercase }}</span>
            <span *ngSwitchCase="'scan-next-item'">{{ 'TRIM.CONFIRMED_TRIMS' | translate | uppercase }}</span>
          </ng-container>
        </nz-breadcrumb-item>
      </ng-container>
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
export class TrimBreadcrumbComponent {
  trimStore = inject(TrimStore);
  $item = this.trimStore.selectSignal(s => s.item);
  $currStep = this.trimStore.$currStep;
  resetScanProcess() {
    this.trimStore.patchState({ item: null, controlError: null, confirmApiMsg: null });
  }
}
