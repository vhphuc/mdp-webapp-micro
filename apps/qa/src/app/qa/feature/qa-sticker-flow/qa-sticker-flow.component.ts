import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { QaConfigComponent } from '../qa-config.component';
import { QaStickerBreadcrumbComponent } from './qa-sticker-breadcrumb.component';
import { TranslateModule } from '@ngx-translate/core';
import { QaStickerStore } from './data-access/qa-sticker.store';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaStickerScanSheetComponent } from './qa-sticker-scan-sheet.component';
import { QaStickerStepStickerStripScanComponent } from './qa-sticker-step-sticker-strip-scan.component';
import { QaStickerStepStickerStripConfirmComponent } from './qa-sticker-step-sticker-strip-confirm.component';
import { QaStickerStepCooComponent } from './qa-sticker-step-coo.component';
import { QaStickerStepPackageComponent } from './qa-sticker-step-package.component';
import { QaStickerStepTrackingNumberComponent } from './qa-sticker-step-tracking-number.component';
import { QaStickerStepFinalComponent } from './qa-sticker-step-final.component';
import { QaStickerItemInfoComponent } from './qa-sticker-item-info.component';
import { QaStickerLeftImagePanelComponent } from './qa-sticker-left-image-panel.component';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { provideComponentStore } from '@ngrx/component-store';

@Component({
  selector: 'app-qa-sticker-flow',
  standalone: true,
  imports: [
    CommonModule,
    NzModalModule,
    AppLayoutComponent,
    QaConfigComponent,
    TranslateModule,
    QaStickerBreadcrumbComponent,
    QaStickerScanSheetComponent,
    QaStickerStepStickerStripScanComponent,
    QaStickerStepStickerStripConfirmComponent,
    QaStickerStepCooComponent,
    QaStickerStepPackageComponent,
    QaStickerStepTrackingNumberComponent,
    QaStickerStepFinalComponent,
    QaStickerItemInfoComponent,
    QaStickerLeftImagePanelComponent,
  ],
  providers: [provideComponentStore(QaStickerStore)],
  template: `
    <app-layout appName="QA" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #configTplRef>
        <app-qa-config />
      </ng-template>
      <ng-template #breadcrumbTplRef>
        <app-qa-sticker-breadcrumb />
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
          <app-qa-sticker-item-info />
          <!-- Picture of all scannable step -->
          <app-qa-sticker-left-image-panel />
        </div>
        <!-- Main Panel -->
        <div class="tw-flex-1">
          @switch ($currentScanStep()?.groupType) {
            @default {
              <app-qa-sticker-scan-sheet />
            }
            @case (QaStepGroup.StickerGroup) {
              @if ($currGroupBarcode() === null) {
                <app-qa-sticker-step-stickerstrip-scan />
              } @else {
                <app-qa-sticker-step-stickerstrip-confirm />
              }
            }
            @case (QaStepGroup.Coo) {
              <app-qa-sticker-step-coo />
            }
            @case (QaStepGroup.Package) {
              <app-qa-sticker-step-package />
            }
            @case (QaStepGroup.TrackingNumber) {
              <app-qa-sticker-step-tracking-number />
            }
            @case (QaStepGroup.Final) {
              <app-qa-sticker-step-final />
            }
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaStickerFlowComponent {
  qaStickerStore = inject(QaStickerStore);
  $isShowXqcMessage = this.qaStickerStore.selectSignal(s => {
    if (!s.sheet) return false;
    return !s.sheet.shippingAlert && s.sheet.xqc;
  });
  $isVipOrder = this.qaStickerStore.selectSignal(s => {
    if (!s.sheet) return false;
    return s.sheet.isVipOrder;
  });
  $currentScanStep = this.qaStickerStore.$currentScanStep;
  $currGroupBarcode = this.qaStickerStore.$currGroupBarcode;

  protected readonly QaStepGroup = QaStepGroup;
}
