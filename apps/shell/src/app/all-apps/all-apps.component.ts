import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzIconExtraComponent } from '../shared/ui/component/nz-icon-extra.component';

@Component({
  selector: 'app-all-apps',
  standalone: true,
  imports: [NzIconModule, NzIconExtraComponent],
  template: `
    <div class="tw-h-full tw-flex tw-flex-col tw-justify-center tw-items-center">
      <div class="tw-mb-5 tw-font-bold tw-text-2xl">Choose <span class="tw-text-orange-600">Application</span></div>
      <div class="tw-flex tw-flex-wrap tw-items-center tw-justify-center tw-w-4/5">
        @for (app of allApps; track app.name) {
          <div
            class="tw-rounded tw-cursor-pointer tw-m-4 tw-p-1 tw-w-36 tw-h-24 tw-bg-orange-600 tw-text-center tw-text-white tw-flex tw-flex-col tw-justify-center"
            (click)="navigateTo(app.url)">
            <app-nz-icon-extra [icon]="app.icon" [iconClass]="'tw-text-white tw-text-2xl'"></app-nz-icon-extra>
            <span>{{ app.name }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllAppsComponent {
  allApps: { name: string; url: string; icon: string }[] = [
    {
      name: 'Necklabel App',
      url: `/neck-label/authentication`,
      icon: 'label',
    },
    {
      name: 'Washing App',
      url: `/washing/authentication`,
      icon: 'washing-dishes',
    },
    {
      name: 'Print Lead App',
      url: `/print-lead/authentication`,
      icon: 'printer',
    },
    {
      name: 'QA App',
      url: `/qa/authentication`,
      icon: 'audit',
    },
    {
      name: 'POD QA App',
      url: `/qa-pod/authentication`,
      icon: 'audit',
    },
    {
      name: 'QA Lead App',
      url: `/qa-lead/authentication`,
      icon: 'audit',
    },
    {
      name: 'Shipping App',
      url: `/shipping/authentication`,
      icon: 'shipping-truck',
    },
    {
      name: 'Trim App',
      url: `/trim/authentication`,
      icon: 'label',
    },
    {
      name: 'Mug Transfer App',
      url: `/mug-transfer/authentication`,
      icon: 'cup',
    },
    {
      name: 'Jit Receive App',
      url: `/jit-receive/authentication`,
      icon: 'receive',
    },
    {
      name: 'DTF Accessories App',
      url: `/dtf-hat/authentication`,
      icon: 'hat',
    },
    {
      name: 'Embroidery App',
      url: `/embroidery/authentication`,
      icon: 'needle',
    },
    {
      name: 'Hangtag App',
      url: `/hangtag/authentication`,
      icon: 'label',
    },
  ];

  navigateTo(url: string) {
    window.location.href = url;
  }
}
