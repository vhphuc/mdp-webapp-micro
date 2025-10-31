import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ImageErrorUrlDirective } from '@shared/ui/directive/image-error-url.directive';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { ScanBarcode } from '../hangtag.model';

@Component({
  selector: 'app-hangtag-location-attributes',
  standalone: true,
  imports: [ImageErrorUrlDirective, NzTabsModule],
  host: {
    class: 'tw:flex tw:flex-col',
  },
  template: `
    <div class="tw:flex-1 tw:border-black tw:border-solid tw:border tw:relative tw:mt-3">
      <nz-tabset nzType="card" class="tw:h-full tw:p-4" nzSize="large" [nzTabBarGutter]="5">
        @for (location of barcode.locationAttributes; track location.location) {
          <nz-tab [nzTitle]="titleTemplate">
            <ng-template #titleTemplate>
              <div class="tw:px-2 tw:h-6 tw:border tw:border-solid tw:font-semibold tw:text-sm tw:bg-white">
                {{ location.location }}
              </div>
            </ng-template>

            <div class="tw:image-fill tw:h-full">
              <img [src]="location.previewUrl" appImageErrorUrl />
            </div>
          </nz-tab>
        }
      </nz-tabset>
    </div>
  `,
  styles: [
    `
      :host ::ng-deep .ant-tabs-content {
        height: 100% !important;
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
export class HangtagLocationAttributesComponent {
  @Input({ required: true }) barcode!: ScanBarcode.Response;
}
