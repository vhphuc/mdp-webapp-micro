import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { QaStore } from './data-access/qa.store';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaItemGeneralInfo } from '../../data-access/model/ui/qa-item-general-info';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-qa-item-info',
  standalone: true,
  imports: [CommonModule, NzGridModule, NzButtonModule, NzIconModule, TranslateModule],
  template: `
    @if ($itemInfo()) {
      <div class="tw-bg-yellow-300 tw-text-center" *ngIf="$itemInfo()!.isPriority">
        <span class="tw-text-2xl tw-font-bold">{{ 'QA.PRIORITY' | translate | uppercase }}</span>
      </div>
      <div class="tw-bg-blue-500 tw-text-center tw-mt-2" *ngIf="$itemInfo()!.isJit">
        <span class="tw-text-2xl tw-font-bold tw-text-white">{{ 'QA.JIT' | translate | uppercase }}</span>
      </div>
      <div nz-row>
        <div nz-col nzSpan="12">
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.PARTNER_ID' | translate }}: </span>
            <span class="tw-text-xl">{{ $itemInfo()!.partnerId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.ORDER_#' | translate }}: </span> <span>{{ $itemInfo()!.orderId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.PARTNER_ORDER_#' | translate }}: </span>
            <span class="tw-text-xl">{{ $itemInfo()!.partnerOrderId }}</span>
          </div>
        </div>
        <div nz-col nzSpan="12">
          <div class="tw-text-xl">
            @if ($itemInfo()!.preQrCode) {
              <span class="tw-font-semibold">{{ 'QA.PREQRCODE' | translate }}: </span> <span>{{ $itemInfo()!.preQrCode }} </span>
            } @else {
              <span class="tw-font-semibold">{{ 'QA.BARCODE' | translate }}: </span> <span>{{ $itemInfo()!.barcode }} </span>
            }
            <span *ngIf="$itemInfo()!.statusName">({{ $itemInfo()!.statusName }})</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.SKU' | translate }}: </span> <span>{{ $itemInfo()!.sku }}</span>
          </div>
          <div class="tw-text-xl" *ngIf="$itemInfo()!.cooName">
            <span class="tw-font-semibold">{{ 'QA.COO' | translate }}: </span> <span>{{ $itemInfo()!.cooName }}</span>
            <button
              nz-button
              nzType="default"
              class="tw-inline-block tw-ml-2"
              nzShape="circle"
              (click)="resetCoo()"
              *ngIf="$itemInfo()!.cooName && $itemInfo()!.isAllowChangeCoo && $isCurrStepAfterStepCoo()">
              <span nz-icon nzType="edit" nzTheme="outline"></span>
            </button>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.QUANTITY' | translate }}: </span> <span>{{ $itemInfo()!.quantity }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.SLA_DATE' | translate }}: </span>
            <span>{{ $itemInfo()!.slaDateOnUtc | date: 'MMM d' }}</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaItemInfoComponent {
  qaStore = inject(QaStore);
  $itemInfo: Signal<QaItemGeneralInfo | null> = this.qaStore.selectSignal(state => {
    if (!state.scanItemResp) return null;
    const scanItem = state.scanItemResp;
    const scanningOduStep = scanItem.steps.find(s => s.groupType === QaStepGroup.OrderDetailUnit);
    const itemInfo: QaItemGeneralInfo = {
      isPriority: scanItem.isPriority,
      partnerId: scanItem.customPartnerId,
      orderId: scanItem.orderId,
      partnerOrderId: scanItem.xid,
      barcode: scanningOduStep?.scanningOrderDetailUnit!.barcode ?? '',
      status: scanningOduStep?.scanningOrderDetailUnit!.status ?? null,
      statusName: scanningOduStep?.scanningOrderDetailUnit!.statusDescription ?? '',
      sku: scanningOduStep?.scanningOrderDetailUnit!.sku ?? '',
      isAllowChangeCoo: scanningOduStep?.scanningOrderDetailUnit!.isAllowChangeCoo ?? false,
      cooName: scanningOduStep!.scanningOrderDetailUnit!.coo?.name ?? null,
      quantity: 1,
      slaDateOnUtc: scanItem.slaDateOnUtc,
      isJit: scanItem.isJit,
      preQrCode: scanningOduStep?.scanningOrderDetailUnit!.preQrCode ?? '',
    };

    return itemInfo;
  });

  $isCurrStepAfterStepCoo = this.qaStore.selectSignal(s => {
    if (s.scanItemResp!.shippingAlert) return false;
    if (!s.scanItemResp!.steps.find(st => st.groupType === QaStepGroup.Coo)) return false;
    const stepCooIndex = s.scanItemResp!.steps.findIndex(st => st.groupType === QaStepGroup.Coo);
    const currStepIndex = s.scanItemResp!.steps.findIndex(st => !st.isIgnoreScan && !st.isScanned);
    return currStepIndex > stepCooIndex;
  });

  resetCoo() {
    this.qaStore.patchState(s => {
      const stepCoo = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.Coo);
      if (stepCoo) {
        stepCoo.isScanned = false;
      }
      return { ...s };
    });
  }
}
