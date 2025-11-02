import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaStepGroup } from '../../../+qa/data-access/model/common/enum/qa-step-group';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { QaLeadBreadcrumbComponent } from './qa-lead-breadcrumb.component';
import { QaLeadConfigComponent } from '../qa-lead-config.component';
import { QaLeadItemInfoComponent } from './qa-lead-item-info.component';
import { QaLeadLeftImagePanelComponent } from './qa-lead-left-image-panel.component';
import { QaLeadScanItemComponent } from './qa-lead-scan-item.component';
import { QaLeadStepCooComponent } from './qa-lead-step-coo.component';
import { QaLeadStepFinalComponent } from './qa-lead-step-final.component';
import { QaLeadStepOduComponent } from './qa-lead-step-odu.component';
import { QaLeadStepPackageComponent } from './qa-lead-step-package.component';
import { QaLeadStepPackageInsertComponent } from './qa-lead-step-package-insert.component';
import { QaLeadStepTrackingNumberComponent } from './qa-lead-step-tracking-number.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideComponentStore } from '@ngrx/component-store';
import { QaLeadStore } from './data-access/qa-lead.store';
import { QaLeadStepMugTicketComponent } from './qa-lead-step-mug-ticket.component';
import { LocalStorageStore } from '@shared/data-access/store/local-storage.store';
import { QaPodConfigComponent } from '../../../+qa-pod/qa-pod-config.component';
import { QaLeadStepSockTrimComponent } from './qa-lead-step-sock-trim.component';
import { QaLeadStepConfirmPickTicketComponent } from './qa-lead-step-confirm-pick-ticket.component';
import { QaLeadStepConfirmSockTrimComponent } from "./qa-lead-step-confirm-sock-trim.component";

@Component({
  selector: 'app-qa-lead-flow',
  standalone: true,
  imports: [
    CommonModule,
    AppLayoutComponent,
    QaLeadBreadcrumbComponent,
    QaLeadConfigComponent,
    QaLeadItemInfoComponent,
    QaLeadLeftImagePanelComponent,
    QaLeadScanItemComponent,
    QaLeadStepCooComponent,
    QaLeadStepFinalComponent,
    QaLeadStepOduComponent,
    QaLeadStepPackageComponent,
    QaLeadStepPackageInsertComponent,
    QaLeadStepTrackingNumberComponent,
    TranslateModule,
    QaLeadStepMugTicketComponent,
    QaPodConfigComponent,
    QaLeadStepSockTrimComponent,
    QaLeadStepConfirmPickTicketComponent,
    QaLeadStepConfirmSockTrimComponent
],
  providers: [provideComponentStore(QaLeadStore)],
  template: `
    <app-layout [appName]="appName" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #breadcrumbTplRef><app-qa-lead-breadcrumb [appName]="appName" /></ng-template>
      <ng-template #configTplRef>
        <app-qa-lead-config *ngIf="!isFromPodQa" />
        <app-qa-pod-config *ngIf="isFromPodQa" />
      </ng-template>
      <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="$isVipOrder()">
        <span class="tw-text-2xl tw-leading-relaxed tw-font-bold tw-text-white">{{ 'VIP_ORDER_MESSAGE' | translate }}</span>
      </div>
      <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="$isShowXqcMessage()">
        <span class="tw-text-2xl tw-leading-relaxed tw-font-bold tw-text-white">{{ 'QA.XQC_MESSAGE' | translate }}</span>
      </div>
      <div class="tw-flex-1 tw-flex tw-gap-x-4">
        <div class="tw-w-1/3">
          <!-- Item Info -->
          <app-qa-lead-item-info />
          <!-- Picture of all scannable step -->
          <app-qa-lead-left-image-panel />
        </div>
        <!-- Main Panel -->
        <div class="tw-flex-1">
          @switch ($currentScanStep()?.groupType) {
            @default {
              <app-qa-lead-scan-item />
            }
            @case (QaStepGroup.OrderDetailUnit) {
              <app-qa-lead-step-odu />
            }
            @case (QaStepGroup.DtfNeckLabelUnit) {
              <app-qa-lead-step-odu />
            }
            @case (QaStepGroup.ConfirmPickTicket) {
              <app-qa-lead-step-confirm-pick-ticket />
            }
            @case (QaStepGroup.SockTrim) {
              <app-qa-lead-step-sock-trim />
            }
            @case (QaStepGroup.ConfirmSockTrim) {
              <app-qa-lead-step-confirm-sock-trim />
            }
            @case (QaStepGroup.Package) {
              <app-qa-lead-step-package />
            }
            @case (QaStepGroup.PackagePrintInsert) {
              <app-qa-lead-step-package-insert />
            }
            @case (QaStepGroup.PackagePickInsert) {
              <app-qa-lead-step-package-insert />
            }
            @case (QaStepGroup.Coo) {
              <app-qa-lead-step-coo />
            }
            @case (QaStepGroup.TrackingNumber) {
              <app-qa-lead-step-tracking-number />
            }
            @case (QaStepGroup.ScanMugTicket) {
              <app-qa-lead-step-mug-ticket />
            }
            @case (QaStepGroup.Final) {
              <app-qa-lead-step-final />
            }
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaLeadFlowComponent implements OnInit {
  @Input() isFromPodQa = false;
  @Input() appName = 'QA LEAD';

  qaLeadStore = inject(QaLeadStore);
  lsStore = inject(LocalStorageStore);

  $isShowXqcMessage = this.qaLeadStore.selectSignal(s => {
    if (!s.scanItemResp) return false;
    return !s.scanItemResp.shippingAlert && s.scanItemResp.xqc;
  });
  $isVipOrder = this.qaLeadStore.selectSignal(s => {
    if (!s.scanItemResp) return false;
    return s.scanItemResp.isVipOrder;
  });
  $currentScanStep = this.qaLeadStore.$currentScanStep;

  ngOnInit() {
    if (this.isFromPodQa) {
      this.qaLeadStore.factory = this.lsStore.selectSignal(s => s.qaPodConfig?.factory);
      this.qaLeadStore.station = this.lsStore.selectSignal(s => s.qaPodConfig?.station);
    }
  }

  protected readonly QaStepGroup = QaStepGroup;
}
