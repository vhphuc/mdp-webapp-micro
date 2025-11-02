import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { QaStore } from './data-access/qa.store';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';

@Component({
  selector: 'app-qa-breadcrumb',
  standalone: true,
  imports: [CommonModule, NzBreadCrumbModule, TranslateModule],
  template: `
    <nz-breadcrumb class="tw-text-white tw-font-semibold">
      <nz-breadcrumb-item>
        <span class="tw-underline tw-cursor-pointer" (click)="resetScanProcess()">QA</span>
      </nz-breadcrumb-item>
      @if ($barcode()) {
        <nz-breadcrumb-item>
          <span>{{ $barcode() }}</span>
        </nz-breadcrumb-item>
      }
      <nz-breadcrumb-item class="tw-text-white tw-uppercase">
        @switch ($currentScanStep()?.groupType) {
          @default {
            <span>{{ 'QA.SCAN_ITEM' | translate }}</span>
          }
          @case (QaStepGroup.ConfirmPickTicket) {
            <span>{{ '_CONFIRM_PICK_TICKET' | translate }}</span>
          }
          @case (QaStepGroup.SockTrim) {
            <span>{{ 'SCAN' | translate }} {{ '_TRIM' | translate}}</span>
          }
          @case (QaStepGroup.ConfirmSockTrim) {
            <span>{{ 'CONFIRM' | translate }} {{ '_TRIM' | translate}}</span>
          }
          @case (QaStepGroup.Size) {
            <span>{{ 'QA.SCAN_SIZE' | translate }}</span>
          }
          @case (QaStepGroup.OrderDetailUnit) {
            <span>{{ 'QA.CONFIRM_PRINT_LOCATION' | translate | uppercase }}</span>
          }
          @case (QaStepGroup.Package) {
            <span>{{ 'QA.SCAN_PACKAGE' | translate }}</span>
          }
          @case (QaStepGroup.PackagePrintInsert) {
            <span>{{ 'QA.SCAN_PACKAGE_INSERT' | translate }}</span>
          }
          @case (QaStepGroup.PackagePickInsert) {
            <span>{{ 'QA.SCAN_PACKAGE_INSERT' | translate }}</span>
          }
          @case (QaStepGroup.Coo) {
            <span>{{ 'QA.SCAN_COO' | translate }}</span>
          }
          @case (QaStepGroup.TrackingNumber) {
            <span>{{ 'QA.SCAN_TRACKING_#' | translate }}</span>
          }
          @case (QaStepGroup.Final) {
            <span>{{ 'QA.SCAN_ITEM' | translate }}</span>
          }
        }
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
export class QaBreadcrumbComponent {
  qaStore = inject(QaStore);
  $barcode = this.qaStore.selectSignal(
    s => {
      const odu = s.scanItemResp?.steps.find(step => step.groupType === QaStepGroup.OrderDetailUnit)?.scanningOrderDetailUnit;
      if (odu?.preQrCode) {
        return odu.preQrCode;
      }
      return odu?.barcode;
    }
  );
  $currentScanStep = this.qaStore.$currentScanStep;

  resetScanProcess() {
    this.qaStore.patchState({ scanItemResp: null, controlError: null, apiStepMsg: null });
  }

  protected readonly QaStepGroup = QaStepGroup;
}
