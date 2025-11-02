import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { provideComponentStore } from '@ngrx/component-store';
import { QaLeadStickerStore } from './data-access/qa-lead-sticker.store';
import { QaStepGroup } from 'src/app/qa-lead/data-access/model/common/enum/qa-step-group';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { TranslateModule } from '@ngx-translate/core';
import { QaLeadConfigComponent } from '../qa-lead-config.component';
import { QaLeadStickerBreadcrumbComponent } from './qa-lead-sticker-breadcrumb.component';
import { QaLeadStickerScanSheetComponent } from './qa-lead-sticker-scan-sheet.component';
import { QaLeadStickerStepStickerStripScanComponent } from './qa-lead-sticker-step-sticker-strip-scan.component';
import { QaLeadStickerStepStickerStripConfirmComponent } from './qa-lead-sticker-step-sticker-strip-confirm.component';
import { QaLeadStickerStepCooComponent } from './qa-lead-sticker-step-coo.component';
import { QaLeadStickerStepPackageComponent } from './qa-lead-sticker-step-package.component';
import { QaLeadStickerStepTrackingNumberComponent } from './qa-lead-sticker-step-tracking-number.component';
import { QaLeadStickerStepFinalComponent } from './qa-lead-sticker-step-final.component';
import { QaLeadStickerItemInfoComponent } from './qa-lead-sticker-item-info.component';
import { QaLeadStickerLeftImagePanelComponent } from './qa-lead-sticker-left-image-panel.component';
import { QaLeadStickerStepStickerStripConfirmRejectComponent } from './qa-lead-sticker-step-sticker-strip-confirm-reject.component';

@Component({
  selector: 'app-qa-lead-sticker-flow',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    AppLayoutComponent,
    TranslateModule,
    QaLeadConfigComponent,
    QaLeadStickerBreadcrumbComponent,
    QaLeadStickerScanSheetComponent,
    QaLeadStickerStepStickerStripScanComponent,
    QaLeadStickerStepStickerStripConfirmComponent,
    QaLeadStickerStepCooComponent,
    QaLeadStickerStepPackageComponent,
    QaLeadStickerStepTrackingNumberComponent,
    QaLeadStickerStepFinalComponent,
    QaLeadStickerItemInfoComponent,
    QaLeadStickerLeftImagePanelComponent,
    QaLeadStickerStepStickerStripConfirmRejectComponent,
  ],
  providers: [provideComponentStore(QaLeadStickerStore)],
  template: `
    <app-layout appName="QA LEAD" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #configTplRef>
        <app-qa-lead-config />
      </ng-template>
      <ng-template #breadcrumbTplRef>
        <app-qa-lead-sticker-breadcrumb />
      </ng-template>
      <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="$isVipOrder()">
        <span class="tw-text-2xl tw-leading-relaxed tw-font-bold tw-text-white">{{ 'VIP_ORDER_MESSAGE' | translate }}</span>
      </div>
      <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="$isShowXqcMessage()">
        <span class="tw-text-2xl tw-leading-relaxed tw-font-bold tw-text-white">{{ 'QA.XQC_MESSAGE' | translate }}</span>
      </div>
      <div class="tw-flex-1 tw-flex tw-gap-x-4">
        <div class="tw-w-1/3 tw-flex tw-flex-col tw-gap-y-4">
          <!-- Item Info -->
          <app-qa-lead-sticker-item-info />
          <!-- Picture of all scannable step -->
          <app-qa-lead-sticker-left-image-panel />
        </div>
        <!-- Main Panel -->
        <div class="tw-flex-1">
          @switch ($currentScanStep()?.groupType) {
            @default {
              <app-qa-lead-sticker-scan-sheet />
            }
            @case (QaStepGroup.StickerGroup) {
              @if ($currStickerGroup() === null) {
                <app-qa-lead-sticker-step-sticker-strip-scan />
              } @else if ($currStickerGroup()!.scanningStickerGroup.isRejectWithoutConfirming) {
                <app-qa-lead-sticker-step-sticker-strip-confirm-reject />
              } @else {
                <app-qa-lead-sticker-step-sticker-strip-confirm />
              }
            }
            @case (QaStepGroup.Coo) {
              <app-qa-lead-sticker-step-coo />
            }
            @case (QaStepGroup.Package) {
              <app-qa-lead-sticker-step-package />
            }
            @case (QaStepGroup.TrackingNumber) {
              <app-qa-lead-sticker-step-tracking-number />
            }
            @case (QaStepGroup.Final) {
              <app-qa-lead-sticker-step-final />
            }
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadStickerFlowComponent {
  qaLeadStickerStore = inject(QaLeadStickerStore);
  $isShowXqcMessage = this.qaLeadStickerStore.selectSignal(s => {
    if (!s.sheet) return false;
    return !s.sheet.shippingAlert && s.sheet.xqc;
  });
  $isVipOrder = this.qaLeadStickerStore.selectSignal(s => {
    if (!s.sheet) return false;
    return s.sheet.isVipOrder;
  });
  $currentScanStep = this.qaLeadStickerStore.$currentScanStep;
  $currStickerGroup = this.qaLeadStickerStore.$currStickerGroup;

  protected readonly QaStepGroup = QaStepGroup;
}
