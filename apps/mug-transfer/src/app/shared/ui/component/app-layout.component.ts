import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { AppLanguageComponent } from '@shared/ui/component/app-language.component';
import { UserWidgetComponent } from '@shared/ui/component/app-user-widget.component';
import { NzSafeAny } from 'ng-zorro-antd/core/types';
import { NzGridModule } from 'ng-zorro-antd/grid';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    NzGridModule,
    UserWidgetComponent,
    AppLanguageComponent,
    UserWidgetComponent,
  ],
  template: `
    <div class="tw:flex tw:flex-col tw:h-full tw:bg-gray-200">
      <!-- header -->
      <div id="header" class="tw:h-20 tw:w-full">
        <div class="tw:flex tw:justify-between tw:items-center tw:h-12 tw:relative tw:bg-primary tw:shadow-xl">
          <div class="tw:flex">
            <div class="tw:flex tw:items-center tw:px-4">
              <img ngSrc="/assets/icons/logo-white.png" alt="logo" height="35" width="54" />
              <span class="tw:text-white tw:text-lg tw:leading-5 tw:inline-block tw:ml-2">Monster Platform</span>
            </div>
            <app-language />
          </div>

          <div class="tw:absolute tw:left-1/2">
            <span class="tw:font-bold tw:text-2xl tw:leading-6 tw:text-white">{{ appName | uppercase }}</span>
          </div>

          <app-user-widget />
        </div>
        <div class="tw:flex tw:justify-between tw:items-center tw:bg-primary tw:h-8 tw:px-4">
          <ng-container *ngTemplateOutlet="breadcrumbTplRef"></ng-container>
          <ng-container *ngTemplateOutlet="configTplRef"></ng-container>
        </div>
      </div>

      <div id="above-content" class="tw:mx-2" *ngIf="aboveContainerContentRef">
        <ng-container *ngTemplateOutlet="aboveContainerContentRef"></ng-container>
      </div>

      <!-- content -->
      <div id="content" class="tw:m-2 tw:p-2 tw:bg-white tw:flex-1 tw:overflow-y-auto tw:flex tw:flex-col">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayoutComponent {
  @Input({ required: true }) appName!: string;
  @Input({ required: true }) breadcrumbTplRef!: TemplateRef<NzSafeAny>;
  @Input({ required: true }) configTplRef!: TemplateRef<NzSafeAny>;
  @Input() aboveContainerContentRef: TemplateRef<NzSafeAny> | null = null;
}
