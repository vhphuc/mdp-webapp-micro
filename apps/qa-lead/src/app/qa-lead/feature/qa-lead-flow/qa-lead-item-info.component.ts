import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { ItemTransitionStatus } from '@shared/data-access/model/api/enum/item-transition-status';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadItemGeneralInfo } from '../../data-access/model/ui/qa-lead-item-general-info';
import { QaLeadResetLocationType } from 'src/app/qa-lead/data-access/model/common/enum/qa-lead-reset-location-type';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { QaScanItemApi } from 'src/app/qa-lead/feature/qa-lead-flow/data-access/qa-api';
import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { StationType } from '@shared/data-access/model/api/enum/station-type';
import ScanningOrderDetailUnitAttribute = QaScanItemApi.ScanningOrderDetailUnitAttribute;

@Component({
  selector: 'app-qa-lead-item-info',
  standalone: true,
  imports: [
    CommonModule,
    NzGridModule,
    NzButtonModule,
    NzIconModule,
    TranslateModule,
    NzModalModule,
    NzPopoverModule,
    ImageErrorUrlDirective,
  ],
  template: `
    <div class="" *ngIf="$itemInfo() as itemInfo">
      <div class="tw-bg-yellow-300 tw-text-center" *ngIf="itemInfo.isPriority">
        <span class="tw-text-2xl tw-font-bold">{{ 'QA.PRIORITY' | translate | uppercase }}</span>
      </div>
      <div class="tw-bg-blue-500 tw-text-center tw-mt-2" *ngIf="itemInfo.isJit">
        <span class="tw-text-2xl tw-font-bold tw-text-white">{{ 'QA.JIT' | translate | uppercase }}</span>
      </div>
      <div nz-row>
        <div nz-col nzSpan="12">
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.PARTNER_ID' | translate }}: </span>
            <span class="tw-text-xl">{{ itemInfo.partnerId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.ORDER_#' | translate }}: </span>
            <span>{{ itemInfo.orderId }}</span>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.PARTNER_ORDER_#' | translate }}: </span>
            <span class="tw-text-xl">{{ itemInfo.partnerOrderId }}</span>
          </div>
        </div>
        <div nz-col nzSpan="12">
          <div class="tw-text-xl">
            @if ($itemInfo()!.preQrCode) {
              <span class="tw-font-semibold">{{ 'QA.PREQRCODE' | translate }}: </span>
              <span>{{ $itemInfo()!.preQrCode }} </span>
            } @else {
              <span class="tw-font-semibold">{{ 'QA.BARCODE' | translate }}: </span>
              <span>{{ $itemInfo()!.barcode }}</span>
            }
            <span *ngIf="itemInfo.statusName">({{ itemInfo.statusName }})</span>
            <button
              nz-button
              nzType="primary"
              nz-popover
              nzSize="small"
              class="tw-ml-1"
              [nzPopoverTitle]="resetQaSuccessPopoverTitle"
              [nzPopoverContent]="resetQaSuccessPopoverContent"
              *ngIf="
                itemInfo.isQaSuccessAll && itemInfo.status !== ItemTransitionStatus.ReadyToSort && $stationType() !== StationType.QaDtf
              ">
              Reset
              <ng-template #resetQaSuccessPopoverTitle>
                <span class="tw-font-semibold tw-text-xl">Choose location to reset</span>
              </ng-template>
              <ng-template #resetQaSuccessPopoverContent>
                <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-gap-2 tw-w-96">
                  <div
                    *ngFor="let location of $qaSuccessAttributes()"
                    class="tw-cursor-pointer hover:tw-border hover:tw-border-black hover:tw-border-solid tw-w-44 tw-h-44 tw-flex tw-flex-col tw-items-center tw-justify-center tw-p-1"
                    (click)="resetQaSuccess(location)">
                    <span class="tw-font-semibold tw-text-xl">{{ location.locationDescription }}</span>
                    <div class="tw-h-36 tw-w-full">
                      <img [src]="location.previewUrl" alt="location-img" appImageErrorUrl class="tw-w-full tw-h-full tw-object-contain" />
                    </div>
                  </div>
                </div>
              </ng-template>
            </button>
          </div>
          <div class="tw-text-xl">
            <span class="tw-font-semibold">{{ 'QA.SKU' | translate }}: </span> <span>{{ itemInfo.sku }}</span>
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
            <span class="tw-font-semibold">{{ 'QA.QUANTITY' | translate }}: </span>
            <span>{{ itemInfo.quantity }}</span>
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
export class QaLeadItemInfoComponent {
  qaLeadStore = inject(QaLeadStore);
  $itemInfo: Signal<QaLeadItemGeneralInfo | null> = this.qaLeadStore.selectSignal(state => {
    if (!state.scanItemResp) return null;
    const scanItem = state.scanItemResp;
    const scanningOduStep = scanItem.steps.find(s => s.groupType === QaStepGroup.OrderDetailUnit);
    const itemInfo: QaLeadItemGeneralInfo = {
      isPriority: scanItem.isPriority,
      partnerId: scanItem.customPartnerId,
      orderId: scanItem.orderId,
      partnerOrderId: scanItem.xid,
      barcode: scanningOduStep?.scanningOrderDetailUnit!.barcode ?? '',
      status: scanningOduStep?.scanningOrderDetailUnit!.status ?? null,
      statusName: scanningOduStep?.scanningOrderDetailUnit!.statusDescription ?? '',
      sku: scanningOduStep?.scanningOrderDetailUnit!.sku ?? '',
      cooName: scanningOduStep!.scanningOrderDetailUnit!.coo?.name ?? null,
      isAllowChangeCoo: scanningOduStep!.scanningOrderDetailUnit!.isAllowChangeCoo,
      quantity: 1,
      slaDateOnUtc: scanItem.slaDateOnUtc,
      isQaSuccessAll: scanningOduStep?.scanningOrderDetailUnit!.isQaSuccessAll ?? false,
      isJit: scanItem.isJit,
      preQrCode: scanningOduStep?.scanningOrderDetailUnit!.preQrCode ?? null,
      isSockPrint: scanningOduStep?.scanningOrderDetailUnit!.isSockPrint ?? false,
    };

    return itemInfo;
  });
  $stationType = computed(() => this.qaLeadStore.station()!.stationType);

  $qaSuccessAttributes = this.qaLeadStore.selectSignal(s => {
    const stepOdu = s.scanItemResp!.steps.find(st => st.groupType === QaStepGroup.OrderDetailUnit)!;
    return stepOdu.scanningOrderDetailUnit!.attributes;
  });

  $isCurrStepAfterStepCoo = this.qaLeadStore.selectSignal(s => {
    if (s.scanItemResp!.shippingAlert) return false;
    if (!s.scanItemResp!.steps.find(st => st.groupType === QaStepGroup.Coo)) return false;
    const stepCooIndex = s.scanItemResp!.steps.findIndex(st => st.groupType === QaStepGroup.Coo);
    const currStepIndex = s.scanItemResp!.steps.findIndex(st => !st.isIgnoreScan && !st.isScanned);
    return currStepIndex > stepCooIndex;
  });

  resetCoo() {
    this.qaLeadStore.patchState(s => {
      const stepCoo = s.scanItemResp?.steps.find(st => st.groupType === QaStepGroup.Coo);
      if (stepCoo) {
        stepCoo.isScanned = false;
      }
      return { ...s };
    });
  }

  resetQaSuccess(location: ScanningOrderDetailUnitAttribute) {
    if (this.$itemInfo()!.isSockPrint) {
      this.qaLeadStore.resetSockStatus({ resetType: QaLeadResetLocationType.ResetQaSuccess });
    } else {
      this.qaLeadStore.resetStatus({ resetType: QaLeadResetLocationType.ResetQaSuccess, locationName: location.locationName });
    }
  }

  protected readonly StationType = StationType;
  protected readonly ItemTransitionStatus = ItemTransitionStatus;
}
