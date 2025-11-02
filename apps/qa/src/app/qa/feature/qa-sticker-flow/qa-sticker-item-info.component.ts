import { ChangeDetectionStrategy, Component, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzWaveModule } from 'ng-zorro-antd/core/wave';
import { TranslateModule } from '@ngx-translate/core';
import { QaItemGeneralInfo } from '../../data-access/model/ui/qa-item-general-info';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaStickerStore } from './data-access/qa-sticker.store';

@Component({
  selector: 'app-qa-sticker-item-info',
  standalone: true,
  imports: [CommonModule, NzButtonModule, NzGridModule, NzIconModule, NzWaveModule, TranslateModule],
  template: `
    <div class="" *ngIf="$itemInfo() as itemInfo">
      <div class="tw-bg-yellow-300 tw-text-center" *ngIf="itemInfo.isPriority">
        <span class="tw-text-2xl tw-font-bold">{{ 'QA.PRIORITY' | translate | uppercase }}</span>
      </div>
      <div nz-row>
        <div nz-col nzSpan="12">
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.PARTNER_ID' | translate }}: </span>
            <span class="tw-text-xl">{{ itemInfo.partnerId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.ORDER_#' | translate }}: </span> <span>{{ itemInfo.orderId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.PARTNER_ORDER_#' | translate }}: </span>
            <span class="tw-text-xl">{{ itemInfo.partnerOrderId }}</span>
          </div>
        </div>
        <div nz-col nzSpan="12">
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.BARCODE' | translate }}: </span> <span>{{ itemInfo.barcode }} </span>
            <span *ngIf="itemInfo.statusName">({{ itemInfo.statusName }})</span>
          </div>
          <div class="tw-text-xl" *ngIf="itemInfo.cooName">
            <span class="tw-font-semibold">{{ 'QA.COO' | translate }}: </span> <span>{{ itemInfo.cooName }}</span>
            <button
              nz-button
              nzType="default"
              class="tw-inline-block tw-ml-2"
              nzShape="circle"
              (click)="resetCoo()"
              *ngIf="itemInfo.cooName && itemInfo.isAllowChangeCoo && $isCurrStepAfterStepCoo()">
              <span nz-icon nzType="edit" nzTheme="outline"></span>
            </button>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.QUANTITY' | translate }}: </span> <span>{{ itemInfo.quantity }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.SLA_DATE' | translate }}: </span>
            <span>{{ itemInfo.slaDateOnUtc | date: 'MMM d' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerItemInfoComponent {
  qaStickerStore = inject(QaStickerStore);
  $itemInfo: Signal<Omit<QaItemGeneralInfo, 'sku'> | null> = this.qaStickerStore.selectSignal(state => {
    if (!state.sheet) return null;
    const sheet = state.sheet;
    const itemInfo: Omit<QaItemGeneralInfo, 'sku'> = {
      isPriority: sheet.isPriority,
      partnerId: sheet.customPartnerId,
      orderId: sheet.orderId,
      partnerOrderId: sheet.xid,
      barcode: sheet.sheetBarcode,
      status: sheet.status,
      statusName: sheet.statusDescription ?? '',
      isAllowChangeCoo: sheet.isAllowChangeCoo,
      cooName: sheet.coo?.name ?? null,
      quantity: 1,
      slaDateOnUtc: sheet.slaDateOnUtc,
      isJit: sheet.isJit,
      preQrCode: null,
    };

    return itemInfo;
  });

  $isCurrStepAfterStepCoo = this.qaStickerStore.selectSignal(s => {
    if (s.sheet!.shippingAlert) return false;
    const stepCooIndex = s.sheet!.steps.findIndex(st => st.groupType === QaStepGroup.Coo);
    const currStepIndex = s.sheet!.steps.findIndex(st => !st.isIgnoreScan && !st.isScanned);
    return currStepIndex > stepCooIndex;
  });

  resetCoo() {
    this.qaStickerStore.patchState(s => {
      const stepCoo = s.sheet?.steps.find(st => st.groupType === QaStepGroup.Coo);
      if (stepCoo) {
        stepCoo.isScanned = false;
      }
      return { ...s };
    });
  }
}
