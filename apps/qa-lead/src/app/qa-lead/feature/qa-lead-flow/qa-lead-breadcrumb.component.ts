import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadStore } from './data-access/qa-lead.store';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';
import { QaStepGroup } from '../../../+qa/data-access/model/common/enum/qa-step-group';

@Component({
  selector: 'app-qa-lead-breadcrumb',
  standalone: true,
  imports: [CommonModule, NzBreadCrumbModule, TranslateModule],
  template: `
    <nz-breadcrumb class="tw-text-white tw-font-semibold">
      <nz-breadcrumb-item>
        <span class="tw-underline tw-cursor-pointer tw-uppercase" (click)="resetScanProcess()">{{ appName }}</span>
      </nz-breadcrumb-item>
      @if ($barcode()) {
        <nz-breadcrumb-item>
          <span>{{ $barcode() }}</span>
        </nz-breadcrumb-item>
      }
      <nz-breadcrumb-item class="tw-text-white tw-uppercase">
        @switch ($currentScanStep()?.groupType) {
          @default {
            <span class="tw-text-white">{{ 'QA.SCAN_ITEM' | translate }}</span>
          }
          @case (QaStepGroup.OrderDetailUnit) {
            <span class="tw-text-white">
              @if ($currentScanStep()!.scanningOrderDetailUnit!.status === ItemTransitionStatus.QaFailure) {
                {{ 'QA.CONFIRM_REJECT' | translate }}
              } @else {
                {{ 'QA.CONFIRM_PRINT_LOCATION' | translate }}
              }
            </span>
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
          @case (QaStepGroup.Package) {
            <span class="tw-text-white">{{ 'QA.SCAN_PACKAGE' | translate }}</span>
          }
          @case (QaStepGroup.PackagePrintInsert) {
            <span class="tw-text-white">{{ 'QA.SCAN_PACKAGE_INSERT' | translate }}</span>
          }
          @case (QaStepGroup.PackagePickInsert) {
            <span class="tw-text-white">{{ 'QA.SCAN_PACKAGE_INSERT' | translate }}</span>
          }
          @case (QaStepGroup.Coo) {
            <span class="tw-text-white">{{ 'QA.SCAN_COO' | translate }}</span>
          }
          @case (QaStepGroup.TrackingNumber) {
            <span class="tw-text-white">{{ 'QA.SCAN_TRACKING_#' | translate }}</span>
          }
          @case (QaStepGroup.Final) {
            <span class="tw-text-white">{{ 'QA.SCAN_ITEM' | translate }}</span>
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
export class QaLeadBreadcrumbComponent {
  @Input() appName = 'QA LEAD';

  qaLeadStore = inject(QaLeadStore);
  $barcode = this.qaLeadStore.selectSignal(s => {
    const odu = s.scanItemResp?.steps.find(step => step.groupType === QaStepGroup.OrderDetailUnit)?.scanningOrderDetailUnit;
    if (odu?.preQrCode) {
      return odu.preQrCode;
    }
    return odu?.barcode;
  });
  $currentScanStep = this.qaLeadStore.$currentScanStep;

  resetScanProcess() {
    this.qaLeadStore.patchState({ scanItemResp: null, controlError: null, apiStepMsg: null, resetStatusApiStepMsg: null });
    this.qaLeadStore.$showRemoveShipAlert.set(false);
  }

  protected readonly ItemTransitionStatus = ItemTransitionStatus;
  protected readonly QaStepGroup = QaStepGroup;
}
