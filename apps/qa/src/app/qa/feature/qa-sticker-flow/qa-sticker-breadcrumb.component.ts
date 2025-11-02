import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { QaStickerStore } from './data-access/qa-sticker.store';

@Component({
  selector: 'app-qa-sticker-breadcrumb',
  standalone: true,
  imports: [CommonModule, NzBreadCrumbModule, TranslateModule],
  template: `
    <nz-breadcrumb class="tw-text-white tw-font-semibold">
      <nz-breadcrumb-item>
        <span class="tw-underline tw-cursor-pointer" (click)="resetScanProcess()">QA</span>
      </nz-breadcrumb-item>
      <nz-breadcrumb-item *ngIf="$sheetCode()">
        <span>{{ $sheetCode() }}</span>
      </nz-breadcrumb-item>
      <nz-breadcrumb-item class="tw-text-white tw-uppercase">
        <ng-container [ngSwitch]="$currentScanStep()?.groupType">
          <span *ngSwitchDefault>{{ 'QA.SCAN_SHEET' | translate }}</span>
          <span *ngSwitchCase="QaStepGroup.StickerGroup">{{ 'QA.SCAN_STICKER_STRIP' | translate | uppercase }}</span>
          <span *ngSwitchCase="QaStepGroup.Package">{{ 'QA.SCAN_PACKAGE' | translate }}</span>
          <span *ngSwitchCase="QaStepGroup.Coo">{{ 'QA.SCAN_COO' | translate }}</span>
          <span *ngSwitchCase="QaStepGroup.TrackingNumber">{{ 'QA.SCAN_TRACKING_#' | translate }}</span>
          <span *ngSwitchCase="QaStepGroup.Final">{{ 'QA.SCAN_SHEET' | translate }}</span>
        </ng-container>
      </nz-breadcrumb-item>
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
export class QaStickerBreadcrumbComponent {
  qaStickerStore = inject(QaStickerStore);
  $sheetCode = this.qaStickerStore.selectSignal(s => s.sheet?.sheetBarcode);
  $currentScanStep = this.qaStickerStore.$currentScanStep;

  resetScanProcess() {
    this.qaStickerStore.patchState({ sheet: null, controlError: null, apiStepMsg: null });
  }

  protected readonly QaStepGroup = QaStepGroup;
}
