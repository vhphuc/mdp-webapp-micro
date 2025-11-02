import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QaStepGroup } from '../../data-access/model/common/enum/qa-step-group';
import { QaItemInfoComponent } from './qa-item-info.component';
import { QaLeftImagePanelComponent } from './qa-left-image-panel.component';
import { QaScanItemComponent } from './qa-scan-item.component';
import { QaStepCooComponent } from './qa-step-coo.component';
import { QaStepFinalComponent } from './qa-step-final.component';
import { QaStepOduComponent } from './qa-step-odu.component';
import { QaStepPackageComponent } from './qa-step-package.component';
import { QaStepPackageInsertComponent } from './qa-step-package-insert.component';
import { QaStepSizeComponent } from './qa-step-size.component';
import { QaStepTrackingNumberComponent } from './qa-step-tracking-number.component';
import { TranslateModule } from '@ngx-translate/core';
import { QaStore } from './data-access/qa.store';
import { provideComponentStore } from '@ngrx/component-store';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { QaBreadcrumbComponent } from './qa-breadcrumb.component';
import { QaConfigComponent } from '../qa-config.component';
import { QaStepMugTicketComponent } from './qa-step-mug-ticket.component';
import { QaStepConfirmPickTicketComponent } from './qa-step-confirm-pick-ticket.component';
import { QaStepSockTrimComponent } from './qa-step-sock-trim.component';
import { QaStepConfirmSockTrimComponent } from './qa-step-confirm-sock-trim.component';

@Component({
  selector: 'app-qa-flow',
  standalone: true,
  imports: [
    CommonModule,
    QaItemInfoComponent,
    QaLeftImagePanelComponent,
    QaScanItemComponent,
    QaStepCooComponent,
    QaStepFinalComponent,
    QaStepOduComponent,
    QaStepPackageComponent,
    QaStepPackageInsertComponent,
    QaStepSizeComponent,
    QaStepTrackingNumberComponent,
    TranslateModule,
    AppLayoutComponent,
    QaBreadcrumbComponent,
    QaConfigComponent,
    QaStepMugTicketComponent,
    QaStepConfirmPickTicketComponent,
    QaStepSockTrimComponent,
    QaStepConfirmSockTrimComponent,
  ],
  providers: [provideComponentStore(QaStore)],
  template: `
    <app-layout appName="QA" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #configTplRef><app-qa-config /></ng-template>
      <ng-template #breadcrumbTplRef><app-qa-breadcrumb /></ng-template>
      <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="$isVipOrder()">
        <span class="tw-text-2xl tw-leading-relaxed tw-font-bold tw-text-white">{{ 'VIP_ORDER_MESSAGE' | translate }}</span>
      </div>
      <div class="tw-bg-red-500 tw-text-center tw-mb-1" *ngIf="$isShowXqcMessage()">
        <span class="tw-text-2xl tw-leading-relaxed tw-font-bold tw-text-white">{{ 'QA.XQC_MESSAGE' | translate }}</span>
      </div>
      <div class="tw-flex-1 tw-flex tw-gap-x-4">
        <div class="tw-w-1/3">
          <!-- Item Info -->
          <app-qa-item-info />
          <!-- Picture of all scannable step -->
          <app-qa-left-image-panel />
        </div>
        <!-- Main Panel -->
        <div class="tw-flex-1">
          @if ($currentScanStep() === null) {
            <app-qa-scan-item />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.ConfirmPickTicket) {
            <app-qa-step-confirm-pick-ticket />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.Size) {
            <app-qa-step-size />
          } @else if (
            $currentScanStep()!.groupType === QaStepGroup.OrderDetailUnit || $currentScanStep()!.groupType === QaStepGroup.DtfNeckLabelUnit
          ) {
            <app-qa-step-odu />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.SockTrim) {
            <app-qa-step-sock-trim />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.ConfirmSockTrim) {
            <app-qa-step-confirm-sock-trim />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.Package) {
            <app-qa-step-package />
          } @else if (
            $currentScanStep()!.groupType === QaStepGroup.PackagePickInsert ||
            $currentScanStep()!.groupType === QaStepGroup.PackagePrintInsert
          ) {
            <app-qa-step-package-insert />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.Coo) {
            <app-qa-step-coo />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.TrackingNumber) {
            <app-qa-step-tracking-number />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.ScanMugTicket) {
            <app-qa-step-mug-ticket />
          } @else if ($currentScanStep()!.groupType === QaStepGroup.Final) {
            <app-qa-step-final />
          }
        </div>
      </div>
    </app-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QaFlowComponent {
  qaStore = inject(QaStore);
  $isShowXqcMessage = this.qaStore.selectSignal(s => {
    if (!s.scanItemResp) return false;
    return !s.scanItemResp.shippingAlert && s.scanItemResp.xqc;
  });
  $isVipOrder = this.qaStore.selectSignal(s => {
    if (!s.scanItemResp) return false;
    return s.scanItemResp.isVipOrder;
  });
  $currentScanStep = this.qaStore.$currentScanStep;

  protected readonly QaStepGroup = QaStepGroup;
}
