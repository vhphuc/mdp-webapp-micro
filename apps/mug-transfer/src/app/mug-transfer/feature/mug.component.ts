import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { MugBreadcrumbComponent } from '../ui/component/mug-breadcrumb.component';
import { MugConfigComponent } from './mug-config.component';
import { MugLeftPanelComponent } from './mug-left-panel.component';
import { provideComponentStore } from '@ngrx/component-store';
import { MugStore } from '../data-access/store/mug-store.store';
import { MugScanItemComponent } from './mug-scan-item.component';
import { MugScanConfirmPrintComponent } from './mug-scan-confirm-print.component';
import { MugScanMugBinComponent } from './mug-scan-mug-bin.component';
import { MugScanConfirmPickComponent } from './mug-scan-confirm-pick.component';
import { MugScanNextItemComponent } from './mug-scan-next-item.component';
import { NzImageModule } from 'ng-zorro-antd/image';

@Component({
  selector: 'app-mug',
  standalone: true,
  imports: [
    CommonModule,
    AppLayoutComponent,
    MugBreadcrumbComponent,
    MugConfigComponent,
    MugLeftPanelComponent,
    MugScanItemComponent,
    MugScanConfirmPrintComponent,
    MugScanMugBinComponent,
    MugScanConfirmPickComponent,
    MugScanNextItemComponent,
    NzImageModule,
  ],
  providers: [provideComponentStore(MugStore)],
  template: `
    <app-layout appName="Mug Transfers" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #breadcrumbTplRef><app-mug-breadcrumb /></ng-template>
      <ng-template #configTplRef><app-mug-config /></ng-template>

      <!-- Main -->
      <div class="tw-flex-1" *ngIf="$currStep() as currStep">
        <app-mug-scan-item *ngIf="currStep === 'scan-item'" />
        <div class="tw-flex tw-gap-4 tw-h-full" *ngIf="currStep !== 'scan-item'">
          <div class="tw-w-2/5">
            <app-mug-left-panel />
          </div>
          <div class="tw-flex-1">
            <app-mug-scan-confirm-print *ngIf="$currStep() === 'confirm-print'" />
            <app-mug-scan-mug-bin *ngIf="$currStep() === 'scan-mug-bin'" />
            <app-mug-scan-confirm-pick *ngIf="$currStep() === 'confirm-pick'" />
            <app-mug-scan-next-item *ngIf="$currStep() === 'scan-next-item'" />
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MugComponent {
  mugStore = inject(MugStore);
  $currStep = this.mugStore.$currStep;
}
