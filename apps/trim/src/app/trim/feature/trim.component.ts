import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from '@shared/ui/component/app-layout.component';
import { TrimConfigComponent } from './trim-config.component';
import { TrimBreadcrumbComponent } from '../ui/component/trim-breadcrumb.component';
import { TrimScanItemComponent } from './trim-scan-item.component';
import { provideComponentStore } from '@ngrx/component-store';
import { TrimStore } from '../data-access/store/trim.store';
import { TrimLeftPanelComponent } from './trim-left-panel.component';
import { TrimConfirmPickedTrimsComponent } from './trim-confirm-picked-trims.component';
import { TrimConfirmHangtagsComponent } from './trim-confirm-hangtags.component';
import { TrimConfirmStickerComponent } from './trim-confirm-sticker.component';
import { TrimScanNextItemComponent } from './trim-scan-next-item.component';
import { NzImageModule } from 'ng-zorro-antd/image';

@Component({
  selector: 'app-trim',
  standalone: true,
  imports: [
    CommonModule,
    AppLayoutComponent,
    TrimConfigComponent,
    TrimBreadcrumbComponent,
    TrimScanItemComponent,
    TrimLeftPanelComponent,
    TrimConfirmPickedTrimsComponent,
    TrimConfirmHangtagsComponent,
    TrimConfirmStickerComponent,
    TrimScanNextItemComponent,
    NzImageModule,
  ],
  providers: [provideComponentStore(TrimStore)],
  template: `
    <app-layout appName="Trim" [breadcrumbTplRef]="breadcrumbTplRef" [configTplRef]="configTplRef">
      <ng-template #breadcrumbTplRef><app-trim-breadcrumb /></ng-template>
      <ng-template #configTplRef><app-trim-config /></ng-template>

      <!-- Main -->
      <div class="tw-flex-1" *ngIf="$currStep() as currStep">
        <app-trim-scan-item *ngIf="currStep === 'scan-item'" />
        <div class="tw-flex tw-gap-4 tw-h-full" *ngIf="currStep !== 'scan-item'">
          <div class="tw-w-2/5">
            <app-trim-left-panel />
          </div>
          <div class="tw-flex-1">
            <app-trim-confirm-picked-trims *ngIf="$currStep() === 'confirm-picked-trims'" />
            <app-trim-confirm-hangtags *ngIf="$currStep() === 'confirm-hangtags'" />
            <app-trim-confirm-sticker *ngIf="$currStep() === 'confirm-sticker'" />
            <app-trim-scan-next-item *ngIf="$currStep() === 'scan-next-item'" />
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrimComponent {
  trimStore = inject(TrimStore);
  $currStep = this.trimStore.$currStep;
}
