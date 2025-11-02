import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgForOf, NgIf, NgOptimizedImage, NgStyle, UpperCasePipe } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NeckLabelStore } from '../data-access/store/neck-label.store';
import { provideComponentStore } from '@ngrx/component-store';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { NeckLabelBreadcrumbComponent } from '../ui/component/neck-label-breadcrumb.component';
import { NeckLabelConfigComponent } from './neck-label-config.component';
import { KeepFocusDirective } from '@shared/ui/directive/keep-focus.directive';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NeckLabelItemInfoComponent } from '../ui/component/neck-label-item-info.component';
import { NeckLabelPrintLocationsComponent } from '../ui/component/neck-label-print-locations.component';
import { NeckLabelStepScanItemComponent } from './neck-label-step-scan-item.component';
import { NeckLabelStepScanRegularAttributeComponent } from './neck-label-step-scan-regular-attribute.component';
import { NeckLabelStepScanDtfNlComponent } from './neck-label-step-scan-dtf-nl.component';
import { NeckLabelStepScanNextItemComponent } from './neck-label-step-scan-next-item.component';
import { NeckLabelStep } from '../data-access/model/ui/neck-label-step';

@Component({
  selector: 'app-neck-label',
  standalone: true,
  imports: [
    // Angular
    RouterModule,
    NgOptimizedImage,
    ReactiveFormsModule,
    NgIf,
    NgForOf,
    NgFor,
    NgStyle,
    AsyncPipe,
    NgClass,
    // Nz
    NzLayoutModule,
    NzMenuModule,
    NzIconModule,
    NzToolTipModule,
    NzDropDownModule,
    NzAvatarModule,
    NzInputModule,
    NzFormModule,
    NzTabsModule,
    NzBreadCrumbModule,
    NzSpinModule,
    // Others
    TranslateModule,
    // App
    AppLayoutComponent,
    NeckLabelBreadcrumbComponent,
    NeckLabelConfigComponent,
    KeepFocusDirective,
    NzTypographyModule,
    UpperCasePipe,
    ImageErrorUrlDirective,
    NeckLabelItemInfoComponent,
    NeckLabelPrintLocationsComponent,
    NeckLabelStepScanItemComponent,
    NeckLabelStepScanRegularAttributeComponent,
    NeckLabelStepScanDtfNlComponent,
    NeckLabelStepScanNextItemComponent,
  ],
  providers: [provideComponentStore(NeckLabelStore)],
  template: `
    <app-layout [appName]="'NECK_LABEL.NECK_LABEL' | translate" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #breadcrumbTplRef>
        <app-neck-label-breadcrumb />
      </ng-template>
      <ng-template #configTplRef>
        <app-neck-label-config />
      </ng-template>

      <div class="tw-flex-1 tw-flex tw-gap-6">
        <div class="tw-w-1/3 tw-flex tw-flex-col">
          <ng-container *ngIf="$scanItem() as scanItem">
            <!-- Priority and Jit -->
            <div class="tw-bg-yellow-300 tw-text-center" *ngIf="scanItem.isPriority">
              <span class="tw-text-2xl tw-font-bold">{{ 'NECK_LABEL.PRIORITY' | translate | uppercase }}</span>
            </div>
            <div class="tw-bg-blue-500 tw-text-center tw-mt-2" *ngIf="scanItem.isJit">
              <span class="tw-text-2xl tw-font-bold tw-text-white">{{ 'NECK_LABEL.JIT' | translate | uppercase }}</span>
            </div>
            <!-- Item Info -->
            <app-neck-label-item-info class="tw-mt-4" [scanItem]="scanItem" />
            <!-- Print Location -->
            <app-neck-label-print-locations class="tw-flex-1" />
          </ng-container>
        </div>
        <div class="tw-flex-1 tw-flex tw-flex-col">
          <app-neck-label-scan-item *ngIf="$currStep() === null" class="tw-flex-1" />
          <app-neck-label-step-scan-regular-attribute *ngIf="$currStep() === NeckLabelStep.RegularAttribute" class="tw-flex-1" />
          <app-neck-label-step-scan-dtf-nl *ngIf="$currStep() === NeckLabelStep.DtfNecklabel" class="tw-flex-1" />
          <app-neck-label-step-scan-next-item *ngIf="$currStep() === NeckLabelStep.ScanNextItem" class="tw-flex-1" />
        </div>
      </div>
    </app-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelComponent {
  nlStore = inject(NeckLabelStore);
  $currStep = this.nlStore.$currStep;
  $scanItem = this.nlStore.selectSignal(s => s.scanItem);

  protected readonly NeckLabelStep = NeckLabelStep;
}
