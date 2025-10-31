import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AppLayoutComponent } from '../shared/ui/component/app-layout.component';
import { EmbroideryStore } from './embroidery.store';
import { StepConfirmItemComponent } from './step-confirm-item/step-confirm-item.component';
import { StepScanItemComponent } from './step-scan-item/step-scan-item.component';
import { EmbroideryBreadcrumbComponent } from './ui/embroidery-breadcrumb.component';
import { EmbroideryConfigComponent } from './ui/embroidery-config/embroidery-config.component';
import { EmbroideryItemInfoComponent } from './ui/embroidery-item-info.component';

@Component({
  selector: 'app-embroidery',
  standalone: true,
  imports: [
    AppLayoutComponent,
    EmbroideryBreadcrumbComponent,
    EmbroideryConfigComponent,
    EmbroideryItemInfoComponent,
    StepConfirmItemComponent,
    StepScanItemComponent,
  ],
  providers: [EmbroideryStore],
  template: `
    <app-layout [appName]="'EMBROIDERY'" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #breadcrumbTplRef>
        <app-embroidery-breadcrumb />
      </ng-template>
      <ng-template #configTplRef>
        <app-embroidery-config />
      </ng-template>

      <div class="tw:flex-1 tw:flex tw:gap-6">
        <div class="tw:w-1/3 tw:flex tw:flex-col">
          @if (item()) {
            <!-- Item Info -->
            <app-embroidery-item-info class="tw:mt-4 tw:flex-1" [item]="item()!" />
          }
        </div>
        <div class="tw:flex-1 tw:flex tw:flex-col">
          @switch (store.step()) {
            @case ('scan-item') {
              <app-step-scan-item class="tw:flex-1" />
            }
            @case ('confirm-item') {
              <app-step-confirm-item class="tw:flex-1" />
            }
          }
        </div>
      </div>
    </app-layout>
  `,
  
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmbroideryComponent {
  store = inject(EmbroideryStore);
  item = this.store.item;
}
