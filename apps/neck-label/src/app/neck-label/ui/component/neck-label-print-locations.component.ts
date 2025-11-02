import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NeckLabelStore } from '../../data-access/store/neck-label.store';
import { NeckLabelStep } from '../../data-access/model/ui/neck-label-step';

@Component({
  selector: 'app-neck-label-print-locations',
  standalone: true,
  imports: [CommonModule, ImageErrorUrlDirective, NzTabsModule],
  host: {
    class: 'tw-flex tw-flex-col',
  },
  template: `
    <div class="tw-flex-1 tw-border-black tw-border-solid tw-border tw-relative tw-mt-3">
      <nz-tabset nzType="card" class="tw-h-full tw-p-4" nzSize="large" [nzTabBarGutter]="5" [nzSelectedIndex]="$currentTabIndex()">
        <nz-tab *ngFor="let tab of $locations()" [nzTitle]="titleTemplate">
          <ng-template #titleTemplate>
            <div class="tw-px-2 tw-h-6 tw-border tw-border-solid tw-font-semibold tw-text-sm tw-bg-white">
              {{ tab.description }}
            </div>
          </ng-template>

          <div class="tw-image-fill tw-h-full">
            <img [src]="tab.imageUrl" appImageErrorUrl />
          </div>
        </nz-tab>
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .ant-tabs-content {
        height: 100% !important;
        .ant-tabs-tabpane {
          height: 100% !important;
        }
      }
      :host ::ng-deep .ant-tabs-content .ant-layout-content {
        height: 100% !important;
      }
      :host ::ng-deep .ant-tabs-nav .ant-tabs-tab {
        padding: 0 !important;
        background-color: transparent;
        border: none;
      }
      :host ::ng-deep .ant-tabs-nav {
        position: absolute;
        z-index: 1;
        margin-bottom: 0;
        top: -13px;
        padding-left: 20px;
        width: 100%;
      }
      :host ::ng-deep .ant-tabs-nav::before {
        border-bottom: 0 !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NeckLabelPrintLocationsComponent {
  nlStore = inject(NeckLabelStore);
  $locations = this.nlStore.selectSignal<{ location: string; imageUrl: string; description: string; }[]>(s => {
    return [
      ...s.scanItem!.printLocations.map(pl => ({ location: pl.location, imageUrl: pl.imageUrl, description: pl.description })),
      ...(s.scanItem!.dtfNeckLabelStep && !s.scanItem!.dtfNeckLabelStep.isIgnoreScan
        ? [{ location: 'DTF Necklabel', imageUrl: s.scanItem!.dtfNeckLabelStep.previewUrl, description: 'DTF Necklabel' }]
        : []),
    ];
  });

  $currentTabIndex = computed(() => {
    const scanItem = this.nlStore.selectSignal(s => s.scanItem!)();
    const dtfNecklabelIndex = this.$locations().findIndex(l => l.location === 'DTF Necklabel');
    return this.nlStore.$currStep() === NeckLabelStep.DtfNecklabel || scanItem.dtfNeckLabelStep?.isScanned ? dtfNecklabelIndex : 0;
  });
}
