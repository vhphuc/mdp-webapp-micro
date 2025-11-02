import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { MugStore } from '../../data-access/store/mug-store.store';

@Component({
  selector: 'app-mug-breadcrumb',
  standalone: true,
  imports: [CommonModule, NzBreadCrumbModule, TranslateModule],
  template: `
    <nz-breadcrumb class="tw-text-white tw-font-semibold [&_.ant-breadcrumb-separator]:tw-text-white">
      <nz-breadcrumb-item class="tw-text-white tw-uppercase">
        <span class="tw-underline tw-cursor-pointer" (click)="resetScanProcess()">MUG TRANSFERS</span>
      </nz-breadcrumb-item>
      <ng-container *ngIf="$item() as item">
        <nz-breadcrumb-item>
          <span>{{ item.barcode }}</span>
        </nz-breadcrumb-item>
        <nz-breadcrumb-item class="tw-text-white">
          <ng-container *ngIf="$currStep() as currStep">
            <span *ngIf="currStep === 'confirm-print'">{{ 'MUG.CONFIRM_PRINT' | translate | uppercase }}</span>
            <span *ngIf="currStep === 'scan-mug-bin'">{{ 'MUG.SCAN_MUG_BIN' | translate | uppercase }}</span>
            <span *ngIf="currStep === 'confirm-pick'">{{ 'MUG.CONFIRM_PICK' | translate | uppercase }}</span>
            <span *ngIf="currStep === 'scan-next-item'">{{ 'MUG.SCAN_ITEM' | translate | uppercase }}</span>
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
export class MugBreadcrumbComponent {
  mugStore = inject(MugStore);
  $item = this.mugStore.selectSignal(s => s.item);
  $currStep = this.mugStore.$currStep;

  resetScanProcess() {
    this.mugStore.patchState({ item: null, controlError: null });
  }
}
